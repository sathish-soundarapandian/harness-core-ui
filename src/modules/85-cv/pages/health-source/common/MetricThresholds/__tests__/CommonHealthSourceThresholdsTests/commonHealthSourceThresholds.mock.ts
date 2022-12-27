export const ignoreThresholdsMockData = [
  {
    metricType: 'Performance',
    groupName: 'testP2',
    metricName: 'average_wait_time_ms',
    type: 'IgnoreThreshold',
    spec: {
      action: 'Ignore'
    },
    criteria: {
      type: 'Percentage',
      spec: {
        lessThan: 1
      }
    }
  },
  {
    metricType: 'Performance',
    groupName: 'testP',
    metricName: 'stall_count',
    type: 'IgnoreThreshold',
    spec: {
      action: 'Ignore'
    },
    criteria: {
      type: 'Percentage',
      spec: {
        greaterThan: 12
      }
    }
  },
  {
    metricType: 'Custom',
    groupName: 'testP',
    metricName: 'stall_count',
    type: 'IgnoreThreshold',
    spec: {
      action: 'Ignore'
    },
    criteria: {
      type: 'Percentage',
      spec: {
        greaterThan: 12
      }
    }
  },
  {
    metricType: 'Errors',
    groupName: 'testE',
    metricName: 'number_of_errors',
    type: 'IgnoreThreshold',
    spec: {
      action: 'Ignore'
    },
    criteria: {
      type: 'Absolute',
      spec: {
        greaterThan: 13,
        lessThan: 2
      }
    }
  }
]

export const failFastThresholdsMockData = [
  {
    metricType: 'Performance',
    groupName: 'testPE',
    metricName: 'average_response_time_ms',
    type: 'FailImmediately',
    spec: {
      action: 'FailAfterOccurrence',
      spec: {
        count: 2
      }
    },
    criteria: {
      type: 'Percentage',
      spec: {
        greaterThan: 22
      }
    }
  },
  {
    metricType: 'Errors',
    groupName: 'testFE',
    metricName: 'number_of_errors',
    type: 'FailImmediately',
    spec: {
      action: 'FailImmediately',
      spec: {}
    },
    criteria: {
      type: 'Absolute',
      spec: {
        greaterThan: 12,
        lessThan: 1
      }
    }
  }
]

export const expectedThresholdsMock = [
  {
    identifier: 'Performance',
    metricThresholds: [
      {
        criteria: { spec: { lessThan: 1 }, type: 'Percentage' },
        groupName: 'testP2',
        metricName: 'average_wait_time_ms',
        metricType: 'Performance',
        spec: { action: 'Ignore' },
        type: 'IgnoreThreshold'
      },
      {
        criteria: { spec: { greaterThan: 12 }, type: 'Percentage' },
        groupName: 'testP',
        metricName: 'stall_count',
        metricType: 'Performance',
        spec: { action: 'Ignore' },
        type: 'IgnoreThreshold'
      },
      {
        criteria: { spec: { greaterThan: 22 }, type: 'Percentage' },
        groupName: 'testPE',
        metricName: 'average_response_time_ms',
        metricType: 'Performance',
        spec: { action: 'FailAfterOccurrence', spec: { count: 2 } },
        type: 'FailImmediately'
      }
    ]
  }
]

export const formDataMock = {
  metricData: {
    Performance: true,
    Errors: false,
    Custom: true
  },
  ignoreThresholds: ignoreThresholdsMockData,
  failFastThresholds: failFastThresholdsMockData
}

export const expectedValueForCustomMetricThresholds = [
  {
    criteria: { spec: { greaterThan: 12 }, type: 'Percentage' },
    groupName: 'testP',
    metricName: 'stall_count',
    metricType: 'Custom',
    spec: { action: 'Ignore' },
    type: 'IgnoreThreshold'
  }
]

export const expectedAllThresholdsMock = [
  {
    criteria: { spec: { lessThan: 1 }, type: 'Percentage' },
    groupName: 'testP2',
    metricName: 'average_wait_time_ms',
    metricType: 'Performance',
    spec: { action: 'Ignore' },
    type: 'IgnoreThreshold'
  },
  {
    criteria: { spec: { greaterThan: 12 }, type: 'Percentage' },
    groupName: 'testP',
    metricName: 'stall_count',
    metricType: 'Performance',
    spec: { action: 'Ignore' },
    type: 'IgnoreThreshold'
  },
  {
    criteria: { spec: { lessThan: 1 }, type: 'Percentage' },
    groupName: 'testP2',
    metricName: 'average_wait_time_ms',
    metricType: 'Performance',
    spec: { action: 'Ignore' },
    type: 'IgnoreThreshold'
  },
  {
    criteria: { spec: { greaterThan: 12 }, type: 'Percentage' },
    groupName: 'testP',
    metricName: 'stall_count',
    metricType: 'Performance',
    spec: { action: 'Ignore' },
    type: 'IgnoreThreshold'
  },
  {
    criteria: { spec: { greaterThan: 12 }, type: 'Percentage' },
    groupName: 'testP',
    metricName: 'stall_count',
    metricType: 'Custom',
    spec: { action: 'Ignore' },
    type: 'IgnoreThreshold'
  },
  {
    criteria: { spec: { greaterThan: 13, lessThan: 2 }, type: 'Absolute' },
    groupName: 'testE',
    metricName: 'number_of_errors',
    metricType: 'Errors',
    spec: { action: 'Ignore' },
    type: 'IgnoreThreshold'
  }
]

const singleMetricDetailMock = {
  groupName: {
    label: 'group 1',
    value: 'group1'
  },
  index: 0,
  metricName: 'metric 1',
  continuousVerification: true
}

export const groupedCreatedMetricsForPassCVEnableTest = {
  'group 1': [
    {
      ...singleMetricDetailMock
    }
  ]
}

export const groupedCreatedMetricsForFailCVEnableTest = {
  'group 1': [
    {
      ...singleMetricDetailMock,
      continuousVerification: false
    }
  ]
}
