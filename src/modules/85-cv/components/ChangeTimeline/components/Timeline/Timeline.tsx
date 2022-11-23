/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { TimelineBar } from '@cv/components/TimelineView/TimelineBar'
import type { TimelineProps } from './Timeline.types'
import { TimelineRow } from '../TimelineRow/TimelineRow'
import css from './Timeline.module.scss'

export function Timeline(props: TimelineProps): JSX.Element {
  const { timelineRows, timestamps = [], labelWidth, isLoading, rowOffset, hideTimeline } = props
  const { getString } = useStrings()
  return (
    <Container className={css.main}>
      {timelineRows?.map((timelineProps, index) => {
        return (
          <TimelineRow
            isLoading={isLoading}
            noDataMessage={timelineProps.noDataMessage}
            startTimestamp={timestamps[0]}
            endTimestamp={timestamps[timestamps?.length - 1]}
            labelWidth={labelWidth}
            {...timelineProps}
            leftOffset={rowOffset}
            key={`${timelineProps.labelName}-${index}`}
            hideTimeline={hideTimeline}
          />
        )
      })}
      {hideTimeline ? null : (
        <Container className={css.timelineChartContainer}>
          <Text className={css.timelineLabel} width={labelWidth}>
            {getString('cv.timeline').toUpperCase()}
          </Text>
          <TimelineBar startDate={timestamps?.[0]} endDate={timestamps?.[timestamps.length - 1]} columnWidth={65} />
        </Container>
      )}
    </Container>
  )
}
