/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const metricPack = {
  metaData: {},
  resource: [
    {
      uuid: 'D-2ObpgKQoOajGT7e-wzAQ',
      accountId: 'kmpySmUISimoRrJL6NL73w',
      orgIdentifier: 'default',
      projectIdentifier: 'Demo',
      dataSourceType: 'NEW_RELIC',
      identifier: 'Performance',
      category: 'Performance' as any,
      metrics: [
        {
          name: 'Errors per Minute',
          type: 'ERROR',
          path: 'SELECT count(`apm.service.transaction.error.count`) FROM Metric',
          validationPath: 'SELECT average(`apm.service.error.count`) FROM Metric',
          responseJsonPath: 'results.[0].average',
          validationResponseJsonPath: 'total.results.[0].average',
          thresholds: [],
          included: true
        },
        {
          name: 'Average Response Time (ms)',
          type: 'RESP_TIME',
          path: 'SELECT average(`apm.service.transaction.duration`) FROM Metric',
          validationPath: 'SELECT average(`apm.service.duration`) FROM Metric',
          responseJsonPath: 'results.[0].average',
          validationResponseJsonPath: 'total.results.[0].average',
          thresholds: [],
          included: true
        },
        {
          name: 'Calls per Minute',
          type: 'THROUGHPUT',
          path: 'SELECT rate(count(apm.service.transaction.duration), 1 minute) FROM Metric',
          validationPath: 'SELECT rate(count(apm.service.duration), 1 minute) FROM Metric',
          responseJsonPath: 'results.[0].result',
          validationResponseJsonPath: 'total.results.[0].result',
          thresholds: [],
          included: true
        },
        {
          name: 'Apdex',
          type: 'APDEX',
          path: 'SELECT apdex(`apm.service.transaction.apdex`) FROM Metric',
          validationPath: 'SELECT apdex(`apm.service.apdex`) FROM Metric',
          responseJsonPath: 'results.[0].score',
          validationResponseJsonPath: 'total.results.[0].score',
          thresholds: [],
          included: true
        }
      ],
      thresholds: undefined
    }
  ],
  responseMessages: []
}

export const applicationData = {
  status: 'SUCCESS',
  data: [
    {
      applicationName: 'My Application',
      applicationId: 107019083
    }
  ],
  metaData: null,
  correlationId: '111f90bc-a618-4884-be79-1d34dcfa862d'
}

export const sourceData = {
  isEdit: true,
  healthSourceList: [
    {
      name: 'New relic 103',
      identifier: 'New_relic_101',
      type: 'NewRelic',
      spec: {
        connectorRef: 'newrelic',
        applicationName: 'My Application',
        applicationId: '107019083',
        feature: 'apm',
        metricPacks: [
          {
            identifier: 'Performance'
          }
        ]
      }
    }
  ],
  serviceRef: 'AppDService',
  environmentRef: 'AppDTestEnv',
  monitoredServiceRef: {
    name: 'Test Monitored service ',
    identifier: 'Test_Monitored_service',
    description: 'monitoredService',
    tags: {
      tag1: '',
      tag: '',
      tag2: ''
    }
  },
  healthSourceName: 'heath source name',
  healthSourceIdentifier: 'New_relic_101',
  sourceType: 'NewRelic',
  connectorRef: {
    label: 'newrelic',
    value: 'newrelic',
    scope: 'project',
    live: true,
    connector: {
      name: 'newrelic',
      identifier: 'newrelic',
      description: null,
      orgIdentifier: 'default',
      projectIdentifier: 'Demo',
      tags: {},
      type: 'NewRelic',
      spec: {
        newRelicAccountId: '1805869',
        url: 'https://insights-api.newrelic.com/',
        apiKeyRef: 'newrelic_secret',
        delegateSelectors: []
      }
    }
  },
  product: {
    label: 'apm',
    value: 'apm'
  }
}

