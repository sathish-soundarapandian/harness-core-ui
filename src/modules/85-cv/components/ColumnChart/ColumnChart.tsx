/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useLayoutEffect, useRef, useState } from 'react'
import { Classes, PopoverInteractionKind, PopoverPosition } from '@blueprintjs/core'
import cx from 'classnames'
import { Text, Container, Popover, PageError, NoDataCard } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import noDataImage from '@cv/assets/noData.svg'
import type { ColumnChartProps } from './ColumnChart.types'
import { calculatePositionForTimestamp, getColumnPositions, getLoadingColumnPositions } from './ColumnChart.utils'
import { COLUMN_WIDTH, COLUMN_HEIGHT, TOTAL_COLUMNS, LOADING_COLUMN_HEIGHTS } from './ColumnChart.constants'
import ColumnChartPopoverContent from './components/ColumnChartPopoverContent/ColumnChartPopoverContent'
import ColumnChartEventMarker from './components/ColummnChartEventMarker/ColumnChartEventMarker'
import css from './ColumnChart.module.scss'

export default function ColumnChart(props: ColumnChartProps): JSX.Element {
  const {
    data,
    leftOffset = 0,
    columnWidth = COLUMN_WIDTH,
    isLoading,
    error,
    refetchOnError,
    columnHeight = COLUMN_HEIGHT,
    timestampMarker,
    hasTimelineIntegration,
    duration
  } = props
  const containerRef = useRef<HTMLDivElement>(null)
  const [cellPositions, setCellPositions] = useState<number[]>(Array(TOTAL_COLUMNS).fill(null))
  const [markerPosition, setMarkerPosition] = useState<number | undefined>()
  const { getString } = useStrings()

  useLayoutEffect(() => {
    if (!containerRef?.current) return
    const containerWidth = (containerRef.current.parentElement?.getBoundingClientRect().width || 0) - leftOffset
    if (isLoading) {
      setCellPositions(getLoadingColumnPositions(containerWidth))
    } else {
      setCellPositions(getColumnPositions(containerWidth, data))
    }

    if (timestampMarker && data?.[data.length - 1]?.timeRange?.endTime && data[0]?.timeRange?.startTime) {
      setMarkerPosition(
        calculatePositionForTimestamp({
          containerWidth,
          startTime: timestampMarker.timestamp,
          endOfTimestamps: data[data.length - 1].timeRange.endTime,
          startOfTimestamps: data[0].timeRange.startTime
        })
      )
    }
  }, [containerRef?.current, data, isLoading])

  if (error) {
    return <PageError message={getErrorMessage(error)} onClick={refetchOnError} />
  }

  if (isLoading) {
    return (
      <div ref={containerRef} className={css.main}>
        {cellPositions.map((val, index) => (
          <div
            key={index}
            style={{
              left: val,
              height: Math.floor((LOADING_COLUMN_HEIGHTS[index] / 100) * columnHeight),
              width: columnWidth
            }}
            className={cx(css.column, Classes.SKELETON)}
          />
        ))}
      </div>
    )
  }

  if (!data?.length || data.every(el => el?.height === 0)) {
    return (
      <NoDataCard
        message={
          <>
            <Text font={{ size: 'small' }}>
              {getString('cv.monitoredServices.serviceHealth.noDataAvailableForHealthScore', {
                duration: duration?.label?.toLowerCase()
              })}
            </Text>
            {hasTimelineIntegration && (
              <Text font={{ size: 'small' }}>
                {getString('cv.monitoredServices.serviceHealth.pleaseSelectAnotherTimeWindow')}
              </Text>
            )}
          </>
        }
        image={noDataImage}
        imageClassName={css.noDataImage}
        containerClassName={css.noData}
      />
    )
  }

  return (
    <div ref={containerRef} className={css.main}>
      {markerPosition && (
        <ColumnChartEventMarker
          columnHeight={columnHeight}
          leftOffset={markerPosition}
          markerColor={timestampMarker?.color || ''}
        />
      )}
      {cellPositions.map((position, index) => {
        const cell = data?.[index] || {}
        return (
          <div
            key={index}
            className={css.column}
            style={{
              backgroundColor: cell.color,
              left: position || 0,
              height: Math.floor(((cell.height || 0) / 100) * columnHeight),
              width: columnWidth
            }}
          >
            <Popover
              content={<ColumnChartPopoverContent cell={cell} />}
              position={PopoverPosition.TOP}
              popoverClassName={css.chartPopover}
              interactionKind={PopoverInteractionKind.HOVER}
            >
              <Container height={columnHeight} width={columnWidth} />
            </Popover>
          </div>
        )
      })}
    </div>
  )
}
