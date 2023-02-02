/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { RiskValues } from '@cv/utils/CommonUtils'
import type { SelectOption } from '@pipeline/components/PipelineSteps/Steps/StepsTypes'

export const MetricType = {
  ANOMALOUS: 'Anomalous',
  NON_ANOMALOUS: 'Non-Anomalous'
}

export const MetricTypeOptions: SelectOption[] = [
  {
    label: `All Metrics`,
    value: MetricType.NON_ANOMALOUS
  },
  {
    label: `${MetricType.ANOMALOUS} Metrics`,
    value: MetricType.ANOMALOUS
  }
]

export const DATA_OPTIONS = [
  { label: 'Raw', value: 'raw' },
  { label: 'Normalised', value: 'normalised' }
]

export const POLLING_INTERVAL = 15000
export const PAGE_SIZE = 10
export const DEFAULT_PAGINATION_VALUEE = {
  pageIndex: -1,
  pageItemCount: 0,
  pageSize: 5,
  totalPages: 0,
  totalItems: 0
}

export const DEFAULT_NODE_RISK_COUNTS = [
  {
    risk: RiskValues.UNHEALTHY,
    count: 0,
    displayName: 'Unhealthy'
  },
  {
    risk: RiskValues.WARNING,
    count: 0,
    displayName: 'Warning'
  },
  {
    risk: RiskValues.HEALTHY,
    count: 0,
    displayName: 'Healthy'
  }
]

export const INITIAL_PAGE_NUMBER = 0
