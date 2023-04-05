/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { AppDynamicsFomikFormInterface } from '../../../AppDHealthSource.types'

export const appdMetric = {
  metricPath: {
    metricPathDropdown_0: { path: '', value: 'Calls per Minute' },
    metricPathDropdown_1: { path: 'Calls per Minute', value: '' }
  },
  basePath: {
    basePathDropdown_0: { path: '', value: 'Overall Application Performance' },
    basePathDropdown_1: { path: 'Overall Application Performance', value: '' }
  },
  metricName: 'appdMetric',
  metricIdentifier: 'appdMetric',
  riskCategory: 'Errors/ERROR',
  serviceInstance: null,
  lowerBaselineDeviation: true,
  higherBaselineDeviation: true,
  groupName: { label: 'g1', value: 'g1' },
  continuousVerification: true,
  healthScore: true,
  sli: false
}
const appdMetricNew = {
  metricPath: {
    metricPathDropdown_0: { path: '', value: 'Hardware Resources' },
    metricPathDropdown_1: { path: 'Hardware Resources', value: '' }
  },
  basePath: {
    basePathDropdown_0: { path: '', value: 'Application Infrastructure Performance' },
    basePathDropdown_1: { path: 'Application Infrastructure Performance', value: '' }
  },
  metricName: 'appdMetric new',
  metricIdentifier: 'appdMetricNew',
  riskCategory: 'Errors/THROUGHPUT',
  serviceInstance: null,
  lowerBaselineDeviation: true,
  higherBaselineDeviation: true,
  groupName: { label: 'g2', value: 'g2' },
  continuousVerification: false,
  healthScore: true,
  sli: false
}

export const mappedMetricsMap = new Map()
mappedMetricsMap.set('appdMetric', appdMetric)
mappedMetricsMap.set('appdMetric new', appdMetricNew)

export const formikValues = {
  name: 'AppD ',
  identifier: 'adadssadas',
  connectorRef: 'account.appdtest',
  isEdit: true,
  product: { label: 'Application Monitoring', value: 'Application Monitoring' },
  type: 'AppDynamics',
  mappedServicesAndEnvs: mappedMetricsMap,
  appdApplication: 'Harness-CI-Manager',
  appDTier: 'manager',
  metricPacks: [{ identifier: 'Performance' }, { identifier: 'Errors' }],
  metricData: { Performance: true, Errors: true },
  metricPath: {
    metricPathDropdown_0: { path: '', value: 'Calls per Minute' },
    metricPathDropdown_1: { path: 'Calls per Minute', value: '' }
  },
  basePath: {
    basePathDropdown_0: { path: '', value: 'Overall Application Performance' },
    basePathDropdown_1: { path: 'Overall Application Performance', value: '' }
  },
  metricName: 'appdMetric',
  metricIdentifier: 'appdMetric',
  riskCategory: 'Errors/ERROR',
  serviceInstance: null,
  lowerBaselineDeviation: true,
  higherBaselineDeviation: true,
  groupName: { label: 'g1', value: 'g1' },
  continuousVerification: true,
  healthScore: true,
  sli: false,
  showCustomMetric: true
}

export const expectedMappedMetrics = new Map()
const exectedMetricData = {
  name: 'AppD ',
  identifier: 'adadssadas',
  connectorRef: 'account.appdtest',
  isEdit: true,
  product: { label: 'Application Monitoring', value: 'Application Monitoring' },
  type: 'AppDynamics',
  mappedServicesAndEnvs: mappedMetricsMap,
  metricPacks: [{ identifier: 'Performance' }, { identifier: 'Errors' }],
  metricPath: {
    metricPathDropdown_0: { path: '', value: 'Calls per Minute' },
    metricPathDropdown_1: { path: 'Calls per Minute', value: '' }
  },
  basePath: {
    basePathDropdown_0: { path: '', value: 'Overall Application Performance' },
    basePathDropdown_1: { path: 'Overall Application Performance', value: '' }
  },
  metricName: 'appdMetric',
  metricIdentifier: 'appdMetric',
  riskCategory: 'Errors/ERROR',
  serviceInstance: null,
  lowerBaselineDeviation: true,
  higherBaselineDeviation: true,
  groupName: { label: 'g1', value: 'g1' },
  continuousVerification: true,
  healthScore: true,
  sli: false,
  showCustomMetric: true
}
const exectedNewMetricData = {
  metricPath: {
    metricPathDropdown_0: { path: '', value: 'Hardware Resources' },
    metricPathDropdown_1: { path: 'Hardware Resources', value: '' }
  },
  basePath: {
    basePathDropdown_0: { path: '', value: 'Application Infrastructure Performance' },
    basePathDropdown_1: { path: 'Application Infrastructure Performance', value: '' }
  },
  metricName: 'appdMetric new',
  metricIdentifier: 'appdMetricNew',
  riskCategory: 'Errors/THROUGHPUT',
  serviceInstance: null,
  lowerBaselineDeviation: true,
  higherBaselineDeviation: true,
  groupName: { label: 'g2', value: 'g2' },
  continuousVerification: false,
  healthScore: true,
  sli: false
}
expectedMappedMetrics.set('appdMetric', exectedMetricData)
expectedMappedMetrics.set('appdMetric new', exectedNewMetricData)

export const formMockData = {
  basePath: { path: 'test basepath' },
  metricPath: { path: 'test metricPath' },
  appDTier: 'appDTier test',
  pathType: 'dropdownPath'
} as unknown as AppDynamicsFomikFormInterface
