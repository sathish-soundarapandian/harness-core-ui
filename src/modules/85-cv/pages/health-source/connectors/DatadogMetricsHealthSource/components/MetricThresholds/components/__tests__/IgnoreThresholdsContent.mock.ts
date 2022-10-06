import type { GroupedCreatedMetrics } from '@cv/pages/health-source/common/CustomMetric/CustomMetric.types'
import type { MetricThresholdsState } from '@cv/pages/health-source/common/MetricThresholds/MetricThresholds.types'
import type { DatadogMetricInfo } from '@cv/pages/health-source/connectors/DatadogMetricsHealthSource/DatadogMetricsHealthSource.type'

export const setThresholdStateMockFn = jest.fn()

const mockedFormValues = {
  identifier: 'test1',
  metricPath: 'test1',
  metricName: 'test1',
  aggregator: 'avg',
  metric: 'No matching data.',
  groupName: {
    label: 'G2',
    value: 'G2'
  },
  metricTags: [],
  isManualQuery: false,
  isCustomCreatedMetric: true,
  riskCategory: '',
  higherBaselineDeviation: false,
  lowerBaselineDeviation: false,
  query: 'avg:No matching data.{*}.rollup(avg, 60)',
  groupingQuery: 'avg:No matching data.{*}.rollup(avg, 60)',
  serviceInstanceIdentifierTag: '',
  serviceInstance: '',
  continuousVerification: false,
  healthScore: false,
  sli: true,
  ignoreThresholds: [
    {
      type: 'IgnoreThreshold',
      spec: {
        action: 'Ignore'
      },
      criteria: {
        type: 'Absolute',
        spec: {
          greaterThan: 54
        }
      },
      metricType: 'Custom',
      metricName: 'test1'
    }
  ],
  failFastThresholds: [
    {
      type: 'FailImmediately',
      spec: {
        action: 'FailAfterOccurrence',
        spec: {
          count: 45
        }
      },
      criteria: {
        type: 'Percentage',
        spec: {
          greaterThan: 87
        },
        criteriaPercentageType: 'greaterThan'
      },
      metricType: 'Custom',
      metricName: 'test1'
    }
  ]
}

export const MockContextValues = {
  formikValues: mockedFormValues as DatadogMetricInfo,
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
  } as GroupedCreatedMetrics,
  setThresholdState: setThresholdStateMockFn as React.Dispatch<React.SetStateAction<MetricThresholdsState>>
}

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
