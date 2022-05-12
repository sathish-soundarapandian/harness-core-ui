/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { MutateMethod } from 'restful-react'
import type {
  DeleteSLODataQueryParams,
  ResetErrorBudgetPathParams,
  ResetErrorBudgetQueryParams,
  RestResponseBoolean,
  RestResponseSLOErrorBudgetResetDTO,
  SLODashboardWidget,
  SLOErrorBudgetResetDTO,
  TimeRangeFilter
} from 'services/cv'
import type { SLODetailsPageTabIds } from '../CVSLODetailsPage.types'

export interface DetailsPanelProps {
  loading: boolean
  errorMessage?: string
  retryOnError: () => Promise<void>
  sloDashboardWidget?: SLODashboardWidget
  timeRangeFilters?: TimeRangeFilter[]
}

export interface KeyValuePairProps {
  keyText: string
  value: string
}

export interface ServiceDetailsProps {
  sloDashboardWidget: SLODashboardWidget
}

export interface TabToolbarProps {
  sloDashboardWidget: SLODashboardWidget
  deleteSLO: MutateMethod<RestResponseBoolean, string, DeleteSLODataQueryParams, void>
  resetErrorBudget: MutateMethod<
    RestResponseSLOErrorBudgetResetDTO,
    SLOErrorBudgetResetDTO,
    ResetErrorBudgetQueryParams,
    ResetErrorBudgetPathParams
  >
  refetchSLODetails: () => Promise<void>
  onTabChange: (nextTab: SLODetailsPageTabIds) => void
}
