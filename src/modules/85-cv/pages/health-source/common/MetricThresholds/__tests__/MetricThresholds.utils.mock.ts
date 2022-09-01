import {
  failFastThresholdsMockData,
  ignoreThresholdsMockData
} from '@cv/pages/health-source/connectors/AppDynamics/__tests__/AppDMonitoredSource.mock'
import {
  DefaultCustomMetricGroupName,
  MetricCriteriaValues,
  PercentageCriteriaDropdownValues
} from '../MetricThresholds.constants'
import type { MetricThresholdType } from '../MetricThresholds.types'

export const groupedCreatedMetrics = {
  'group 1': [
    {
      groupName: {
        label: 'group 1',
        value: 'group1'
      },
      index: 0,
      metricName: 'test metric',
      continuousVerification: true
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
    Errors: false,
    Custom: true
  },
  ignoreThresholds: ignoreThresholdsMockData,
  failFastThresholds: failFastThresholdsMockData
}

export const formikInitialValuesCriteriaMock = {
  ignoreThresholds: [
    {
      metricType: 'Custom',
      metricName: null,
      type: 'IgnoreThreshold',
      spec: {
        action: 'Ignore'
      },
      criteria: {
        type: 'Percentage',
        spec: {
          lessThan: 21
        }
      }
    }
  ],
  failFastThresholds: []
}

export const singleIgnoreThreshold: MetricThresholdType = {
  metricType: 'Custom',
  type: 'IgnoreThreshold',
  spec: {
    action: 'Ignore'
  },
  criteria: {
    type: 'Percentage',
    spec: {
      greaterThan: 21
    }
  }
}

export const singleFailFastThreshold: MetricThresholdType = {
  metricType: 'Custom',
  type: 'FailImmediately',
  spec: {
    action: 'FailAfterOccurrence'
  },
  criteria: {
    type: 'Percentage',
    spec: {
      greaterThan: 21
    }
  }
}

export const formikInitialValuesCriteriaGreaterThanMock = {
  ignoreThresholds: [singleIgnoreThreshold],
  failFastThresholds: []
}

export const thresholdsForCVEnableTest = {
  ignoreThresgholds: [
    {
      ...singleIgnoreThreshold,
      metricName: 'metric 1'
    },
    {
      ...singleIgnoreThreshold,
      metricName: 'metric 2'
    }
  ],
  failFastThresholds: [
    {
      ...singleFailFastThreshold,
      metricName: 'metric 3'
    },
    {
      ...singleFailFastThreshold,
      metricName: 'metric 4'
    }
  ]
}

const singleMetricDetailMock = {
  groupName: {
    label: 'group 1',
    value: 'group1'
  },
  index: 0,
  metricName: 'metric 1',
  continuousVerification: true
}

export const groupedCreatedMetricsForFailCVEnableTest = {
  'group 1': [
    {
      ...singleMetricDetailMock,
      continuousVerification: false
    }
  ]
}

export const groupedCreatedMetricsForCVEnableTest = {
  'group 1': [
    {
      ...singleMetricDetailMock
    },
    {
      ...singleMetricDetailMock,
      metricName: 'metric 2',
      continuousVerification: false
    },
    {
      ...singleMetricDetailMock,
      metricName: 'metric 3'
    },
    {
      ...singleMetricDetailMock,
      metricName: 'metric 4',
      continuousVerification: false
    }
  ],
  'group 2': [
    {
      groupName: {
        label: 'group 2',
        value: 'group 2'
      },
      index: 0,
      metricName: 'metric 5',
      continuousVerification: true
    }
  ]
}

export const cvEnabledThresholdsExpectedResultMock = {
  failFastThresholds: [
    {
      criteria: { spec: { greaterThan: 21 }, type: 'Percentage' },
      metricName: 'metric 3',
      metricType: 'Custom',
      spec: { action: 'FailAfterOccurrence' },
      type: 'FailImmediately'
    }
  ],
  ignoreThresholds: [
    {
      criteria: { spec: { greaterThan: 21 }, type: 'Percentage' },
      metricName: 'metric 1',
      metricType: 'Custom',
      spec: { action: 'Ignore' },
      type: 'IgnoreThreshold'
    }
  ]
}
