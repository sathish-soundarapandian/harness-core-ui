import { ThresholdTypes } from '../CommonHealthSource.constants'

export const expectedHealthSourceData = {
  applicationName: 'PR-git-experiment',
  connectorRef: 'TestAppD',
  identifier: 'AppD_Single',
  isEdit: true,
  mappedServicesAndEnvs: new Map(),
  metricPacks: [
    {
      identifier: 'Performance',
      metricThresholds: [
        {
          metricType: 'Performance',
          groupName: undefined,
          metricName: undefined,
          type: ThresholdTypes.IgnoreThreshold,
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
      ]
    },
    {
      identifier: 'Errors',
      metricThresholds: [
        {
          metricType: 'Errors',
          groupName: undefined,
          metricName: undefined,
          type: ThresholdTypes.FailImmediately,
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
  ],
  name: 'AppD Single',
  product: {
    label: 'Application Monitoring',
    value: 'Application Monitoring'
  },
  tierName: 'cvng',
  type: 'SumoLogic'
}

export const expectedThresholdsInitialData = {
  appDTier: 'cvng',
  appdApplication: 'PR-git-experiment',
  failFastThresholds: [
    {
      criteria: { spec: { greaterThan: 0, lessThan: 0 }, type: 'Absolute' },
      groupName: undefined,
      metricName: undefined,
      metricType: 'Errors',
      spec: { action: 'FailImmediately', spec: {} },
      type: 'FailImmediately'
    }
  ],
  ignoreThresholds: [
    {
      criteria: { spec: { greaterThan: 0, lessThan: 0 }, type: 'Absolute' },
      groupName: undefined,
      metricName: undefined,
      metricType: 'Performance',
      spec: { action: 'Ignore' },
      type: 'IgnoreThreshold'
    }
  ],
  metricData: { Errors: true, Performance: true },
  metricPacks: [
    {
      identifier: 'Performance',
      metricThresholds: [
        {
          criteria: { spec: { greaterThan: 0, lessThan: 0 }, type: 'Absolute' },
          groupName: undefined,
          metricName: undefined,
          metricType: 'Performance',
          spec: { action: 'Ignore' },
          type: 'IgnoreThreshold'
        }
      ]
    },
    {
      identifier: 'Errors',
      metricThresholds: [
        {
          criteria: { spec: { greaterThan: 0, lessThan: 0 }, type: 'Absolute' },
          groupName: undefined,
          metricName: undefined,
          metricType: 'Errors',
          spec: { action: 'FailImmediately', spec: {} },
          type: 'FailImmediately'
        }
      ]
    }
  ]
}

export const healthSourceMetricValue = {
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
  completeMetricPath: 'Overall Application Performance|cvng|Calls per Minute',
  groupName: {
    label: 'Group 1',
    value: 'Group 1'
  },
  healthScore: true,
  higherBaselineDeviation: true,
  lowerBaselineDeviation: true,
  metricName: 'appdMetric',
  metricIdentifier: 'appdMetric',
  metricPath: {
    metricPathDropdown_0: {
      path: '',
      isMetric: true,
      value: 'Calls per Minute'
    },
    metricPathDropdown_1: {
      isMetric: false,
      path: 'Calls per Minute',
      value: ''
    }
  },
  riskCategory: 'Errors/ERROR',
  serviceInstanceMetricPath: 'Individual Nodes|*|Errors per Minute',
  sli: true
}
