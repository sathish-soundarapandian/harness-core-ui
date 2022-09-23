/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { LookerEventType } from '@dashboards/constants/LookerEventType'

interface BaseLookerEvent {
  type: LookerEventType
}

export interface LookerDashboardFilters {
  [key: string]: string
}

export interface DashboardFiltersChangedEvent extends BaseLookerEvent {
  dashboard: {
    absoluteUrl: string
    dashboard_filters: LookerDashboardFilters
    id: string
    title: string
    url: string
  }
}

export interface PageChangedEvent extends BaseLookerEvent {
  page?: {
    absoluteUrl: string
    type: string
    url?: string
  }
}

export type LookerEvent = DashboardFiltersChangedEvent | PageChangedEvent
