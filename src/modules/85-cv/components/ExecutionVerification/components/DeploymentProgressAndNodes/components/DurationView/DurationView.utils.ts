/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import moment from 'moment'
import { TimeLabels } from './DurationView.constant'

export const getDurationLabelFromMilliseconds = (duration: number): string => {
  const durationLabelArray: string[] = []
  const momentDuration = moment.duration(duration, 'milliseconds')

  const hrs = momentDuration.hours()
  const mins = momentDuration.minutes()
  const secs = momentDuration.seconds()

  const hrsLabel = hrs > 1 ? TimeLabels.hrs : TimeLabels.hr
  const minsLabel = mins > 1 ? TimeLabels.mins : TimeLabels.min
  const secsLabel = secs > 1 ? TimeLabels.secs : TimeLabels.sec

  const durationOptions = [
    { value: hrs, label: hrsLabel },
    { value: mins, label: minsLabel },
    { value: secs, label: secsLabel }
  ]

  durationOptions.forEach(item => {
    if (item.value > 0) {
      durationLabelArray.push(`${item.value} ${item.label}`)
    }
  })
  return durationLabelArray.join(' ')
}