export const newrelicInput = {
  applicationId: '107019083',
  applicationName: 'My Application',
  connectorRef: {
    connector: {
      description: null,
      identifier: 'newrelic',
      name: 'newrelic',
      orgIdentifier: 'default',
      projectIdentifier: 'Demo',
      spec: {
        apiKeyRef: 'newrelic_secret',
        delegateSelectors: [],
        newRelicAccountId: '1805869',
        url: 'https://insights-api.newrelic.com/'
      },
      tags: {},
      type: 'NewRelic'
    },
    label: 'newrelic',
    live: true,
    scope: 'project',
    value: 'newrelic'
  },
  identifier: 'New_relic_101',
  isEdit: true,
  metricPacks: [{ identifier: 'Performance' }],
  name: 'heath source name',
  product: {
    label: 'apm',
    value: 'apm'
  },
  type: 'NewRelic'
}

export const expectedNewRelicData = {
  applicationId: '107019083',
  applicationName: 'My Application',
  mappedServicesAndEnvs: new Map(),
  connectorRef: {
    connector: {
      description: null,
      identifier: 'newrelic',
      name: 'newrelic',
      orgIdentifier: 'default',
      projectIdentifier: 'Demo',
      spec: {
        apiKeyRef: 'newrelic_secret',
        delegateSelectors: [],
        newRelicAccountId: '1805869',
        url: 'https://insights-api.newrelic.com/'
      },
      tags: {},
      type: 'NewRelic'
    },
    label: 'newrelic',
    live: true,
    scope: 'project',
    value: 'newrelic'
  },
  identifier: 'New_relic_101',
  isEdit: true,
  metricPacks: [{ identifier: 'Performance' }],
  name: 'heath source name',
  product: {
    label: 'apm',
    value: 'apm'
  },
  type: 'NewRelic'
}

export const validationData = {
  status: 'SUCCESS',
  data: [
    {
      metricPackName: 'Performance',
      overallStatus: 'NO_DATA',
      values: [
        {
          metricName: 'Calls per Minute',
          apiResponseStatus: 'NO_DATA',
          value: 0.0,
          errorMessage: null
        },
        {
          metricName: 'Stall Count',
          apiResponseStatus: 'NO_DATA',
          value: 0.0,
          errorMessage: null
        },
        {
          metricName: 'Errors per Minute',
          apiResponseStatus: 'NO_DATA',
          value: 0.0,
          errorMessage: null
        },
        {
          metricName: 'Average Response Time (ms)',
          apiResponseStatus: 'NO_DATA',
          value: 0.0,
          errorMessage: null
        }
      ]
    },
    {
      metricPackName: 'Errors',
      overallStatus: 'NO_DATA',
      values: [
        {
          metricName: 'Number of Errors',
          apiResponseStatus: 'NO_DATA',
          value: 0.0,
          errorMessage: null
        }
      ]
    }
  ],
  metaData: null,
  correlationId: '4dff5c5b-fa2e-44bc-8eca-2e06485d1cab'
}

export const onPreviousPayload = {
  connectorRef: {
    connector: {
      description: null,
      identifier: 'newrelic',
      name: 'newrelic',
      orgIdentifier: 'default',
      projectIdentifier: 'Demo',
      spec: {
        apiKeyRef: 'newrelic_secret',
        delegateSelectors: [],
        newRelicAccountId: '1805869',
        url: 'https://insights-api.newrelic.com/'
      },
      tags: {},
      type: 'NewRelic'
    },
    label: 'newrelic',
    live: true,
    scope: 'project',
    value: 'newrelic'
  },
  environmentRef: 'AppDTestEnv',
  healthSourceIdentifier: 'New_relic_101',
  healthSourceList: [
    {
      identifier: 'New_relic_101',
      name: 'New relic 103',
      spec: {
        applicationId: '107019083',
        applicationName: 'My Application',
        connectorRef: 'newrelic',
        feature: 'apm',
        metricPacks: [{ identifier: 'Performance' }]
      },
      type: 'NewRelic'
    }
  ],
  healthSourceName: 'heath source name',
  isEdit: true,
  monitoredServiceRef: {
    description: 'monitoredService',
    identifier: 'Test_Monitored_service',
    name: 'Test Monitored service ',
    tags: { tag: '', tag1: '', tag2: '' }
  },
  product: { label: 'apm', value: 'apm' },
  serviceRef: 'AppDService',
  sourceType: 'NewRelic'
}

