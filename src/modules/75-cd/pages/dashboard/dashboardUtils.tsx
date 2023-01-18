/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo, isUndefined } from 'lodash-es'
import { IconName, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { Popover, PopoverInteractionKind, Position, Classes } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import { endOfDay, TimeRangeSelectorProps } from '@common/components/TimeRangeSelector/TimeRangeSelector'
import { INVALID_CHANGE_RATE } from '@cd/components/Services/common'

export function getFormattedTimeRange(timeRange: TimeRangeSelectorProps | null): [number, number] {
  const startTime = defaultTo(timeRange?.range[0]?.getTime(), 0)
  //changing endtime from startofDay to EOD
  const endTime = endOfDay(defaultTo(timeRange?.range[1]?.getTime(), 0))

  return [startTime, endTime]
}

//convert to valid Date format if string
export const convertStringToDateTimeRange = (timeRange: TimeRangeSelectorProps): TimeRangeSelectorProps => {
  return {
    ...timeRange,
    range:
      typeof timeRange.range[0] === 'string'
        ? [new Date(defaultTo(timeRange.range[0], '')), new Date(defaultTo(timeRange.range[1], ''))]
        : [...timeRange.range]
  }
}

export enum RateTrend {
  UP = 'UP_TREND',
  DOWN = 'DOWN_TREND',
  NOCHANGE = 'NO_CHANGE',
  INVALID = 'INVALID'
}

export const calcTrend = (value: number | undefined): RateTrend => {
  if (isUndefined(value) || value === INVALID_CHANGE_RATE) {
    return RateTrend.INVALID
  }
  if (value > 0) {
    return RateTrend.UP
  } else if (value < 0) {
    return RateTrend.DOWN
  } else if (value === 0) {
    return RateTrend.NOCHANGE
  } else {
    return RateTrend.INVALID
  }
}

export const calcTrendColor = (trend: RateTrend): string => {
  switch (trend) {
    case RateTrend.UP:
      return 'var(--green-500)'
    case RateTrend.DOWN:
      return 'var(--ci-color-red-500)'
    default:
      return 'var(--grey-500)'
  }
}

export const calcTrendCaret = (trend: RateTrend): IconName => {
  switch (trend) {
    case RateTrend.UP:
      return 'caret-up'
    case RateTrend.DOWN:
      return 'caret-down'
    default:
      return 'caret-right'
  }
}

interface TrendPopoverProps {
  trend: RateTrend
  children: JSX.Element
}

export function TrendPopover(props: TrendPopoverProps): React.ReactElement {
  const { getString } = useStrings()
  const trendMessage = (): string => {
    switch (props.trend) {
      case RateTrend.UP:
        return getString('cd.trendMessage.upTrend')
      case RateTrend.DOWN:
        return getString('cd.trendMessage.downTrend')
      case RateTrend.NOCHANGE:
        return getString('cd.trendMessage.noChangeTrend')
      case RateTrend.INVALID:
        return getString('cd.trendMessage.invalidTrend')
    }
  }

  return (
    <Popover
      interactionKind={PopoverInteractionKind.HOVER}
      popoverClassName={Classes.DARK}
      modifiers={{ preventOverflow: { escapeWithReference: true } }}
      position={Position.LEFT_BOTTOM}
      content={
        <Text padding="medium" color={Color.WHITE} width={250}>
          {trendMessage()}
        </Text>
      }
    >
      {props.children}
    </Popover>
  )
}
