import type { CommonCustomMetricsType } from '../CustomMetric.types'

export const customMetricMock: CommonCustomMetricsType = {
  identifier: 'cwmetric4',
  metricName: 'cw-metric-4',
  riskProfile: {
    category: 'Errors',
    metricType: 'ERROR',
    thresholdTypes: ['ACT_WHEN_HIGHER', 'ACT_WHEN_LOWER']
  },
  analysis: {},
  sli: {
    enabled: false
  },
  groupName: 'g2',
  expression: 'SELECT AVG(CPUUtilization) FROM SCHEMA("AWS/EC2", InstanceId)'
}

export const customMetricMockForPayload = {
  ...customMetricMock,
  groupName: { label: 'g2', value: 'g2' }
}

export const customMetricMockWithoutSLI = {
  identifier: 'id_123',
  metricName: 'myMetric',
  analysis: {},
  groupName: { label: 'g2', value: 'g2' },
  expression: 'SELECT AVG(CPUUtilization) FROM SCHEMA("AWS/EC2", InstanceId)'
}

export const customMetricMock2: CommonCustomMetricsType = {
  ...customMetricMock,
  metricName: '2 new',
  identifier: '2_new'
}

export const invalidCustomMetricMock: CommonCustomMetricsType = {
  identifier: 'cwmetric4',
  metricName: 'cw-metric-4',
  riskProfile: {
    category: 'Errors',
    metricType: 'ERROR',
    thresholdTypes: ['ACT_WHEN_HIGHER', 'ACT_WHEN_LOWER']
  },
  sli: {
    enabled: true
  },
  groupName: 'g2',
  expression: 'SELECT AVG(CPUUtilization) FROM SCHEMA("AWS/EC2", InstanceId)'
}

export const invalidCustomMetricMock2: CommonCustomMetricsType = {
  ...invalidCustomMetricMock,
  analysis: {}
}

export const customMetricFormikUpdatedExpected = [
  {
    analysis: {},
    expression: 'SELECT AVG(CPUUtilization) FROM SCHEMA("AWS/EC2", InstanceId)',
    groupName: { label: 'g2', value: 'g2' },
    identifier: 'cwmetric4',
    metricName: 'cw-metric-4',
    riskProfile: { category: 'Errors', metricType: 'ERROR', thresholdTypes: ['ACT_WHEN_HIGHER', 'ACT_WHEN_LOWER'] },
    sli: { enabled: true }
  }
]

export const formikValuesMock = {
  customMetrics: [customMetricMock],
  selectedCustomMetricIndex: 0
}

export const metricPack = {
  metaData: {},
  resource: [
    {
      uuid: 'S2vfVwx8TSCkcxjSXLZupg',
      accountId: 'kmpySmUISimoRrJL6NL73w',
      orgIdentifier: 'default',
      projectIdentifier: 'Demo',
      dataSourceType: 'CLOUDWATCH_METRICS',
      identifier: 'Errors',
      category: 'Errors',
      metrics: [
        {
          name: 'Number of Errors',
          metricIdentifier: 'Number of Errors',
          type: 'ERROR',
          path: 'Errors|__tier_name__|__metric_filter__|Number of Errors',
          validationPath: 'Overall Application Performance|__tier_name__|Exceptions per Minute',
          responseJsonPath: null,
          validationResponseJsonPath: null,
          thresholds: [],
          included: true
        }
      ],
      thresholds: null
    },
    {
      uuid: 'mvMy4bRuQ-uBju4hH2WKxw',
      accountId: 'kmpySmUISimoRrJL6NL73w',
      orgIdentifier: 'default',
      projectIdentifier: 'Demo',
      dataSourceType: 'CLOUDWATCH_METRICS',
      identifier: 'Performance',
      category: 'Performance',
      metrics: [
        {
          name: 'Average Wait Time (ms)',
          metricIdentifier: 'Average Wait Time (ms)',
          type: 'RESP_TIME',
          path: 'Business Transaction Performance|Business Transactions|__tier_name__|__metric_filter__|Average Wait Time (ms)',
          validationPath: null,
          responseJsonPath: null,
          validationResponseJsonPath: null,
          thresholds: [],
          included: false
        },
        {
          name: 'Calls per Minute',
          metricIdentifier: 'test 1',
          type: 'THROUGHPUT',
          path: 'Business Transaction Performance|Business Transactions|__tier_name__|__metric_filter__|Calls per Minute',
          validationPath: 'Overall Application Performance|__tier_name__|Calls per Minute',
          responseJsonPath: null,
          validationResponseJsonPath: null,
          thresholds: [],
          included: true
        },
        {
          name: 'Number of Very Slow Calls',
          metricIdentifier: 'test 1',
          type: 'ERROR',
          path: 'Business Transaction Performance|Business Transactions|__tier_name__|__metric_filter__|Number of Very Slow Calls',
          validationPath: 'Overall Application Performance|__tier_name__|Number of Very Slow Calls',
          responseJsonPath: null,
          validationResponseJsonPath: null,
          thresholds: [],
          included: false
        }
      ],
      thresholds: null
    }
  ],
  responseMessages: []
}

export const metricPackResponse = [
  { label: 'Errors/Number of Errors', value: 'Errors/ERROR' },
  { label: 'Performance/Average Wait Time (ms)', value: 'Performance/RESP_TIME' },
  { label: 'Performance/Calls per Minute', value: 'Performance/THROUGHPUT' },
  { label: 'Performance/Number of Very Slow Calls', value: 'Performance/ERROR' }
]

export const analysisMock = {
  riskProfile: { category: 'Errors' },
  deploymentVerification: { enabled: true }
}

export const analysisFormikMock = {
  a: 1,
  higherBaselineDeviation: false,
  lowerBaselineDeviation: false,
  riskProfile: {}
}

export const payloadMock = [
  {
    analysis: {},
    expression: 'SELECT AVG(CPUUtilization) FROM SCHEMA("AWS/EC2", InstanceId)',
    groupName: 'g2',
    identifier: 'cwmetric4',
    metricName: 'cw-metric-4',
    riskProfile: {},
    sli: { enabled: false }
  }
]

export const payloadMock2 = [
  {
    analysis: {},
    expression: 'SELECT AVG(CPUUtilization) FROM SCHEMA("AWS/EC2", InstanceId)',
    groupName: 'g2',
    identifier: 'id_123',
    metricName: 'myMetric',
    riskProfile: {},
    sli: { enabled: false }
  }
]
