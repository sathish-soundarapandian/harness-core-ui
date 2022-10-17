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
              riskCategory: 'Infrastructure',
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
                riskCategory: 'Infrastructure',
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

export const riskCategoryMock = {
  metaData: {},
  resource: [
    { identifier: 'Errors', displayName: 'Errors', timeSeriesMetricType: 'ERROR', cvMonitoringCategory: 'Errors' },
    {
      identifier: 'Infrastructure',
      displayName: 'Infrastructure',
      timeSeriesMetricType: 'INFRA',
      cvMonitoringCategory: 'Infrastructure'
    },
    {
      identifier: 'Performance_Throughput',
      displayName: 'Performance/Throughput',
      timeSeriesMetricType: 'THROUGHPUT',
      cvMonitoringCategory: 'Performance'
    },
    {
      identifier: 'Performance_Other',
      displayName: 'Performance/Other',
      timeSeriesMetricType: 'OTHER',
      cvMonitoringCategory: 'Performance'
    },
    {
      identifier: 'Performance_ResponseTime',
      displayName: 'Performance/Response Time',
      timeSeriesMetricType: 'RESP_TIME',
      cvMonitoringCategory: 'Performance'
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
              deploymentVerification: { enabled: true },
              liveMonitoring: { enabled: true },
              riskProfile: { riskCategory: 'Infrastructure', thresholdTypes: ['ACT_WHEN_HIGHER'] }
            },
            expression: 'gfd',
            groupName: 'G2',
            identifier: 'CustomMetric 1',
            metricName: 'CustomMetric 1',
            responseMapping: { serviceInstanceJsonPath: 'asaa' },
            riskProfile: { riskCategory: 'Infrastructure', thresholdTypes: ['ACT_WHEN_HIGHER'] },
            sli: { enabled: true }
          }
        ],
        region: 'ap-south-1'
      },
      type: 'CloudWatchMetrics'
    }
  ],
  healthSourceName: 'testssss',
  isEdit: true,
  product: { label: 'CloudWatch Metrics', value: 'CloudWatch Metrics' },
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
          higherBaselineDeviation: true,
          liveMonitoring: { enabled: true },
          lowerBaselineDeviation: false,
          riskProfile: {
            riskCategory: 'Infrastructure',
            thresholdTypes: ['ACT_WHEN_HIGHER']
          }
        },
        expression: 'gfd',
        groupName: 'G2',
        identifier: 'CustomMetric 1',
        metricName: 'CustomMetric 1',
        responseMapping: { serviceInstanceJsonPath: 'asaa' },
        riskProfile: {
          riskCategory: 'Infrastructure',
          thresholdTypes: ['ACT_WHEN_HIGHER']
        }
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
          riskCategory: 'Errors',
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
          riskCategory: 'Errors',
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
          riskCategory: 'Errors',
          thresholdTypes: []
        }
      }
    }
  ],
  sli: { enabled: false }
}

export const formValuesMockInvalidRiskCategory = {
  ...formValuesMock,
  customMetrics: [
    {
      identifier: 'Cloudwatch',
      analysis: {
        deploymentVerification: {
          enabled: true
        },
        riskProfile: {
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
    },
    {
      Id: 'q2',
      Label: 'q2',
      StatusCode: 'Complete',
      Timestamps: [1662468780, 1662468600, 1662468540],
      Values: [2.5346635639371526, 1.0433333333333332, 3.266835695100236]
    }
  ]
}

export const emptySampleDataMockResponse = {
  Messages: [],
  MetricDataResults: []
}

export const sampleDataForTest = {
  data: {
    Messages: [],
    MetricDataResults: [
      {
        Id: 'q1',
        Label: 'q1',
        StatusCode: 'Complete',
        Timestamps: [1662468780, 1662468600, 1662468540],
        Values: [3.5346635639371526, 0.04333333333333329, 0.2668356951002362]
      },
      {
        Id: 'q2',
        Label: 'q2',
        StatusCode: 'Complete',
        Timestamps: [1662468780, 1662468600, 1662468540],
        Values: [2.5346635639371526, 1.0433333333333332, 3.266835695100236]
      }
    ]
  }
}

export const chartSeriesValue = [
  {
    data: [
      { x: 1662468780000, y: 3.5346635639371526 },
      { x: 1662468600000, y: 0.04333333333333329 },
      { x: 1662468540000, y: 0.2668356951002362 }
    ],
    type: 'line',
    name: 'q1'
  },
  {
    data: [
      { x: 1662468780000, y: 2.5346635639371526 },
      { x: 1662468600000, y: 1.0433333333333332 },
      { x: 1662468540000, y: 3.266835695100236 }
    ],
    type: 'line',
    name: 'q2'
  }
]

export const testPathParams = {
  accountId: 'accountId',
  orgIdentifier: 'orgIdentifier',
  projectIdentifier: 'projectIdentifier'
}

export const riskCategoryErrorMock = {
  'customMetrics.0.analysis.lowerBaselineDeviation': 'cv.monitoringSources.prometheus.validation.deviation',
  'customMetrics.0.analysis.riskProfile.riskCategory':
    'cv.monitoringSources.gco.mapMetricsToServicesPage.validation.riskCategory',
  'customMetrics.0.expression': 'cv.healthSource.connectors.CloudWatch.validationMessage.expression',
  'customMetrics.0.groupName': 'cv.monitoringSources.prometheus.validation.groupName',
  'customMetrics.0.identifier': 'cv.monitoringSources.metricIdentifierPattern',
  'customMetrics.0.metricName': 'cv.monitoringSources.metricNameValidation',
  'customMetrics.0.responseMapping.serviceInstanceJsonPath': 'cv.monitoringSources.gcoLogs.validation.serviceInstance',
  region: 'cd.cloudFormation.errors.region'
}
