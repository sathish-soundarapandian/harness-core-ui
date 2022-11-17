/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SelectOption, MultiSelectOption } from '@harness/uicore'
import type { PrometheusMetricThresholdType } from './PrometheusHealthSource.types'

export const PrometheusMonitoringSourceFieldNames = {
  METRIC_IDENTIFIER: 'identifier',
  METRIC_NAME: 'metricName',
  PROMETHEUS_METRIC: 'prometheusMetric',
  SERVICE_FILTER: 'serviceFilter',
  RISK_CATEGORY: 'riskCategory',
  RECORD_COUNT: 'recordCount',
  QUERY: 'query',
  ENVIRONMENT_FILTER: 'envFilter',
  ADDITIONAL_FILTER: 'additionalFilter',
  HIGHER_BASELINE_DEVIATION: 'higherBaselineDeviation',
  LOWER_BASELINE_DEVIATION: 'lowerBaselineDeviation',
  AGGREGATOR: 'aggregator',
  SERVICE_INSTANCE: 'serviceInstance',
  GROUP_NAME: 'groupName',
  IS_MANUAL_QUERY: 'isManualQuery',
  CONTINUOUS_VERIFICATION: 'continuousVerification',
  HEALTH_SCORE: 'healthScore',
  SLI: 'sli'
}

export interface PrometheusSetupSource {
  isEdit: boolean
  mappedServicesAndEnvs: Map<string, MapPrometheusQueryToService> // metricName to MapPrometheusQueryToService
  healthSourceIdentifier: string
  healthSourceName: string
  product: SelectOption
  connectorRef?: { value: string } | string
  ignoreThresholds: PrometheusMetricThresholdType[]
  failFastThresholds: PrometheusMetricThresholdType[]
  region?: string
  dataSourceType?: string
  workspaceId?: string
}

export type MapPrometheusQueryToService = {
  identifier: string
  metricName: string
  prometheusMetric?: string
  query: string
  isManualQuery: boolean
  serviceFilter?: MultiSelectOption[]
  envFilter?: MultiSelectOption[]
  additionalFilter?: MultiSelectOption[]
  aggregator?: string
  riskCategory?: string
  serviceInstance?: string | SelectOption
  recordCount?: number
  lowerBaselineDeviation?: boolean
  higherBaselineDeviation?: boolean
  groupName?: SelectOption
  sli?: boolean
  continuousVerification?: boolean
  healthScore?: boolean
  ignoreThresholds: PrometheusMetricThresholdType[]
  failFastThresholds: PrometheusMetricThresholdType[]
}

export type RiskProfileCatgory = 'Performance' | 'Errors' | 'Infrastructure'
export type PrometheusFilter = { labelName: string; labelValue: string }

export type SelectedAndMappedMetrics = {
  selectedMetric: string
  mappedMetrics: Map<string, MapPrometheusQueryToService>
}

export type CreatedMetricsWithSelectedIndex = {
  createdMetrics: string[]
  selectedMetricIndex: number
}

export const PrometheusProductNames = {
  APM: 'apm'
}
