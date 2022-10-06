/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { defaultTo } from 'lodash-es'
import { endOfDay, TimeRangeSelectorProps } from '@common/components/TimeRangeSelector/TimeRangeSelector'

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