export const onSubmitPayload = {
  connectorRef: {
    connector: {
      description: null,
      identifier: 'newrelic',
      name: 'newrelic',
      orgIdentifier: 'default',
      projectIdentifier: 'Demo',
      spec: {
        apiKeyRef: 'newrelic_secret',
        delegateSelectors: [],
        newRelicAccountId: '1805869',
        url: 'https://insights-api.newrelic.com/'
      },
      tags: {},
      type: 'NewRelic'
    },
    label: 'newrelic',
    live: true,
    scope: 'project',
    value: 'newrelic'
  },
  environmentRef: 'AppDTestEnv',
  healthSourceIdentifier: 'New_relic_101',
  healthSourceList: [
    {
      identifier: 'New_relic_101',
      name: 'New relic 103',
      spec: {
        applicationId: '107019083',
        applicationName: 'My Application',
        connectorRef: 'newrelic',
        feature: 'apm',
        metricPacks: [
          {
            identifier: 'Performance'
          }
        ]
      },
      type: 'NewRelic'
    }
  ],
  healthSourceName: 'heath source name',
  isEdit: true,
  monitoredServiceRef: {
    description: 'monitoredService',
    identifier: 'Test_Monitored_service',
    name: 'Test Monitored service ',
    tags: {
      tag: '',
      tag1: '',
      tag2: ''
    }
  },
  product: {
    label: 'apm',
    value: 'apm'
  },
  serviceRef: 'AppDService',
  sourceType: 'NewRelic'
}

export const healthSourcePayload = {
  identifier: 'New_relic_101',
  name: 'heath source name',
  spec: {
    applicationId: '107019083',
    applicationName: 'My Application',
    connectorRef: 'newrelic',
    feature: 'apm',
    metricData: { Performance: true },
    metricPacks: [{ identifier: 'Performance' }],
    newRelicMetricDefinitions: []
  },
  type: 'NewRelic'
}

export const NewRelicInputFormData = {
  name: 'New_relic',
  identifier: 'New_relic',
  connectorRef: 'account.new_relic',
  isEdit: false,
  product: {
    value: 'apm',
    label: 'Full Stack Observability: APM'
  },
  type: 'NewRelic',
  applicationName: '',
  applicationId: '',
  metricPacks: [],
  mappedServicesAndEnvs: new Map()
}

export const NewRelicInputFormTemplateData = {
  name: 'New_relic',
  identifier: 'New_relic',
  connectorRef: '<+input>',
  isEdit: false,
  product: {
    value: 'apm',
    label: 'Full Stack Observability: APM'
  },
  type: 'NewRelic',
  applicationName: '',
  applicationId: '',
  metricPacks: [],
  mappedServicesAndEnvs: new Map()
}

export const validationMissingApplication = {
  metricData: { Performance: true },
  newRelicApplication: { label: undefined, value: undefined }
}

export const validationMissingMetricData = {
  metricData: {},
  newRelicApplication: { label: 'manager', value: 'manager' }
}

export const validationValidPayload = {
  metricData: { Performance: true },
  newRelicApplication: { label: 'manager', value: 'manager' }
}

