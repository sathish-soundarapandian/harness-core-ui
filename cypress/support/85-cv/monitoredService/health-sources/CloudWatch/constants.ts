const accountId = 'accountId'

export const longInvalidName = Array.from({ length: 63 }).fill('a').join('')

export const awsRegionsCall = `/cv/api/cloudwatch/metrics/regions?routingId=${accountId}`
export const metricPackCall = '/cv/api/metric-pack?*&dataSourceType=CLOUDWATCH_METRICS'
export const monitoredServicePostCall = `/cv/api/monitored-service?routingId=${accountId}&accountId=${accountId}`

export const awsRegionsResponse = {
  status: 'SUCCESS',
  data: ['region 1', 'region 2'],
  metaData: null,
  correlationId: '6474b2da-aa40-4347-bf7b-a7407278328e'
}

export const CloudMetricsSaveResponseBody = {
  orgIdentifier: 'default',
  projectIdentifier: 'project1',
  serviceRef: 'Service_101',
  environmentRef: 'QA',
  identifier: 'Service_101_QA',
  notificationRuleRefs: [],
  name: 'Service_101_QA',
  description: '',
  tags: {},
  sources: {
    healthSources: [
      {
        type: 'CloudWatchMetrics',
        name: 'CloudWatch Metrics',
        identifier: 'CloudWatch_Metrics',
        spec: {
          region: 'region 1',
          connectorRef: 'testAWS',
          feature: 'CloudWatch Metrics',
          metricDefinitions: [
            {
              expression: 'SELECT *',
              groupName: 'group 1',
              identifier: 'CustomMetric 1',
              metricName: 'CustomMetric 1',
              analysis: {
                riskProfile: {
                  category: 'Errors',
                  thresholdTypes: ['ACT_WHEN_HIGHER'],
                  metricType: 'ERROR'
                },
                liveMonitoring: {
                  enabled: true
                },
                deploymentVerification: {
                  enabled: true
                }
              },
              sli: {
                enabled: true
              },
              responseMapping: {
                serviceInstanceJsonPath: 'test path'
              },
              riskProfile: {
                category: 'Errors',
                thresholdTypes: ['ACT_WHEN_HIGHER'],
                metricType: 'ERROR'
              }
            }
          ]
        }
      }
    ]
  },
  dependencies: [],
  type: 'Application'
}
