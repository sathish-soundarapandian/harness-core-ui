import { mockedNewRelicFormikValues } from '@cv/pages/health-source/connectors/NewRelic/__tests__/NewRelic.mock'
import type { CommonHealthSourceConfigurations } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.types'

export const setThresholdStateMockFn = jest.fn()

export const MockContextValues = {
  formikValues: {
    metricPacks: [
      {
        identifier: 'Performance'
      }
    ],
    metricData: {
      Performance: true
    },
    queryMetricsMap: new Map(),
    failFastThresholds: [],
    ignoreThresholds: [],
    selectedMetric: ''
  } as CommonHealthSourceConfigurations,
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
        metricName: 'appdMetric',
        continuousVerification: true
      }
    ]
  },
  setThresholdState: setThresholdStateMockFn
}

export const formikInitialValues = {
  ...mockedNewRelicFormikValues,
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
