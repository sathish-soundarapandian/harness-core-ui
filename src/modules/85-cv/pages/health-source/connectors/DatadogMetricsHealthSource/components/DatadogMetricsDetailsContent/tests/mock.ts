/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type React from 'react'
// eslint-disable-next-line no-restricted-imports
import type { Cancelable } from 'lodash'
import type { FormikProps } from 'formik'
import { DatadogProduct } from '@cv/pages/health-source/connectors/DatadogMetricsHealthSource/DatadogMetricsHealthSource.utils'
import type { DatadogMetricInfo } from '@cv/pages/health-source/connectors/DatadogMetricsHealthSource/DatadogMetricsHealthSource.type'
import type { DatadogMetricsDetailsContentProps } from '../DatadogMetricsDetailsContent.type'

export const MockMetricsContentProps = (
  setMetricsHealthData: React.Dispatch<React.SetStateAction<Map<string, DatadogMetricInfo>>>,
  formikProps: FormikProps<DatadogMetricInfo>,
  fetchActiveMetrics: ((query?: string | undefined) => void) & Cancelable,
  fetchMetricTags: ((query?: string | undefined) => void) & Cancelable,
  mockMetricInfo?: DatadogMetricInfo
): DatadogMetricsDetailsContentProps => {
  return {
    selectedMetric: 'selectedMetricMock',
    selectedMetricData: mockMetricInfo || MockDatadogMetricInfo,
    metricHealthDetailsData: new Map([['selectedMetricMock', mockMetricInfo || MockDatadogMetricInfo]]),
    setMetricHealthDetailsData: setMetricsHealthData,
    formikProps: formikProps,
    metricTags: MOCK_METRIC_TAGS_WITH_DUPLICATES,
    activeMetrics: MOCK_ACTIVE_METRICS,
    fetchActiveMetrics,
    fetchMetricTags
  }
}
export const MockDatadogMetricsHealthSource = {
  isEdit: true,
  healthSourceList: [],
  monitoringSourceName: 'todolist',
  monitoredServiceIdentifier: 'todolist',
  healthSourceName: 'mockHealthSourceName',
  healthSourceIdentifier: 'datadog',
  sourceType: 'DatadogLog',
  connectorRef: 'datadogConnector',
  product: { label: DatadogProduct.CLOUD_METRICS, value: DatadogProduct.CLOUD_METRICS }
}

export const MOCK_QUERY_OUTPUT = 'avg:system.cpu.user{version}.rollup(avg, 60)'
export const MOCK_GROUPING_QUERY_OUTPUT = 'avg:system.cpu.user{*} by {host}.rollup(avg, 60)'

export const MOCK_ACTIVE_METRIC = 'system.cpu.user'
export const MOCK_AGGREGATION = 'avg'
export const MOCK_SERVICE_INSTANCE = 'host'
export const MOCK_ACTIVE_METRICS = [MOCK_ACTIVE_METRIC, 'test.metric.1', 'test.metric.2']

export const MOCK_METRIC_TAGS_WITH_DUPLICATES = ['tag_1', 'tag_2', 'tag_1', 'tag_3', 'tag_3']
export const EXPECTED_METRIC_SELECT_OPTIONS = [
  { value: 'tag_1', label: 'tag_1' },
  { value: 'tag_2', label: 'tag_2' },
  { value: 'tag_3', label: 'tag_3' },
  { value: 'host', label: 'host' }
]

export const MockDatadogMetricInfo: DatadogMetricInfo = {
  dashboardId: 'mock_dashboard_id',
  identifier: 'mockMetricName',
  metricName: 'mockMetricName',
  metricPath: 'mock_metric_path',
  groupName: { value: 'mockGroupName', label: 'mockGroupName' },
  query: MOCK_QUERY_OUTPUT,
  metric: MOCK_ACTIVE_METRIC,
  metricTags: MOCK_ACTIVE_METRICS.map(metric => {
    return { value: metric, label: metric }
  }),
  serviceInstanceIdentifierTag: 'host',
  aggregator: MOCK_AGGREGATION,
  sli: false,
  isCustomCreatedMetric: false,
  continuousVerification: true,
  ignoreThresholds: [],
  failFastThresholds: []
}
