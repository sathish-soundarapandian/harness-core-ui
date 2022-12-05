export const mockedCustomMetricFormContainerData = {
  mappedMetrics: new Map(),
  selectedMetric: 'HealthSource Metric',
  connectorIdentifier: 'Sumo_logic',
  isMetricThresholdEnabled: false,
  nonCustomFeilds: {
    appdApplication: '',
    appDTier: '',
    metricData: {},
    ignoreThresholds: [],
    failFastThresholds: []
  },
  createdMetrics: ['HealthSource Metric'],
  isTemplate: false,
  expressions: [],
  healthSourceConfig: {
    customMetrics: {
      enabled: true
    },
    sideNav: {
      shouldBeAbleToDeleteLastMetric: true
    }
  },
  healthSourceData: {
    name: 'a',
    identifier: 'a',
    connectorRef: {
      connector: { identifier: 'Sumo_logic' },
      isEdit: false,
      product: {
        value: 'METRICS',
        label: 'SumoLogic Cloud Metrics'
      },
      type: 'AppDynamics',
      applicationName: '',
      tierName: '',
      mappedServicesAndEnvs: {}
    },
    groupedCreatedMetrics: {
      'Please Select Group Name': [
        {
          groupName: {
            label: 'Please Select Group Name',
            value: 'Please Select Group Name'
          },
          metricName: ''
        }
      ]
    }
  }
}
