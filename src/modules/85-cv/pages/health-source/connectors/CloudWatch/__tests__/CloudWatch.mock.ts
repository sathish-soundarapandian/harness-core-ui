import type { CloudWatchSetupSource } from '../CloudWatch.types'

export const mockData: CloudWatchSetupSource = {
  connectorRef: 'testAWS',
  isEdit: true,
  healthSourceList: [
    {
      type: 'CloudWatchMetrics',
      name: 'testssss',
      identifier: 'testssss',
      spec: {
        region: 'ap-south-1',
        connectorRef: 'testAWS',
        feature: 'CloudWatch Metrics',
        metricDefinitions: [
          {
            identifier: 'CustomMetric 1',
            metricName: 'CustomMetric 1',
            riskProfile: {
              category: 'Infrastructure',
              metricType: 'INFRA',
              thresholdTypes: ['ACT_WHEN_HIGHER']
            },
            analysis: {
              liveMonitoring: {
                enabled: true
              },
              deploymentVerification: {
                enabled: true
              },
              riskProfile: {
                category: 'Infrastructure',
                metricType: 'INFRA',
                thresholdTypes: ['ACT_WHEN_HIGHER']
              }
            },
            sli: {
              enabled: true
            },
            groupName: 'G2',
            expression: 'gfd',
            responseMapping: {
              serviceInstanceJsonPath: 'asaa'
            }
          }
        ]
      }
    }
  ],
  healthSourceName: 'testssss',
  healthSourceIdentifier: 'testssss',
  sourceType: 'CloudWatchMetrics',
  product: {
    label: 'CloudWatch Metrics',
    value: 'CloudWatch Metrics'
  }
}

