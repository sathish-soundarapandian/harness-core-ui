/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import moment from 'moment'
import type { FreezeDetailedResponse, FreezeSummaryResponse } from 'services/cd-ng'
export const DATE_PARSE_FORMAT = 'YYYY-MM-DD hh:mm A'

export const RECURRENCE = ['Daily', 'Weekly', 'Monthly', 'Yearly'] as const
export const DOES_NOT_REPEAT = 'Does not repeat'

export type Scope = Exclude<FreezeDetailedResponse['freezeScope'], 'unknown' | undefined>

export const scopeText: Record<Scope, string> = {
  account: 'Account',
  org: 'Organization',
  project: 'Project'
}

export enum FreezeStatus {
  EXPIRED = 'EXPIRED',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

export const getFreezeStatus = (data?: FreezeSummaryResponse, isEnabled?: boolean): FreezeStatus => {
  if (!data?.currentOrUpcomingWindow) {
    return data?.windows ? FreezeStatus['EXPIRED'] : FreezeStatus['INACTIVE']
  } else if (
    isEnabled &&
    moment().isBetween(moment(data?.currentOrUpcomingWindow.startTime), moment(data?.currentOrUpcomingWindow.endTime))
  ) {
    return FreezeStatus['ACTIVE']
  }

  return FreezeStatus['INACTIVE']
}

export const getComputedFreezeStatusMap = (content: FreezeSummaryResponse[] = []): Record<string, FreezeStatus> => {
  return content.reduce((acc, item) => {
    acc[item.identifier!] = getFreezeStatus(item, item.status === 'Enabled')
    return acc
  }, {} as Record<string, FreezeStatus>)
}

export const getReadableDateFromDateString = (dateTime?: string): string =>
  dateTime ? moment(dateTime, DATE_PARSE_FORMAT).format('lll') : 'NA'

export const getMomentFormat = (dateTime?: string) => (dateTime ? moment(dateTime, DATE_PARSE_FORMAT) : moment())
