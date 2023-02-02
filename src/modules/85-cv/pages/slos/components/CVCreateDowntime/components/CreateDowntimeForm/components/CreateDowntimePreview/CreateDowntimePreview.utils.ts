/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { DowntimeForm } from '@cv/pages/slos/components/CVCreateDowntime/CVCreateDowntime.types'
import { DowntimeWindowToggleViews } from '../../CreateDowntimeForm.types'

export const getSummaryData = (data: DowntimeForm): string[] => {
  const { timezone, startTime } = data
  let value = `Starting on ${startTime} (${timezone}) `
  if (data.type === DowntimeWindowToggleViews.ONE_TIME) {
    if (data.endTimeMode === 'Duration') {
      const { durationValue, durationType } = data
      value += `for ${durationValue} ${durationType}`
    } else {
      value += `till ${data.endTime}`
    }
    return [value]
  } else {
    const { durationValue, durationType, recurrenceValue, recurrenceType, recurrenceEndTime } = data
    value += `for ${durationValue} ${durationType}`
    return [value, `Repeats after ${recurrenceValue} ${recurrenceType} until ${recurrenceEndTime}`]
  }
}
