import {
  failFastThresholdsMockData,
  ignoreThresholdsMockData
} from '@cv/pages/health-source/connectors/AppDynamics/__tests__/AppDMonitoredSource.mock'
import {
  DefaultCustomMetricGroupName,
  MetricCriteriaValues,
  PercentageCriteriaDropdownValues
} from '../MetricThresholds.constants'

export const groupedCreatedMetrics = {
  'group 1': [
    {
      groupName: {
        label: 'group 1',
        value: 'group1'
      },
      index: 0,
      metricName: 'test metric'
    }
  ]
}

export const exceptionalGroupedCreatedMetrics = {
  '+ Add New': [
    {
      groupName: {
        label: 'group 1',
        value: 'group1'
      },
      index: 0,
      metricName: 'test metric'
    }
  ]
}

export const groupedCreatedMetricsDefault = {
  [DefaultCustomMetricGroupName]: [
    {
      groupName: {
        label: DefaultCustomMetricGroupName,
        value: DefaultCustomMetricGroupName
      },
      index: 0,
      metricName: 'test metric'
    }
  ]
}

export const mockThresholdValue = {
  metricType: 'test',
  groupName: 'test',
  metricName: 'test',
  type: 'FailImmediately',
  spec: {
    action: 'FailAfterOccurrence',
    spec: {
      count: 1
    }
  },
  criteria: {
    type: MetricCriteriaValues.Percentage,
    criteriaPercentageType: PercentageCriteriaDropdownValues.LessThan,
    spec: {
      lessThan: 10
    }
  }
}

export const metricPacksMock = [
  {
    identifier: 'Performance',
    metrics: [
      {
        name: 'Performance test name',
        metricIdentifier: 'PerformanceID'
      }
    ]
  }
]

export const metricThresholdsPayloadMockData = [
  {
    identifier: 'Performance',
    metricThresholds: [
      {
        criteria: { criteriaPercentageType: 'lessThan', spec: { lessThan: 1 }, type: 'Percentage' },
        groupName: 'testP2',
        metricName: 'average_wait_time_ms',
        metricType: 'Performance',
        spec: { action: 'Ignore' },
        type: 'IgnoreThreshold'
      },
      {
        criteria: { criteriaPercentageType: 'greaterThan', spec: { greaterThan: 12 }, type: 'Percentage' },
        groupName: 'testP',
        metricName: 'stall_count',
        metricType: 'Performance',
        spec: { action: 'Ignore' },
        type: 'IgnoreThreshold'
      },
      {
        criteria: { criteriaPercentageType: 'greaterThan', spec: { greaterThan: 22 }, type: 'Percentage' },
        groupName: 'testPE',
        metricName: 'average_response_time_ms',
        metricType: 'Performance',
        spec: { action: 'FailAfterOccurrence', spec: { count: 2 } },
        type: 'FailImmediately'
      }
    ]
  },
  {
    identifier: 'Custom',
    metricThresholds: [
      {
        criteria: { criteriaPercentageType: 'greaterThan', spec: { greaterThan: 12 }, type: 'Percentage' },
        groupName: 'testP',
        metricName: 'stall_count',
        metricType: 'Custom',
        spec: { action: 'Ignore' },
        type: 'IgnoreThreshold'
      }
    ]
  }
]

export const formInitialValues = {
  ignoreThresholds: [{}],
  failFastThresholds: [{}]
}

export const formDataMock = {
  metricData: {
    Performance: true,
    Errors: false
  },
  ignoreThresholds: ignoreThresholdsMockData,
  failFastThresholds: failFastThresholdsMockData
}
