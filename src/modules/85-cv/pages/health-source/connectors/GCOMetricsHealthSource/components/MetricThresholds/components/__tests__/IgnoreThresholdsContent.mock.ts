import type { GroupedCreatedMetrics } from '@cv/pages/health-source/common/CustomMetric/CustomMetric.types'
import type { MetricThresholdsState } from '@cv/pages/health-source/common/MetricThresholds/MetricThresholds.types'
import type { GCOMetricInfo } from '@cv/pages/health-source/connectors/GCOMetricsHealthSource/GCOMetricsHealthSource.type'

export const setThresholdStateMockFn = jest.fn()

const mockedFormValues: GCOMetricInfo = {
  metricName: 'kubernetes.io/container/restart_count',
  identifier: 'kubernetes.io/container/restart_count',
  query:
    '{\n  "dataSets": [\n    {\n      "timeSeriesQuery": {\n        "timeSeriesFilter": {\n          "filter": "metric.type=\\"kubernetes.io/container/restart_count\\" resource.type=\\"k8s_container\\"",\n          "aggregation": {\n            "perSeriesAligner": "ALIGN_RATE",\n            "crossSeriesReducer": "REDUCE_SUM"\n          }\n        }\n      }\n    }\n  ]\n}',
  metricTags: {
    'Restart count - Works': ''
  },
  isManualQuery: false,
  dashboardName: 'TestDashboard',
  dashboardPath: 'projects/145904791365/dashboards/59a9ca97-65f5-45ef-a270-da71e3b6704c',
  serviceInstanceField: 'test instance',
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
  formikValues: mockedFormValues as GCOMetricInfo,
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
        metricName: 'GCOMetric',
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
