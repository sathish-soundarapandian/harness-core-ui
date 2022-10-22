/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import moment from 'moment'
import { TimeRangeFilterType, TimeRangeType, NodepoolTimeRangeType } from '@ce/types'

export const todayInUTC = () => moment.utc()
export const yesterdayInUTC = () => moment().utc().subtract(1, 'days')

export const GET_DATE_RANGE = {
  [TimeRangeType.LAST_7]: [todayInUTC().subtract(6, 'days').startOf('day').format(), todayInUTC().format()],
  [TimeRangeType.LAST_30]: [
    todayInUTC().subtract(30, 'days').startOf('day').format(),
    todayInUTC().subtract(1, 'days').format()
  ]
}
export const GET_NODEPOOL_DATE_RANGE = {
  [NodepoolTimeRangeType.LAST_DAY]: [todayInUTC().subtract(1, 'days').startOf('day').format(), todayInUTC().format()],
  [NodepoolTimeRangeType.LAST_7]: [todayInUTC().subtract(6, 'days').startOf('day').format(), todayInUTC().format()],
  [NodepoolTimeRangeType.LAST_30]: [
    todayInUTC().subtract(30, 'days').startOf('day').format(),
    todayInUTC().subtract(1, 'days').format()
  ]
}
export const ANOMALIES_LIST_FORMAT = 'DD/MM/YYYY'
export const CE_DATE_FORMAT_INTERNAL = 'YYYY-MM-DD'
export const CE_DATE_FORMAT_INTERNAL_MOMENT = `${CE_DATE_FORMAT_INTERNAL}THH:mm:ssZ`
export const FORMAT_12_HOUR = 'hh:mm A'
export const FORMAT_24_HOUR = 'HH:mm'
export const STATIC_SCHEDULE_PERIOD_FORMAT = `${CE_DATE_FORMAT_INTERNAL}THH:mm:ss.SSSSSZ`

export const getTimePeriodString = (value: string | number, format: string = CE_DATE_FORMAT_INTERNAL) =>
  moment(value).format(format)
export const getGMTStartDateTime = (str: string) => moment(`${str}T00:00:00Z`, CE_DATE_FORMAT_INTERNAL_MOMENT).valueOf()
export const getGMTEndDateTime = (str: string) => moment(`${str}T23:59:59Z`, CE_DATE_FORMAT_INTERNAL_MOMENT).valueOf()
export const getStartDateTime = (str: string) => moment(`${str}T00:00:00`).valueOf()
export const getEndDateTime = (str: string) => moment(`${str}T23:59:59`).valueOf()
export const getStaticSchedulePeriodTime = (str: string) => moment(str).valueOf()
export const getStaticSchedulePeriodString = (timeEpoch: number) =>
  getTimePeriodString(timeEpoch, STATIC_SCHEDULE_PERIOD_FORMAT)
export const getMinDate = (dates: Array<Date | number>) => moment.min(dates.map(d => moment(d))).valueOf()
export const getDiffInDays = (from: string, to: string) => moment(to).diff(moment(from), 'days')

export const DATE_RANGE_SHORTCUTS: Record<string, moment.Moment[]> = {
  LAST_7_DAYS: [todayInUTC().subtract(6, 'days').startOf('day'), todayInUTC().endOf('day')],
  LAST_30_DAYS: [todayInUTC().subtract(30, 'days').startOf('day'), todayInUTC().endOf('day')],
  CURRENT_MONTH: [todayInUTC().startOf('month').startOf('day'), todayInUTC().endOf('day')],
  THIS_MONTH: [todayInUTC().startOf('month').startOf('day'), todayInUTC().endOf('month').subtract(1, 'days')],
  THIS_YEAR: [todayInUTC().startOf('year'), todayInUTC().endOf('day')],
  LAST_MONTH: [todayInUTC().subtract(1, 'month').startOf('month'), todayInUTC().subtract(1, 'month').endOf('month')],
  LAST_YEAR: [todayInUTC().subtract(1, 'year').startOf('year'), todayInUTC().subtract(1, 'year').endOf('year')],
  LAST_3_MONTHS: [
    todayInUTC().subtract(4, 'months').startOf('month'),
    todayInUTC().subtract(1, 'month').endOf('month')
  ],
  LAST_6_MONTHS: [
    todayInUTC().subtract(7, 'months').startOf('month'),
    todayInUTC().subtract(1, 'month').endOf('month')
  ],
  LAST_12_MONTHS: [
    todayInUTC().subtract(13, 'months').startOf('month'),
    todayInUTC().subtract(1, 'month').endOf('month')
  ],
  THIS_QUARTER: [todayInUTC().startOf('quarter'), todayInUTC().endOf('day')],
  LAST_QUARTER: [
    todayInUTC().subtract(1, 'quarter').startOf('quarter'),
    todayInUTC().subtract(1, 'quarter').endOf('quarter')
  ]
}

export enum DATE_RANGE_SHORTCUTS_NAME {
  'LAST_7_DAYS' = 'LAST_7_DAYS',
  'LAST_30_DAYS' = 'LAST_30_DAYS',
  'CURRENT_MONTH' = 'CURRENT_MONTH',
  'THIS_YEAR' = 'THIS_YEAR',
  'LAST_MONTH' = 'LAST_MONTH',
  'LAST_YEAR' = 'LAST_YEAR',
  'LAST_3_MONTHS' = 'LAST_3_MONTHS',
  'LAST_6_MONTHS' = 'LAST_6_MONTHS',
  'LAST_12_MONTHS' = 'LAST_12_MONTHS',
  'THIS_QUARTER' = 'THIS_QUARTER',
  'LAST_QUARTER' = 'LAST_QUARTER',
  'CUSTOM' = 'CUSTOM'
}

export const getUserTimeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone

export const getGenericTimeZoneName = () => {
  return new Date()
    .toLocaleDateString('en-US', {
      day: '2-digit',
      timeZoneName: 'long'
    })
    .slice(4)
    .split(' ')
    .map(term => term[0])
    .join('')
}

export const DEFAULT_TIME_RANGE: TimeRangeFilterType = {
  to: DATE_RANGE_SHORTCUTS.LAST_7_DAYS[1].format(CE_DATE_FORMAT_INTERNAL),
  from: DATE_RANGE_SHORTCUTS.LAST_7_DAYS[0].format(CE_DATE_FORMAT_INTERNAL)
}

export const get24HourTimeIn12HourFormat = (time: string) => moment(time, [FORMAT_24_HOUR]).format(FORMAT_12_HOUR)