export const mockedFormDataCreate = {
  connectorRef: 'account.new_relic',
  identifier: 'New_relic',
  isEdit: false,
  mappedServicesAndEnvs: new Map(),
  metricData: {},
  metricIdentifier: 'New_Relic_Metric',
  metricName: 'New Relic Metric',
  metricPacks: [],
  name: 'New_relic',
  newRelicApplication: {
    label: '',
    value: ''
  },
  product: {
    label: 'Full Stack Observability: APM',
    value: 'apm'
  },
  showCustomMetric: false,
  type: 'NewRelic'
}

export const mockedNewRelicFormikValues = {
  name: 'New relic health source',
  identifier: 'New_relic_health_source',
  connectorRef: 'account.new_relic',
  isEdit: true,
  product: {
    label: 'apm',
    value: 'apm'
  },
  type: 'NewRelic',
  mappedServicesAndEnvs: {},
  newRelicApplication: {
    label: 'My Application',
    value: '107019083'
  },
  metricPacks: [
    {
      identifier: 'Performance'
    }
  ],
  metricData: {
    Performance: true
  },
  metricName: 'New Relic Metric',
  metricIdentifier: 'NewRelicMetric',
  groupName: {
    label: 'group-1',
    value: 'group-1'
  },
  query: "SELECT average(`apm.service.transaction.duration`) FROM Metric WHERE appName = 'My Application' TIMESERIES",
  metricValue: '$.timeSeries.[*].inspectedCount',
  timestampFormat: null,
  timestamp: '$.timeSeries.[*].beginTimeSeconds',
  sli: false,
  continuousVerification: false,
  healthScore: true,
  riskCategory: 'Errors/ERROR',
  lowerBaselineDeviation: false,
  higherBaselineDeviation: true,
  showCustomMetric: true
}

export const mappedValue = {
  metricName: 'New Relic Metric',
  metricIdentifier: 'NewRelicMetric',
  groupName: {
    label: 'group-1',
    value: 'group-1'
  },
  query: "SELECT average(`apm.service.transaction.duration`) FROM Metric WHERE appName = 'My Application' TIMESERIES",
  metricValue: '$.timeSeries.[*].inspectedCount',
  timestampFormat: null,
  timestamp: '$.timeSeries.[*].beginTimeSeconds',
  sli: false,
  continuousVerification: false,
  healthScore: true,
  riskCategory: 'Errors/ERROR',
  lowerBaselineDeviation: false,
  higherBaselineDeviation: true
}

export const expectedMappedValue = {
  continuousVerification: false,
  groupName: {
    label: 'group-1',
    value: 'group-1'
  },
  healthScore: true,
  higherBaselineDeviation: true,
  lowerBaselineDeviation: false,
  metricIdentifier: 'NewRelicMetric',
  metricName: 'New Relic Metric',
  metricValue: '$.timeSeries.[*].inspectedCount',
  query: "SELECT average(`apm.service.transaction.duration`) FROM Metric WHERE appName = 'My Application' TIMESERIES",
  riskCategory: 'Errors/ERROR',
  sli: false,
  timestamp: '$.timeSeries.[*].beginTimeSeconds',
  timestampFormat: null
}

export const mappedServicesAndEnvsPayload = new Map()

const metricData = {
  name: 'New relic refactor',
  identifier: 'New_relic_refactor',
  connectorRef: 'account.new_relic',
  isEdit: true,
  product: { label: 'apm', value: 'apm' },
  type: 'NewRelic',
  mappedServicesAndEnvs: {},
  newRelicApplication: { label: 'My Application', value: 107019083 },
  metricPacks: [{ identifier: 'Performance' }],
  metricData: { Performance: true },
  metricName: 'New Relic Metric',
  metricIdentifier: '9a895e7d-ab48-4eaa-a8e3-69c25872925e',
  groupName: { label: 'Group 1', value: 'Group 1' },
  query: "SELECT average(`apm.service.transaction.duration`) FROM Metric WHERE appName = 'My Application' TIMESERIES",
  metricValue: '$.timeSeries.[*].beginTimeSeconds',
  timestamp: '$.timeSeries.[*].endTimeSeconds',
  sli: true,
  continuousVerification: false,
  healthScore: false,
  riskCategory: '',
  lowerBaselineDeviation: false,
  higherBaselineDeviation: false,
  showCustomMetric: true
}

