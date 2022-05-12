/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import moment from 'moment'
import type { SelectOption } from '@harness/uicore'
import type { ApiCallLogDTO, HealthSourceDTO } from 'services/cv'
import type { UseStringsReturn } from 'framework/strings'
import type { TimeRange } from './useLogContentHook.types'
import { RESPONSE_BODY } from './useLogContentHook.constants'

export function isPositiveNumber(index: unknown): index is number {
  return typeof index === 'number' && index >= 0
}

export function getHealthSourceOptions(
  getString: UseStringsReturn['getString'],
  healthSources?: HealthSourceDTO[]
): SelectOption[] {
  const optionAll: SelectOption = { label: getString('all'), value: '' }

  const healthSourcesOptions =
    healthSources?.map(healthSource => ({
      label: healthSource.name ?? '',
      value: healthSource.identifier ?? ''
    })) ?? []

  return [optionAll, ...healthSourcesOptions]
}

export const startOfSecond = (time: moment.Moment): Date => time.utc().startOf('minute').toDate()

export const getDateRangeShortcuts = (getString: UseStringsReturn['getString']): TimeRange[] => [
  {
    value: [startOfSecond(moment().subtract(1, 'hour').add(1, 'second')), startOfSecond(moment())],
    label: getString('cv.lastOneHour')
  },
  {
    value: [startOfSecond(moment().subtract(4, 'hours').add(1, 'second')), startOfSecond(moment())],
    label: getString('cv.monitoredServices.serviceHealth.last4Hrs')
  },
  {
    value: [startOfSecond(moment().subtract(12, 'hours').add(1, 'second')), startOfSecond(moment())],
    label: getString('cv.last12Hours')
  },
  {
    value: [startOfSecond(moment().subtract(24, 'hours').add(1, 'second')), startOfSecond(moment())],
    label: getString('cv.monitoredServices.serviceHealth.last24Hrs')
  }
]

export const formatDate = (date?: number): string => (date ? moment(new Date(date)).format('L, LT') : '')

export const getInfoText = (getString: UseStringsReturn['getString'], timeRange?: TimeRange): string => {
  if (!timeRange) {
    return ''
  }

  const [_startTime, _endTime] = timeRange.value

  const startTime = moment(_startTime).format('L LT')
  const endTime = moment(_endTime).format('L LT')

  if (timeRange.label === getString('common.repo_provider.customLabel')) {
    return `${getString('cv.showingLogs')} from ${startTime} to ${endTime}.`
  }

  return `${getString('cv.showingLogsFor')} ${timeRange.label.toLowerCase()} from ${startTime} to ${endTime}.`
}

export const getStatusColor = (statusCode = '500'): 'success' | 'error' => {
  const _code = Number(statusCode)

  if (_code >= 200 && _code < 300) {
    return 'success'
  }

  return 'error'
}

export function downloadJson(data: string, fileName: string): void {
  const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(data)}`
  const link = document.createElement('a')

  link.href = jsonString
  link.download = `${fileName}-${moment().format('L-LT')}.json`
  link.click()
}

export function parseResponseBody(data: ApiCallLogDTO[]): ApiCallLogDTO[] {
  return data.map(log => ({
    ...log,
    responses: log.responses?.map(response => {
      if (response.name === RESPONSE_BODY) {
        let value

        try {
          value = response.value && JSON.parse(response.value)
        } catch (e) {
          value = response.value
        }

        return { ...response, value }
      }
      return response
    })
  }))
}

export function getDateTime(date: Date, time: Date): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    time.getHours(),
    time.getMinutes(),
    time.getSeconds(),
    time.getMilliseconds()
  )
}

export function isTimeRangeChanged(newTimeRange: TimeRange, timeRange?: TimeRange): boolean {
  if (!timeRange) {
    return false
  }

  const [startTime, endTime] = timeRange.value
  const [newStartTime, newEndTime] = newTimeRange.value

  return newStartTime.getTime() !== startTime.getTime() || newEndTime.getTime() !== endTime.getTime()
}
