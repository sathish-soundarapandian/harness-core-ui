/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import moment from 'moment'
import type { SelectOption } from '@harness/uicore'
import { minBy } from 'lodash-es'
import type { UseStringsReturn } from 'framework/strings'
import type { RiskData } from 'services/cv'
import { TWENTY_FOUR_HOURS } from '@cv/pages/slos/CVSLODetailsPage/DetailsPanel/DetailsPanel.constants'

import { nearestMinutes } from '@cv/utils/CommonUtils'
import {
  DAYS,
  daysTimeFormat,
  DEFAULT_MIN_SLIDER_WIDTH,
  HOURS,
  hoursTimeFormat,
  LEFT_TEXTFIELD_WIDTH,
  MAX_BARS_TO_SHOW,
  MIN_BARS_TO_SHOW,
  NUMBER_OF_DATA_POINTS,
  TimePeriodEnum
} from './ServiceHealth.constants'

export const getTimePeriods = (getString: UseStringsReturn['getString']): SelectOption[] => {
  return [
    { value: TimePeriodEnum.FOUR_HOURS, label: getString('cv.monitoredServices.serviceHealth.last4Hrs') },
    { value: TimePeriodEnum.TWENTY_FOUR_HOURS, label: getString('cv.monitoredServices.serviceHealth.last24Hrs') },
    { value: TimePeriodEnum.THREE_DAYS, label: getString('cv.monitoredServices.serviceHealth.last3Days') },
    { value: TimePeriodEnum.SEVEN_DAYS, label: getString('cv.monitoredServices.serviceHealth.last7Days') },
    { value: TimePeriodEnum.THIRTY_DAYS, label: getString('common.duration.month') }
  ]
}

export const getTimestampsForPeriodWithoutRiskData = (selectedTimePeriod: string): number[] => {
  const timestamps = []
  const intervalInHrs = getTimeInHrs(selectedTimePeriod) / NUMBER_OF_DATA_POINTS
  let endTime = Date.now()
  timestamps.push(endTime)

  for (let i = 1; i < NUMBER_OF_DATA_POINTS; i++) {
    endTime -= intervalInHrs * 60 * 60000
    timestamps.push(endTime)
  }

  return timestamps.reverse()
}

export const getTimestampsForPeriod = (riskData?: RiskData[]): number[] => {
  if (!riskData?.length) return []
  const timestamps: number[] = []
  for (const risk of riskData) {
    const { timeRangeParams } = risk || {}
    if (timeRangeParams?.startTime && timeRangeParams.endTime) {
      timestamps.push(timeRangeParams.startTime * 1000)
      timestamps.push(timeRangeParams.endTime * 1000)
    }
  }
  return timestamps
}

export const getTimeInHrs = (selectedTimePeriod: string): number => {
  let timeInHrs = 24
  switch (selectedTimePeriod) {
    case TimePeriodEnum.FOUR_HOURS:
      timeInHrs = 4
      break
    case TimePeriodEnum.TWENTY_FOUR_HOURS:
      timeInHrs = 24
      break
    case TimePeriodEnum.THREE_DAYS:
      timeInHrs = 24 * 3
      break
    case TimePeriodEnum.SEVEN_DAYS:
      timeInHrs = 24 * 7
      break
    case TimePeriodEnum.THIRTY_DAYS:
      timeInHrs = 24 * 30
      break
    default:
      timeInHrs = 24
  }
  return timeInHrs
}

export const getTimeFormat = (selectedTimePeriod: string): string => {
  let timeFormat = HOURS
  switch (selectedTimePeriod) {
    case TimePeriodEnum.FOUR_HOURS:
      timeFormat = HOURS
      break
    case TimePeriodEnum.TWENTY_FOUR_HOURS:
      timeFormat = HOURS
      break
    case TimePeriodEnum.THREE_DAYS:
      timeFormat = DAYS
      break
    case TimePeriodEnum.SEVEN_DAYS:
      timeFormat = DAYS
      break
    case TimePeriodEnum.THIRTY_DAYS:
      timeFormat = DAYS
      break
    default:
      timeFormat = HOURS
  }
  return timeFormat
}

export const getTimeFormatMoment = (format?: string): string => {
  let timeFormat
  switch (format) {
    case HOURS:
      timeFormat = hoursTimeFormat
      break
    case DAYS:
      timeFormat = daysTimeFormat
      break
    default:
      timeFormat = hoursTimeFormat
  }

  return timeFormat
}

export function calculateStartAndEndTimes(
  startXPercentage: number,
  endXPercentage: number,
  timestamps?: number[]
): [number, number] | undefined {
  if (!timestamps?.length) return
  const startTime = Math.floor(startXPercentage * (timestamps[timestamps.length - 1] - timestamps[0]) + timestamps[0])
  const nearest5MinutesStartTime = nearestMinutes(5, moment(startTime)).valueOf()
  const endTime = Math.floor(endXPercentage * (timestamps[timestamps.length - 1] - timestamps[0]) + timestamps[0])
  const nearest5MinutesEndTime = nearestMinutes(5, moment(endTime)).valueOf()
  return [nearest5MinutesStartTime, nearest5MinutesEndTime]
}

export function calculateLowestHealthScoreBar(
  startTime?: number,
  endTime?: number,
  healthScoreData?: RiskData[]
): RiskData | undefined {
  if (startTime && endTime && healthScoreData && healthScoreData.length) {
    const dataPointsLyingInTheRange = healthScoreData.filter((el: RiskData) => isInTheRange(el, startTime, endTime))
    return minBy(dataPointsLyingInTheRange, 'healthScore')
  }
}

