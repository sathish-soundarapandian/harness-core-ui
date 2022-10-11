import type { GroupedCreatedMetrics } from '@cv/pages/health-source/common/CustomMetric/CustomMetric.types'
import type { MetricThresholdsState } from '@cv/pages/health-source/common/MetricThresholds/MetricThresholds.types'
import type { MapCustomHealthToService } from '@cv/pages/health-source/connectors/CustomHealthSource/CustomHealthSource.types'

export const setThresholdStateMockFn = jest.fn()

const mockedFormValues = {
  metricName: 'CustomHealth Metric',
  metricIdentifier: 'CustomHealth_Metric',
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
  queryType: 'HOST_BASED',
  requestMethod: 'GET',
  query: '',
  baseURL: '',
  pathURL:
    'rest/applications/cv-app/metric-data?metric-path=Overall%20Application%20Performance%7C*%7CAverage%20Response%20Time%20%28ms%29&time-range-type=BETWEEN_TIMES&start-time=start_time&end-time=end_time&rollup=false&output=json',
  metricValue: '$.[*].metricValues.[*].max',
  timestamp: '$.[*].metricValues.[*].value',
  timestampFormat: '',
  serviceInstancePath: '$.[*].metricName',
  startTime: {
    placeholder: 'start_time',
    timestampFormat: 'MILLISECONDS',
    customTimestampFormat: ''
  },
  endTime: {
    placeholder: 'end_time',
    timestampFormat: 'MILLISECONDS',
    customTimestampFormat: ''
  },
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
        },
        criteriaPercentageType: 'greaterThan'
      },
      metricType: 'Custom',
      metricName: 'CustomHealth Metric'
    }
  ]
}

export const MockContextValues = {
  formikValues: mockedFormValues as MapCustomHealthToService,
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
