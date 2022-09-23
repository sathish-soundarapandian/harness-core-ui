/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { DatadogLogsQueryDefinition } from '@cv/pages/health-source/connectors/DatadogLogsHealthSource/DatadogLogsHealthSource.type'
import { DatadogProduct } from '@cv/pages/health-source/connectors/DatadogMetricsHealthSource/DatadogMetricsHealthSource.utils'

export const DatadogLogQueryMock1: DatadogLogsQueryDefinition = {
  query: '*',
  serviceInstanceIdentifier: 'todolist',
  name: 'TestDatadogLogQuery',
  indexes: []
}
export const DatadogLogQueryMock2: DatadogLogsQueryDefinition = {
  query: '*',
  serviceInstanceIdentifier: 'todolist',
  name: 'TestDatadogLogQuery2',
  indexes: []
}
export const DatadogLogQueryMock3: DatadogLogsQueryDefinition = {
  query: '*',
  serviceInstanceIdentifier: 'todolist',
  name: 'TestDatadogLogQuery3',
  indexes: []
}
export const DatadogLogMockHealthSource = {
  isEdit: true,
  healthSourceList: [
    {
      name: 'datadog',
      identifier: 'datadog',
      type: 'DatadogLog',
      spec: {
        connectorRef: 'datadogConnector',
        queries: [DatadogLogQueryMock1, DatadogLogQueryMock2]
      },
      service: 'todolist',
      environment: 'production'
    }
  ],
  monitoringSourceName: 'todolist',
  monitoredServiceIdentifier: 'todolist',
  healthSourceName: 'datadog',
  healthSourceIdentifier: 'datadog',
  sourceType: 'DatadogLog',
  connectorRef: 'datadogConnector',
  product: { label: DatadogProduct.CLOUD_LOGS, value: DatadogProduct.CLOUD_LOGS }
}

export const template = {
  runtimeData: {
    changeSources: undefined,
    connectorId: '<+input>',
    connectorRef: '<+input>',
    environmentRef: 'Stress',
    existingMetricDetails: null,
    healthSourceIdentifier: 'dasdasda',
    healthSourceList: [],
    healthSourceName: 'dasdasda',
    isEdit: false,
    monitoredServiceRef: { name: 'AppDTempalte', identifier: 'AppDTempalte' },
    product: { value: 'Datadog Cloud Logs', label: 'Cloud Logs' },
    serviceRef: '<+input>',
    sourceType: 'Datadog'
  },
  payload: {
    identifier: 'dasdasda',
    name: 'dasdasda',
    spec: {
      connectorRef: '<+input>',
      feature: 'Datadog Cloud Logs',
      queries: [
        {
          identifier: 'cv.monitoringSources.datadogLogs.datadogLogsQuery',
          indexes: '<+input>',
          name: 'cv.monitoringSources.datadogLogs.datadogLogsQuery',
          query: '<+input>',
          serviceInstanceIdentifier: '<+input>'
        }
      ]
    },
    type: 'DatadogLog'
  }
}