export const emptyHealthSource: CloudWatchSetupSource = {
  connectorRef: 'testAWS',
  isEdit: false,
  healthSourceList: [],
  product: {
    value: 'CloudWatch Metrics',
    label: 'Cloud Metrics'
  },
  sourceType: 'Aws',
  healthSourceName: 'cloudWatchTest',
  healthSourceIdentifier: 'cloudWatchTest'
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
          name: 'Stall Count',
          metricIdentifier: 'test 1',
          type: 'ERROR',
          path: 'Business Transaction Performance|Business Transactions|__tier_name__|__metric_filter__|Stall Count',
          validationPath: 'Overall Application Performance|__tier_name__|Stall Count',
          responseJsonPath: null,
          validationResponseJsonPath: null,
          thresholds: [],
          included: true
        },
        {
          name: 'Number of Slow Calls',
          metricIdentifier: 'test 1',
          type: 'ERROR',
          path: 'Business Transaction Performance|Business Transactions|__tier_name__|__metric_filter__|Number of Slow Calls',
          validationPath: 'Overall Application Performance|__tier_name__|Number of Slow Calls',
          responseJsonPath: null,
          validationResponseJsonPath: null,
          thresholds: [],
          included: false
        },
        {
          name: '95th Percentile Response Time (ms)',
          metricIdentifier: 'test 1',
          type: 'RESP_TIME',
          path: 'Business Transaction Performance|Business Transactions|__tier_name__|__metric_filter__|95th Percentile Response Time (ms)',
          validationPath: null,
          responseJsonPath: null,
          validationResponseJsonPath: null,
          thresholds: [],
          included: false
        },
        {
          name: 'Normal Average Response Time (ms)',
          metricIdentifier: 'test 1',
          type: 'RESP_TIME',
          path: 'Business Transaction Performance|Business Transactions|__tier_name__|__metric_filter__|Normal Average Response Time (ms)',
          validationPath: 'Overall Application Performance|__tier_name__|Normal Average Response Time (ms)',
          responseJsonPath: null,
          validationResponseJsonPath: null,
          thresholds: [],
          included: false
        },
        {
          name: 'Errors per Minute',
          metricIdentifier: 'test 1',
          type: 'ERROR',
          path: 'Business Transaction Performance|Business Transactions|__tier_name__|__metric_filter__|Errors per Minute',
          validationPath: 'Overall Application Performance|__tier_name__|Errors per Minute',
          responseJsonPath: null,
          validationResponseJsonPath: null,
          thresholds: [],
          included: true
        },
        {
          name: 'Average Response Time (ms)',
          metricIdentifier: 'test 1',
          type: 'RESP_TIME',
          path: 'Business Transaction Performance|Business Transactions|__tier_name__|__metric_filter__|Average Response Time (ms)',
          validationPath: 'Overall Application Performance|__tier_name__|Average Response Time (ms)',
          responseJsonPath: null,
          validationResponseJsonPath: null,
          thresholds: [],
          included: true
        },
        {
          name: 'Average Block Time (ms)',
          metricIdentifier: 'test 1',
          type: 'RESP_TIME',
          path: 'Business Transaction Performance|Business Transactions|__tier_name__|__metric_filter__|Average Block Time (ms)',
          validationPath: null,
          responseJsonPath: null,
          validationResponseJsonPath: null,
          thresholds: [],
          included: false
        },
        {
          name: 'Average CPU Used (ms)',
          metricIdentifier: 'test 1',
          type: 'INFRA',
          path: 'Business Transaction Performance|Business Transactions|__tier_name__|__metric_filter__|Average CPU Used (ms)',
          validationPath: null,
          responseJsonPath: null,
          validationResponseJsonPath: null,
          thresholds: [],
          included: false
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

export const submitRequestDataPayload = {
  connectorRef: 'testAWS',
  healthSourceIdentifier: 'testssss',
  healthSourceList: [
    {
      identifier: 'testssss',
      name: 'testssss',
      spec: {
        connectorRef: 'testAWS',
        feature: 'CloudWatch Metrics',
        metricDefinitions: [
          {
            analysis: {
              deploymentVerification: {
                enabled: true
              },
              liveMonitoring: {
                enabled: true
              },
              riskProfile: {
                category: 'Infrastructure',
                metricType: 'INFRA',
                thresholdTypes: ['ACT_WHEN_HIGHER']
              }
            },
            expression: 'gfd',
            groupName: 'G2',
            identifier: 'CustomMetric 1',
            metricName: 'CustomMetric 1',
            responseMapping: {
              serviceInstanceJsonPath: 'asaa'
            },
            riskProfile: {
              category: 'Infrastructure',
              metricType: 'INFRA',
              thresholdTypes: ['ACT_WHEN_HIGHER']
            },
            sli: {
              enabled: true
            }
          }
        ],
        region: 'ap-south-1'
      },
      type: 'CloudWatchMetrics'
    }
  ],
  healthSourceName: 'testssss',
  isEdit: true,
  product: {
    label: 'CloudWatch Metrics',
    value: 'CloudWatch Metrics'
  },
  sourceType: 'CloudWatchMetrics'
}

export const submitRequestFormikPayload = {
  identifier: 'testssss',
  name: 'testssss',
  spec: {
    connectorRef: 'testAWS',
    feature: 'CloudWatch Metrics',
    metricDefinitions: [
      {
        analysis: {
          deploymentVerification: { enabled: true },
          liveMonitoring: { enabled: true },
          higherBaselineDeviation: true,
          lowerBaselineDeviation: false,
          riskProfile: { category: 'Infrastructure', metricType: 'INFRA', thresholdTypes: ['ACT_WHEN_HIGHER'] }
        },
        expression: 'gfd',
        groupName: 'G2',
        identifier: 'CustomMetric 1',
        metricName: 'CustomMetric 1',
        responseMapping: { serviceInstanceJsonPath: 'asaa' },
        riskProfile: { category: 'Infrastructure', metricType: 'INFRA', thresholdTypes: ['ACT_WHEN_HIGHER'] },
        sli: { enabled: true }
      }
    ],
    region: 'ap-south-1'
  },
  type: 'CloudWatchMetrics'
}

export const initialValueMock = {
  isEdit: false
}

export const defaultFormikValue = { customMetrics: [], region: '', selectedCustomMetricIndex: 0 }

export const formValuesMock = {
  region: '',
  customMetrics: [],
  selectedCustomMetricIndex: 0
}

export const formValuesMockNoAssign = {
  ...formValuesMock,
  customMetrics: [
    {
      analysis: {
        liveMonitoring: {
          enabled: true
        },
        riskProfile: {
          category: 'Errors',
          thresholdTypes: []
        }
      }
    }
  ],
  sli: { enabled: false }
}

export const formValuesMockNoServiceInstance = {
  ...formValuesMock,
  customMetrics: [
    {
      analysis: {
        deploymentVerification: {
          enabled: true
        },
        riskProfile: {
          category: 'Errors',
          thresholdTypes: []
        }
      }
    }
  ],
  sli: { enabled: false }
}

export const formValuesMockInvalidMetricIdentifier = {
  ...formValuesMock,
  customMetrics: [
    {
      identifier: 'Cloudwatch',
      analysis: {
        deploymentVerification: {
          enabled: true
        },
        riskProfile: {
          category: 'Errors',
          thresholdTypes: []
        }
      }
    }
  ],
  sli: { enabled: false }
}

export const assignErrorMock = {
  'customMetrics.0.expression': 'cv.healthSource.connectors.CloudWatch.validationMessage.expression',
  'customMetrics.0.groupName': 'cv.monitoringSources.prometheus.validation.groupName',
  'customMetrics.0.identifier': 'cv.monitoringSources.metricIdentifierValidation',
  'customMetrics.0.metricName': 'cv.monitoringSources.metricNameValidation',
  'customMetrics.0.analysis.lowerBaselineDeviation': 'cv.monitoringSources.prometheus.validation.deviation',
  region: 'cd.cloudFormation.errors.region'
}

export const serviceInstanceErrorMock = {
  ...assignErrorMock,
  'customMetrics.0.responseMapping.serviceInstanceJsonPath': 'cv.monitoringSources.gcoLogs.validation.serviceInstance'
}

export const identifierInvalidValidationError = {
  ...serviceInstanceErrorMock,
  'customMetrics.0.identifier': 'cv.monitoringSources.metricIdentifierPattern'
}

export const sampleDataMockResponse = {
  Messages: [],
  MetricDataResults: [
    {
      Id: 'q1',
      Label: 'q1',
      StatusCode: 'Complete',
      Timestamps: [1662468780, 1662468600, 1662468540],
      Values: [3.5346635639371526, 0.04333333333333329, 0.2668356951002362]
    }
  ]
}

export const testPathParams = {
  accountId: 'accountId',
  orgIdentifier: 'orgIdentifier',
  projectIdentifier: 'projectIdentifier'
}
