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
