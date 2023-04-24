/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import moment from 'moment'
import { DowntimeWindowToggleViews } from '@cv/pages/slos/components/CVCreateDowntime/components/CreateDowntimeForm/CreateDowntimeForm.types'
import { EndTimeMode } from '@cv/pages/slos/components/CVCreateDowntime/CVCreateDowntime.types'
import { getFormattedTime } from '@cv/pages/slos/components/CVCreateDowntime/CVCreateDowntime.utils'
import type { UseStringsReturn } from 'framework/strings'
import type {
  DowntimeDuration,
  DowntimeListView,
  DowntimeRecurrence,
  DowntimeStatusDetails,
  OnetimeDowntimeSpec,
  OnetimeDurationBasedSpec,
  OnetimeEndTimeBasedSpec,
  RecurringDowntimeSpec
} from 'services/cv'
import { DowntimeStatus } from '../../SLODowntimePage.types'
import { defaultDateTime } from '../../SLODowntimePage.constants'

export const getIsSetPreviousPage = (pageIndex: number, pageItemCount: number): boolean => {
  return Boolean(pageIndex) && pageItemCount === 1
}

export const getDowntimeWindowInfo = (downtime: DowntimeListView, getString: UseStringsReturn['getString']) => {
  const { type = DowntimeWindowToggleViews.ONE_TIME } = downtime?.spec || {}
  const { startDateTime = defaultDateTime, timezone = 'Asia/Calcutta' } = downtime?.spec?.spec || {}

  let timeFrame = null
  let downtimeType = null

  if (type === DowntimeWindowToggleViews.ONE_TIME) {
    const onetimeDowntimeSpec = downtime?.spec?.spec as OnetimeDowntimeSpec
    const { type: oneTimeDowntimeType = EndTimeMode.DURATION } = onetimeDowntimeSpec || {}
    const _startTime = getFormattedTime({ dateTime: startDateTime, format: 'lll' })
    let _endTime = null

    if (oneTimeDowntimeType === EndTimeMode.DURATION) {
      const { durationValue = 30, durationType = 'Minutes' } =
        (onetimeDowntimeSpec?.spec as OnetimeDurationBasedSpec)?.downtimeDuration || {}
      _endTime = moment(_startTime)
        .add(durationValue, durationType.toLowerCase() as any)
        .format('lll')
    } else {
      const { endDateTime = defaultDateTime } = (onetimeDowntimeSpec?.spec as OnetimeEndTimeBasedSpec) || {}
      _endTime = getFormattedTime({
        dateTime: endDateTime,
        format: 'lll'
      })
    }

    timeFrame = `${_startTime} - ${_endTime} (${timezone})`
    downtimeType = getString('common.occurrence.oneTime').toUpperCase()
  } else {
    const {
      downtimeDuration,
      downtimeRecurrence,
      recurrenceEndDateTime = defaultDateTime
    } = downtime?.spec?.spec as RecurringDowntimeSpec

    timeFrame = `${getString('cv.sloDowntime.timeFrame', {
      recurrenceType: getRecurrenceType(downtimeRecurrence, getString),
      time: getFormattedTime({
        dateTime: startDateTime,
        format: 'LT'
      }),
      duration: getDuration(getString, downtimeDuration)
    })} (${timezone})`
    downtimeType = getString('cv.sloDowntime.recurringDowntime', {
      startTime: getFormattedTime({
        dateTime: startDateTime,
        format: 'll'
      }),
      endTime: getFormattedTime({ dateTime: recurrenceEndDateTime, format: 'll' })
    })
  }

  return { timeFrame, downtimeType }
}

export const getDuration = (getString: UseStringsReturn['getString'], duration?: DowntimeDuration): string => {
  const { durationValue, durationType } = duration || {}
  switch (durationType) {
    case 'Weeks':
      return durationValue === 1 ? getString('cv.sloDowntime.oneWeek') : `${durationValue} ${getString('cv.weeks')}`
    case 'Days':
      return durationValue === 1 ? getString('cv.oneDay') : `${durationValue} ${getString('cv.days')}`
    case 'Hours':
      return durationValue === 1 ? getString('cv.oneHour') : `${durationValue} ${getString('hours')}`
    case 'Minutes':
      return durationValue === 1 ? getString('cv.sloDowntime.oneMinute') : `${durationValue} ${getString('cv.minutes')}`
    default:
      return `30 ${getString('cv.minutes')}`
  }
}

export const getRecurrenceType = (
  downtimeRecurrence: DowntimeRecurrence,
  getString: UseStringsReturn['getString']
): string => {
  const { recurrenceValue, recurrenceType } = downtimeRecurrence
  switch (recurrenceType) {
    case 'Day':
      return recurrenceValue === 1 ? getString('cv.day') : `${recurrenceValue} ${getString('cv.days')}`
    case 'Week':
      return recurrenceValue === 1 ? getString('cv.week') : `${recurrenceValue} ${getString('cv.weeks')}`
    case 'Month':
      return recurrenceValue === 1 ? getString('cv.month') : `${recurrenceValue} ${getString('cv.months')}`
    default:
      return getString('cv.week')
  }
}

export const getDowntimeStatusLabel = (
  getString: UseStringsReturn['getString'],
  status?: DowntimeStatusDetails['status']
): string => {
  switch (status) {
    case DowntimeStatus.ACTIVE:
      return getString('active')
    case DowntimeStatus.SCHEDULED:
    default:
      return getString('triggers.scheduledLabel').replace(/'/g, '')
  }
}
