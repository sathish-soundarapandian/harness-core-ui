export const sourceData = {
  connectorRef: 'account.gcp' as string | { value: string },
  isEdit: false,
  healthSourceList: [],
  serviceRef: 'NewService',
  environmentRef: 'Stress',
  monitoredServiceRef: { name: 'NewService_Stress', identifier: 'NewService_Stress' },
  existingMetricDetails: null,
  product: { value: 'Cloud Logs', label: 'Cloud Logs' },
  sourceType: 'Gcp',
  healthSourceName: 'dasdasdsa',
  healthSourceIdentifier: 'dasdasdsa'
}

export const gcoLogsData = {
  connectorRef: 'account.gcp',
  isEdit: true,
  healthSourceList: [
    {
      type: 'StackdriverLog',
      identifier: 'GCO_Logs',
      name: 'GCO Logs',
      spec: {
        connectorRef: 'account.gcp',
        feature: 'Cloud Logs',
        queries: [
          {
            name: 'GCO Logs Query',
            query: 'test',
            serviceInstanceIdentifier: 'resource.labels.pod_name',
            messageIdentifier: 'resource.labels.namespace_name'
          }
        ]
      }
    }
  ],
  serviceRef: 'GCO_Logs',
  environmentRef: 'Dev',
  monitoredServiceRef: { name: 'GCO_Logs_Dev', identifier: 'GCO_Logs_Dev' },
  existingMetricDetails: null,
  healthSourceName: 'GCO Logs',
  healthSourceIdentifier: 'GCO_Logs',
  sourceType: 'StackdriverLog',
  product: { label: 'Cloud Logs', value: 'Cloud Logs' }
}

const queryData = {
  messageIdentifier: 'resource.labels.namespace_name',
  metricName: 'GCO Logs Query',
  query: 'test',
  serviceInstance: 'resource.labels.pod_name'
}
const mappedServicesAndEnvs = new Map()
mappedServicesAndEnvs.set('GCO Logs Query', queryData)
export const gcoPayload = {
  accountId: 'zEaak-FLS425IEO7OLzMUg',
  connectorRef: 'account.gcp',
  identifier: 'GCO_Logs',
  isEdit: true,
  mappedServicesAndEnvs: mappedServicesAndEnvs,
  name: 'GCO Logs',
  orgIdentifier: 'default',
  product: {
    label: 'Cloud Logs',
    value: 'Cloud Logs'
  },
  projectIdentifier: 'SRM_Template',
  type: 'StackdriverLog'
}
