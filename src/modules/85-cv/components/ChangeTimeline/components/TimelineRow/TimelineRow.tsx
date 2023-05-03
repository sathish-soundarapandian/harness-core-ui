/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useRef, useLayoutEffect, useState, useEffect } from 'react'
import { Container, Text } from '@harness/uicore'
import { isEmpty } from 'lodash-es'
import type { TimelineDataPoint, TimelineRowProps } from './TimelineRow.types'
import {
  getDataWithPositions,
  getWidgetsGroupedWithStartTime,
  isWidgetWithSameStartTime,
  isWidgetWithUniqStartTime
} from './TimelineRow.utils'
import TimelineRowLoading from './components/TimelineRowLoading'
import DownTime from './components/DownTime/DownTime'
import Annotation from './components/Annotation/Annotation'
import DefaultWidget from './components/DefaultWidget/DefaultWidget'
import WidgetsWithSameStartTime from './components/WidgetsWithSameStartTime/WidgetsWithSameStartTime'
import { SLO_WIDGETS } from './TimelineRow.constants'
import ErrorBudgetReset from './components/ErrorBudgetReset/ErrorBudgetReset'
import DataCollectionFailure from './components/DataCollectionFailure/DataCollectionFailure'
import css from './TimelineRow.module.scss'

export function TimelineRow(props: TimelineRowProps): JSX.Element {
  const {
    labelName,
    labelWidth,
    data,
    isLoading,
    leftOffset = 0,
    startTimestamp,
    endTimestamp,
    hideTimeline,
    addAnnotation,
    fetchSecondaryEvents
  } = props
  const timelineRowRef = useRef<HTMLDivElement>(null)
  const [dataWithPositions, setDataWithPositions] = useState<TimelineDataPoint[]>([])
  const [dataGroupedWithStartTime, setDataGroupedWithStartTime] = useState<{ [key: string]: TimelineDataPoint[] }>({})

  useLayoutEffect(() => {
    if (!timelineRowRef?.current) {
      return
    }
    const containerWidth = (timelineRowRef.current.parentElement?.getBoundingClientRect().width || 0) - leftOffset
    setDataWithPositions(getDataWithPositions(containerWidth, startTimestamp, endTimestamp, data))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timelineRowRef?.current, data, endTimestamp, startTimestamp, leftOffset])

  useEffect(() => {
    const widgetsGroupedWithStartTime: { [key: string]: TimelineDataPoint[] } =
      getWidgetsGroupedWithStartTime(dataWithPositions)
    setDataGroupedWithStartTime(widgetsGroupedWithStartTime)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataWithPositions])

  const renderTimelineRow = useMemo(() => {
    if (isLoading) {
      return <TimelineRowLoading loadingBlockWidth={hideTimeline ? '20px' : '75px'} />
    }
    return (
      <>
        <hr />
        {!isEmpty(dataGroupedWithStartTime)
          ? Object.keys(dataGroupedWithStartTime).map((startTime, index) => {
              const widgets = dataGroupedWithStartTime[startTime]
              const widget = widgets[0]
              if (isWidgetWithUniqStartTime(dataGroupedWithStartTime, startTime, startTimestamp, endTimestamp)) {
                const { type } = widget
                switch (type) {
                  case SLO_WIDGETS.DOWNTIME:
                    return <DownTime index={index} widget={widget} />
                  case SLO_WIDGETS.ANNOTATION:
                    return (
                      <Annotation
                        index={index}
                        widget={widget}
                        addAnnotation={addAnnotation}
                        fetchSecondaryEvents={fetchSecondaryEvents}
                      />
                    )
                  case SLO_WIDGETS.ERROR_BUDGET_RESET:
                    return <ErrorBudgetReset index={index} widget={widget} />
                  case SLO_WIDGETS.DATA_COLLECTION_FAILURE:
                    return <DataCollectionFailure index={index} widget={widget} />
                  default:
                    return <DefaultWidget index={index} widget={widget} />
                }
              } else if (isWidgetWithSameStartTime(dataGroupedWithStartTime, startTime, startTimestamp, endTimestamp)) {
                return (
                  <WidgetsWithSameStartTime
                    index={index}
                    widgets={widgets}
                    addAnnotation={addAnnotation}
                    fetchSecondaryEvents={fetchSecondaryEvents}
                    startTimeForWidgets={Number(startTime)}
                  />
                )
              } else {
                return null
              }
            })
          : null}
      </>
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, dataGroupedWithStartTime, hideTimeline, startTimestamp])

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
