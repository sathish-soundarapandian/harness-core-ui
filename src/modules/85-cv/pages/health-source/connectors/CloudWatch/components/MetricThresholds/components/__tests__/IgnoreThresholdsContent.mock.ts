import type { GroupedCreatedMetrics } from '@cv/pages/health-source/common/CustomMetric/CustomMetric.types'
import type { MetricThresholdCommonProps } from '@cv/pages/health-source/connectors/CloudWatch/CloudWatch.types'

const mockedFormValues = {
  metricName: 'CustomHealth Metric',
  metricIdentifier: 'CustomHealth_Metric',
  region: '',
  groupName: {
    label: 'G1',
    value: 'G1'
  },
  continuousVerification: true,
  healthScore: false,
  sli: false,
  riskCategory: 'Performance/RESP_TIME',
  serviceInstanceIdentifier: '$.[*].metricName',
  lowerBaselineDeviation: false,
  higherBaselineDeviation: true,
  customMetrics: [],
  queryType: 'HOST_BASED',
  requestMethod: 'GET',
  selectedCustomMetricIndex: 0,
  query: '',
  ignoreThresholds: [
    {
      type: 'IgnoreThreshold',
      spec: {
        action: 'Ignore'
      },
      criteria: {
        type: 'Absolute',
        spec: {
          greaterThan: 12
        }
      },
      metricType: 'Custom',
      metricName: 'CustomHealth Metric'
    }
  ],
  failFastThresholds: [
    {
      type: 'FailImmediately',
      spec: {
        action: 'FailAfterOccurrence',
        spec: {
          count: 12
        }
      },
      criteria: {
        type: 'Percentage',
        spec: {
          greaterThan: 65
        }
      },
      metricType: 'Custom',
      metricName: 'CustomHealth Metric'
    }
  ]
}

export const MockContextValues = {
  formikValues: mockedFormValues,
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
        metricName: 'dataDogMetric',
        continuousVerification: true
      }
    ]
  } as GroupedCreatedMetrics
} as MetricThresholdCommonProps

export const formikInitialValues = {
  ...mockedFormValues,
  ignoreThresholds: [
    {
      metricType: 'Custom',
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
      metricType: 'Custom',
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
