export const formikInitialValues = {
  name: 'appd',
  identifier: 'appd',
  connectorRef: 'org.appdprod',
  isEdit: true,
  type: 'AppDynamics',
  pathType: 'fullPath',
  fullPath: 'Overall Application Performance|manager|Calls per Minute',
  completeMetricPath: 'Overall Application Performance|manager|Calls per Minute',
  mappedServicesAndEnvs: {},
  metricPath: {
    metricPathDropdown_0: {
      value: 'Calls per Minute',
      path: '',
      isMetric: true
    },
    metricPathDropdown_1: {
      value: '',
      path: 'Calls per Minute',
      isMetric: false
    }
  },
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
  metricName: 'appdMetric',
  metricIdentifier: 'appdMetric',
  riskCategory: 'Performance/THROUGHPUT',
  serviceInstance: null,
  lowerBaselineDeviation: false,
  higherBaselineDeviation: true,
  product: '',
  groupName: {
    label: 'g1',
    value: 'g1'
  },
  continuousVerification: true,
  healthScore: true,
  sli: true,
  serviceInstanceMetricPath: 'Individual Nodes|*|Calls per Minute',
  appdApplication: 'QA',
  appDTier: 'manager',
  metricPacks: [
    {
      identifier: 'Performance'
    },
    {
      identifier: 'Errors'
    }
  ],
  metricData: {
    Performance: true,
    Errors: true
  },
  showCustomMetric: true,
  ignoreThresholds: [
    {
      metricType: null,
      groupName: null,
      metricName: null,
      type: 'IgnoreThreshold',
      spec: {
        action: 'Ignore'
      },
      criteria: {
        type: 'Absolute',
        spec: {
          greaterThan: 0,
          lessThan: 0
        }
      }
    }
  ],
  failFastThresholds: [
    {
      metricType: null,
      groupName: null,
      metricName: null,
      type: 'FailImmediately',
      spec: {
        action: 'FailImmediately',
        spec: {}
      },
      criteria: {
        type: 'Absolute',
        spec: {
          greaterThan: 0,
          lessThan: 0
        }
      }
    }
  ]
}

export const AppDMetricThresholdProps = {
  formikValues: formikInitialValues,
  metricPacks: [
    {
      identifier: 'Performance'
    },
    {
      identifier: 'Errors'
    }
  ],
  groupedCreatedMetrics: {
    g1: [
      {
        groupName: {
          label: 'g1',
          value: 'g1'
        },
        metricName: 'appdMetric'
      }
    ]
  },
  setNonCustomFeilds: jest.fn()
}