export const isChangesInTheRange = (el: any, startTime: number, endTime: number): boolean => {
  if (el?.startTime && el?.endTime) {
    return startTime <= el.startTime && el.startTime <= endTime
  } else {
    return false
  }
}

export const isInTheRange = (el: RiskData, startTime: number, endTime: number): boolean => {
  if (el?.timeRangeParams?.startTime && el?.timeRangeParams?.endTime) {
    return startTime <= el.timeRangeParams.startTime * 1000 && el.timeRangeParams.startTime * 1000 <= endTime
  } else {
    return false
  }
}

export const getSliderDimensions = (
  containerWidth: number,
  selectedTimePeriod: string
): { minWidth: number; maxWidth: number } => {
  // This is temporary change , will be removed once BE fix is done.
  const maxBarsToShow = limitMaxSliderWidth(selectedTimePeriod) ? MIN_BARS_TO_SHOW : MAX_BARS_TO_SHOW

  const minWidth = (containerWidth - LEFT_TEXTFIELD_WIDTH) / (NUMBER_OF_DATA_POINTS / MIN_BARS_TO_SHOW)
  const maxWidth = (containerWidth - LEFT_TEXTFIELD_WIDTH) / (NUMBER_OF_DATA_POINTS / maxBarsToShow)
  return { minWidth, maxWidth }
}

export const getDimensionsAsPerContainerWidth = (
  defaultMaxSliderWidth: number,
  selectedTimePeriod: SelectOption,
  containerWidth?: number
): { minWidth: number; maxWidth: number } => {
  let dimensions = { minWidth: DEFAULT_MIN_SLIDER_WIDTH, maxWidth: defaultMaxSliderWidth }
  if (containerWidth) {
    dimensions = { ...dimensions, ...getSliderDimensions(containerWidth, selectedTimePeriod?.value as string) }
  }
  return dimensions
}

export const limitMaxSliderWidth = (selectedTimePeriod: string): boolean => {
  return selectedTimePeriod === TimePeriodEnum.SEVEN_DAYS || selectedTimePeriod === TimePeriodEnum.THIRTY_DAYS
}

export const getHoursByTimePeriod = (timePeriod: TimePeriodEnum) => {
  const mins = 60 * 1000
  const hours = 1 * 60 * mins
  switch (timePeriod) {
    case TimePeriodEnum.FOUR_HOURS:
      return 15 * mins
    case TimePeriodEnum.TWENTY_FOUR_HOURS:
      return 1 * hours
    case TimePeriodEnum.THREE_DAYS:
      return 4 * hours
    case TimePeriodEnum.SEVEN_DAYS:
      return 10 * hours
    case TimePeriodEnum.THIRTY_DAYS:
      return 20 * hours
    default:
      return 4 * hours
  }
}

export const getTimePeriodFilter = (getString: UseStringsReturn['getString'], notificationTime?: number) => {
  const list = getTimePeriods(getString)
  const now = Date.now()
  const momentDate = moment(Number(notificationTime))
  const hoursAgo = moment().diff(momentDate, 'hours')
  if (hoursAgo < 5) {
    return { option: list.find(item => item.value === TimePeriodEnum.FOUR_HOURS), timeDiff: hoursAgo * 60 * 60 * 1000 }
  } else if (hoursAgo < 25) {
    return {
      option: list.find(item => item.value === TimePeriodEnum.TWENTY_FOUR_HOURS),
      startTime: now - TWENTY_FOUR_HOURS
    }
  } else if (hoursAgo > 25 && hoursAgo <= 72) {
    return {
      option: list.find(item => item.value === TimePeriodEnum.THREE_DAYS),
      startTime: now - 3 * TWENTY_FOUR_HOURS
    }
  } else if (hoursAgo > 72 && hoursAgo <= 168) {
    return {
      option: list.find(item => item.value === TimePeriodEnum.SEVEN_DAYS),
      startTime: now - 7 * TWENTY_FOUR_HOURS
    }
  } else if (hoursAgo > 168 && hoursAgo < 744) {
    return {
      option: list.find(item => item.value === TimePeriodEnum.THREE_DAYS),
      startTime: now - 30 * TWENTY_FOUR_HOURS
    }
  } else {
    return {
      option: list.find(item => item.value === TimePeriodEnum.FOUR_HOURS),
      startTime: now - TWENTY_FOUR_HOURS
    }
  }
}

export const updateFilterByNotificationTime = ({
  showError,
  getString,
  notificationTime,
  defaultOffset,
  defaultSelectedTimePeriod,
  location,
  history
}: {
  getString: UseStringsReturn['getString']
  notificationTime: number
  defaultOffset: number
  defaultSelectedTimePeriod: SelectOption
  showError: (message: React.ReactNode, timeout?: number | undefined, key?: string | undefined) => void
  location: any
  history: any
}): { defaultOffset: number; defaultSelectedTimePeriod: SelectOption } => {
  const filterValueByNotificationTime = getTimePeriodFilter(getString, notificationTime)
  const currTime = Date.now()
  const startTime = filterValueByNotificationTime.startTime || 0
  const diffValue = (Number(notificationTime) - startTime) / (currTime - startTime)
  if (Number(notificationTime) < currTime && Number(notificationTime) > startTime && isFinite(diffValue)) {
    defaultOffset = diffValue
    defaultSelectedTimePeriod = filterValueByNotificationTime.option as SelectOption
  } else {
    showError(getString('cv.notificationTimestampError'))
    const queryParams = new URLSearchParams(location.search)
    if (queryParams.has('notificationTime')) {
      queryParams.delete('notificationTime')
      history.replace({
        search: queryParams.toString()
      })
    }
  }
  return { defaultOffset, defaultSelectedTimePeriod }
}
