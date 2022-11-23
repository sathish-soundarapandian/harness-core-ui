/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

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
} as any

export const expectedMappedMetrics = new Map()

const mappedServicesAndEnvs = new Map()
mappedServicesAndEnvs.set('appdMetric', {
  basePath: {
    basePathDropdown_0: {
      path: '',
      value: 'Overall Application Performance'
    },
    basePathDropdown_1: {
      path: 'Overall Application Performance',
      value: ''
    }
  },
  continuousVerification: true,
  groupName: {
    label: 'g1',
    value: 'g1'
  },
  healthScore: true,
  higherBaselineDeviation: true,
  lowerBaselineDeviation: true,
  metricIdentifier: 'appdMetric',
  metricName: 'appdMetric',
  metricPath: {
    metricPathDropdown_0: {
      path: '',
      value: 'Calls per Minute'
    },
    metricPathDropdown_1: {
      path: 'Calls per Minute',
      value: ''
    }
  },
  riskCategory: 'Errors/ERROR',
  serviceInstance: null,
  sli: false
})
mappedServicesAndEnvs.set('appdMetric new', {
  basePath: {
    basePathDropdown_0: {
      path: '',
      value: 'Application Infrastructure Performance'
    },
    basePathDropdown_1: {
      path: 'Application Infrastructure Performance',
      value: ''
    }
  },
  continuousVerification: false,
  groupName: {
    label: 'g2',
    value: 'g2'
  },
  healthScore: true,
  higherBaselineDeviation: true,
  lowerBaselineDeviation: true,
  metricIdentifier: 'appdMetricNew',
  metricName: 'appdMetric new',
  metricPath: {
    metricPathDropdown_0: {
      path: '',
      value: 'Hardware Resources'
    },
    metricPathDropdown_1: {
      path: 'Hardware Resources',
      value: ''
    }
  },
  riskCategory: 'Errors/THROUGHPUT',
  serviceInstance: null,
  sli: false
})

const exectedMetricData = {
  appDTier: 'manager',
  appdApplication: 'Harness-CI-Manager',
  basePath: {
    basePathDropdown_0: {
      path: '',
      value: 'Overall Application Performance'
    },
    basePathDropdown_1: {
      path: 'Overall Application Performance',
      value: ''
    }
  },
  connectorRef: 'account.appdtest',
  continuousVerification: true,
  groupName: {
    label: 'g1',
    value: 'g1'
  },
  healthScore: true,
  higherBaselineDeviation: true,
  identifier: 'adadssadas',
  isEdit: true,
  lowerBaselineDeviation: true,
  metricData: {
    Errors: true,
    Performance: true
  },
  metricIdentifier: 'appdMetric',
  metricName: 'appdMetric',
  metricPacks: [
    {
      identifier: 'Performance'
    },
    {
      identifier: 'Errors'
    }
  ],
  metricPath: {
    metricPathDropdown_0: {
      path: '',
      value: 'Calls per Minute'
    },
    metricPathDropdown_1: {
      path: 'Calls per Minute',
      value: ''
    }
  },
  name: 'AppD ',
  product: {
    label: 'Application Monitoring',
    value: 'Application Monitoring'
  },
  riskCategory: 'Errors/ERROR',
  serviceInstance: null,
  showCustomMetric: true,
  sli: false,
  type: 'AppDynamics',
  mappedServicesAndEnvs
}
const exectedNewMetricData = {
  basePath: {
    basePathDropdown_0: {
      path: '',
      value: 'Application Infrastructure Performance'
    },
    basePathDropdown_1: {
      path: 'Application Infrastructure Performance',
      value: ''
    }
  },
  continuousVerification: false,
  groupName: {
    label: 'g2',
    value: 'g2'
  },
  healthScore: true,
  higherBaselineDeviation: true,
  lowerBaselineDeviation: true,
  metricIdentifier: 'appdMetricNew',
  metricName: 'appdMetric new',
  metricPath: {
    metricPathDropdown_0: {
      path: '',
      value: 'Hardware Resources'
    },
    metricPathDropdown_1: {
      path: 'Hardware Resources',
      value: ''
    }
  },
  riskCategory: 'Errors/THROUGHPUT',
  serviceInstance: null,
  sli: false
}

expectedMappedMetrics.set('appdMetric', exectedMetricData)
expectedMappedMetrics.set('appdMetric new', exectedNewMetricData)