mappedServicesAndEnvsPayload.set('New Relic Metric', metricData)

export const newRelicPayload = {
  name: 'New relic refactor',
  identifier: 'New_relic_refactor',
  connectorRef: 'account.new_relic',
  isEdit: true,
  product: { label: 'apm', value: 'apm' },
  type: 'NewRelic',
  mappedServicesAndEnvs: mappedServicesAndEnvsPayload,
  newRelicApplication: { label: 'My Application', value: 107019083 },
  metricPacks: [{ identifier: 'Performance' }],
  metricData: { Performance: true },
  metricName: 'New Relic Metric',
  metricIdentifier: '9a895e7d-ab48-4eaa-a8e3-69c25872925e',
  groupName: { label: 'Group 1', value: 'Group 1' },
  query: "SELECT average(`apm.service.transaction.duration`) FROM Metric WHERE appName = 'My Application' TIMESERIES",
  metricValue: '$.timeSeries.[*].beginTimeSeconds',
  timestamp: '$.timeSeries.[*].endTimeSeconds',
  sli: true,
  continuousVerification: false,
  healthScore: false,
  riskCategory: '',
  lowerBaselineDeviation: false,
  higherBaselineDeviation: false,
  showCustomMetric: true
}

export const newRelicExpectedPayload = {
  identifier: 'New_relic_refactor',
  name: 'New relic refactor',
  spec: {
    applicationId: 107019083,
    applicationName: 'My Application',
    connectorRef: 'account.new_relic',
    feature: 'apm',
    metricData: {
      Performance: true
    },
    metricPacks: [
      {
        identifier: 'Performance'
      }
    ],
    newRelicMetricDefinitions: [
      {
        analysis: {
          deploymentVerification: {
            enabled: false
          },
          liveMonitoring: {
            enabled: false
          },
          riskProfile: {
            category: '',
            metricType: undefined,
            thresholdTypes: []
          }
        },
        groupName: 'Group 1',
        identifier: '9a895e7d-ab48-4eaa-a8e3-69c25872925e',
        metricName: 'New Relic Metric',
        nrql: "SELECT average(`apm.service.transaction.duration`) FROM Metric WHERE appName = 'My Application' TIMESERIES",
        responseMapping: {
          metricValueJsonPath: '$.timeSeries.[*].beginTimeSeconds',
          serviceInstanceJsonPath: undefined,
          timestampFormat: undefined,
          timestampJsonPath: '$.timeSeries.[*].endTimeSeconds'
        },
        sli: {
          enabled: true
        }
      }
    ]
  },
  type: 'NewRelic'
}

const templateMappedServicesAndEnvs = new Map()
const customMetricWithRuntimeInput = {
  metricName: 'New Relic Custom Metric',
  metricIdentifier: 'New_Relic_Custom_Metric_',
  groupName: { label: 'Group 1', value: 'Group 1' },
  query: '<+input>',
  metricValue: '<+input>',
  timestamp: '<+input>',
  sli: true,
  continuousVerification: true,
  healthScore: true,
  riskCategory: 'Performance/RESP_TIME',
  lowerBaselineDeviation: false,
  higherBaselineDeviation: true
}
templateMappedServicesAndEnvs.set('New Relic Custom Metric', customMetricWithRuntimeInput)
export const templateWithCustomMetric = {
  name: 'NewRelic',
  identifier: 'NewRelic',
  connectorRef: '<+input>',
  isEdit: true,
  product: { label: 'apm', value: 'apm' },
  type: 'NewRelic',
  applicationName: '<+input>',
  applicationId: '<+input>',
  metricPacks: [{ identifier: 'Performance' }],
  mappedServicesAndEnvs: templateMappedServicesAndEnvs
}
