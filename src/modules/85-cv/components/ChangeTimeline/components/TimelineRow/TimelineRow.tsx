/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useRef, useLayoutEffect, useState } from 'react'
import { Container, Text } from '@harness/uicore'
import moment from 'moment'
import { Popover, PopoverInteractionKind, PopoverPosition } from '@blueprintjs/core'
import type { TimelineDataPoint, TimelineRowProps } from './TimelineRow.types'
import { getDataWithPositions } from './TimelineRow.utils'
import TimelineRowLoading from './components/TimelineRowLoading'
import TimelineRowNoData from './components/TimelineRowNoData'
import { DATE_FORMAT } from './TimelineRow.constants'
import css from './TimelineRow.module.scss'

export function TimelineRow(props: TimelineRowProps): JSX.Element {
  const {
    labelName,
    labelWidth,
    data,
    isLoading,
    noDataMessage,
    leftOffset = 0,
    startTimestamp,
    endTimestamp,
    hideTimeline
  } = props
  const timelineRowRef = useRef<HTMLDivElement>(null)
  const [dataWithPositions, setDataWithPositions] = useState<TimelineDataPoint[]>([])

  useLayoutEffect(() => {
    if (!timelineRowRef?.current) {
      return
    }
    const containerWidth = (timelineRowRef.current.parentElement?.getBoundingClientRect().width || 0) - leftOffset
    setDataWithPositions(getDataWithPositions(containerWidth, startTimestamp, endTimestamp, data))
  }, [timelineRowRef?.current, data, endTimestamp, startTimestamp])

  const renderTimelineRow = useMemo(() => {
    if (isLoading) {
      return <TimelineRowLoading loadingBlockWidth={hideTimeline ? '20px' : '75px'} />
    } else if (noDataMessage) {
      return <TimelineRowNoData noDataMessage={noDataMessage} />
    }
    return (
      <>
        <hr />
        {dataWithPositions?.map((datum, index) => {
          const { icon, leftOffset: position, startTime, tooltip } = datum
          return (
            <Container
              key={`${datum.startTime}-${position}-${index}`}
              className={css.event}
              style={{ left: position, height: icon.height, width: icon.width }}
            >
              <Popover
                interactionKind={PopoverInteractionKind.HOVER}
                popoverClassName={css.timelineRowPopover}
                position={PopoverPosition.TOP}
                minimal
                content={
                  <Container className={css.tooltipContainer}>
                    <Container className={css.colorSidePanel} style={{ backgroundColor: tooltip?.sideBorderColor }} />
                    <Text>{tooltip?.message}</Text>
                    <Text>{moment(new Date(startTime)).format(DATE_FORMAT)}</Text>
                  </Container>
                }
              >
                {icon.url === 'diamond' ? (
                  <Container
                    className={css.singleEvent}
                    style={{ background: icon.fillColor, width: icon.width, height: icon.height }}
                  />
                ) : (
                  <svg height={icon.height} width={icon.width}>
                    <image href={icon.url} height={icon.height} width={icon.width} fill={icon.fillColor} />
                  </svg>
                )}
              </Popover>
            </Container>
          )
        })}
      </>
    )
  }, [isLoading, noDataMessage, dataWithPositions, hideTimeline])

  return (
    <Container className={css.main} ref={timelineRowRef}>
      <Container key={labelName} className={css.timelineRow}>
        <Text lineClamp={1} width={labelWidth} className={css.rowLabel}>
          {labelName}
        </Text>
        <Container className={css.timeline}>{renderTimelineRow}</Container>
      </Container>
    </Container>
  )
}
