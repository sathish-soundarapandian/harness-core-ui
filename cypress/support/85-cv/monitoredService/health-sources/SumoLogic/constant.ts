const accountId = 'accountId'
const project = 'project1'
const org = 'default'

export const sampleRecordsApiCall = `/cv/api/account/${accountId}/org/${org}/project/${project}/health-source/records?*`

export const sampleRawRecordsMock = {
  metaData: {},
  resource: {
    providerType: 'SUMOLOGIC_METRICS',
    rawRecords: [
      {
        insertId: '18es9xoe5o7za',
        jsonPayload: {
          statusDetails: 'response_sent_by_backend',
          '@type': 'type.googleapis.com/google.cloud.loadbalancing.type.LoadBalancerLogEntry'
        },
        httpRequest: {
          requestMethod: 'PUT',
          requestUrl:
            'https://app.harness.io/gratis/log-service//stream?accountID=vpCkHKsDSxK9_KYfjCTMKA&key=accountId:vpCkHKsDSxK9_KYfjCTMKA/orgId:default/projectId:PRCHECKS/pipelineId:runUnitTests2/runSequence:5588/level0:pipeline/level1:stages/level2:unittest2/addon:20004',
          requestSize: '236',
          status: 204,
          responseSize: '38',
          userAgent: 'Go-http-client/2.0',
          remoteIp: '34.145.51.27',
          serverIp: '10.138.0.90',
          latency: '0.003925s'
        },
        resource: {
          type: 'http_load_balancer',
          labels: {
            backend_service_name: 'prod-primary-ingress-controller',
            zone: 'global',
            target_proxy_name: 'prod-gclb-target-proxy',
            project_id: 'prod-setup-205416',
            url_map_name: 'prod-gclb',
            forwarding_rule_name: 'prod-frontend'
          }
        },
        timestamp: '2021-07-14T13:00:03.260370Z',
        severity: 'INFO',
        logName: 'projects/prod-setup-205416/logs/requests',
        trace: 'projects/prod-setup-205416/traces/8fe3b2f18d4420149b26a65d777e83be',
        receiveTimestamp: '2021-07-14T13:00:03.417558104Z',
        spanId: '4f71be0a0da5e27d'
      }
    ]
  }
}
