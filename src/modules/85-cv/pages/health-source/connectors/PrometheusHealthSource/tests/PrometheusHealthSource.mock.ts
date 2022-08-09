/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const MockManualQueryData = {
  isEdit: true,
  healthSourceList: [
    {
      name: 'prometheus',
      identifier: 'prometheus',
      type: 'Prometheus',
      spec: {
        connectorRef: 'prometheusConnector',
        metricDefinitions: [
          {
            query: 'count(container_cpu_load_average_10s{container="cv-demo",namespace="cv-demo"})',
            serviceIdentifier: 'todolist',
            envIdentifier: 'production',
            isManualQuery: false,
            groupName: 'group1',
            metricName: 'NoLongerManualQuery',
            identifier: 'My Identifier',
            serviceInstanceFieldName: 'alertname',
            prometheusMetric: 'container_cpu_load_average_10s',
            serviceFilter: [
              { labelName: 'container', labelValue: 'cv-demo', queryFilterString: 'container="cv-demo"' }
            ],
            envFilter: [{ labelName: 'namespace', labelValue: 'cv-demo', queryFilterString: 'namespace="cv-demo"' }],
            additionalFilters: null,
            aggregation: 'count',
            sli: { enabled: true },
            analysis: {
              liveMonitoring: { enabled: true },
              deploymentVerification: { enabled: true, serviceInstanceFieldName: 'serviceInstanceFieldName' },
              riskProfile: {
                category: 'Infrastructure',
                metricType: 'INFRA',
                thresholdTypes: ['ACT_WHEN_LOWER', 'ACT_WHEN_HIGHER']
              }
            }
          }
        ]
      },
      service: 'todolist',
      environment: 'production'
    }
  ],
  monitoringSourceName: 'todolist',
  monitoredServiceIdentifier: 'todolist',
  healthSourceName: 'prometheus',
  healthSourceIdentifier: 'prometheus',
  sourceType: 'Prometheus',
  connectorRef: 'prometheusConnector',
  product: {}
}

const mockPromethesuTemplate = {
  type: 'Prometheus',
  identifier: 'prometheus',
  name: 'prometheus',
  spec: {
    connectorRef: '<+input>',
    feature: 'apm',
    metricDefinitions: [
      {
        metricName: 'Prometheus Metric',
        identifier: 'prometheus_metric',
        serviceFilter: [],
        isManualQuery: true,
        query: '<+input>',
        envFilter: [],
        additionalFilters: [],
        groupName: 'g1',
        sli: { enabled: true },
        analysis: {
          riskProfile: { category: 'Performance', metricType: 'ERROR', thresholdTypes: ['ACT_WHEN_HIGHER'] },
          liveMonitoring: { enabled: true },
          deploymentVerification: {
            enabled: true,
            serviceInstanceFieldName: '<+monitoredService.variables.serviceLabelInstance>'
          }
        }
      }
    ]
  }
}
export const MockTemplateQueryData = {
  connectorRef: '<+input>',
  isEdit: true,
  healthSourceList: [mockPromethesuTemplate],
  serviceRef: '<+input>',
  environmentRef: 'prod',
  monitoredServiceRef: { name: 'prometheus', identifier: 'prometheus' },
  existingMetricDetails: mockPromethesuTemplate,
  healthSourceName: 'prometheus',
  healthSourceIdentifier: 'prometheus',
  sourceType: 'Prometheus',
  product: { label: 'apm', value: 'Prometheus' }
}

export const submitTemplateData = [
  {
    ...MockTemplateQueryData
  },
  {
    ...mockPromethesuTemplate,
    spec: {
      ...mockPromethesuTemplate.spec,
      metricPacks: []
    }
  }
]

export const MockManualQueryDataWithoutIdentifier = {
  ...MockManualQueryData,
  healthSourceList: [
    {
      ...MockManualQueryData.healthSourceList[0],
      spec: {
        ...MockManualQueryData.healthSourceList[0].spec,
        metricDefinitions: [
          {
            ...MockManualQueryData.healthSourceList[0].spec.metricDefinitions[0],
            identifier: undefined
          }
        ]
      }
    }
  ]
}

export const MockManualQueryDataForCreate = {
  ...MockManualQueryData,
  isEdit: false,
  healthSourceList: []
}

export const MockManualQueryDataForIdentifierCheck = {
  ...MockManualQueryData,
  healthSourceList: [
    {
      ...MockManualQueryData.healthSourceList[0],
      spec: {
        ...MockManualQueryData.healthSourceList[0].spec,
        metricDefinitions: [
          {
            ...MockManualQueryData.healthSourceList[0].spec.metricDefinitions[0],
            metricName: 'Test 1',
            identifier: 'aa'
          },
          {
            ...MockManualQueryData.healthSourceList[0].spec.metricDefinitions[0],
            metricName: 'Test 2',
            identifier: 'aa'
          }
        ]
      }
    }
  ]
}

export const templateCreationData = {
  connectorRef: '<+input>',
  isEdit: false,
  healthSourceList: [],
  serviceRef: '<+input>',
  environmentRef: '<+input>',
  monitoredServiceRef: { name: 'MS_Prometheus', identifier: 'MS_Prometheus' },
  existingMetricDetails: null,
  product: { label: 'apm', value: 'Prometheus' },
  sourceType: 'Prometheus',
  healthSourceName: 'Test',
  healthSourceIdentifier: 'Test',
  connectorId: '<+input>'
}

export const fixedMetricDetail = {
  type: 'Prometheus',
  identifier: 'testtempprom',
  name: 'testtempprom',
  spec: {
    connectorRef: 'prometheusConn',
    feature: 'apm',
    metricDefinitions: [
      {
        metricName: 'Prometheus Metric',
        identifier: 'prometheus_metric',
        serviceFilter: [],
        isManualQuery: true,
        query: 'test query',
        envFilter: [],
        additionalFilters: [],
        groupName: 'g1',
        sli: {
          enabled: true
        },
        analysis: {
          riskProfile: {
            category: 'Performance',
            metricType: 'ERROR',
            thresholdTypes: ['ACT_WHEN_HIGHER']
          },
          liveMonitoring: {
            enabled: true
          },
          deploymentVerification: {
            enabled: true,
            serviceInstanceFieldName: '<+input>'
          }
        }
      }
    ]
  }
}

export const fixedValuesTemplate = {
  connectorRef: '<+input>',
  isEdit: true,
  healthSourceList: [fixedMetricDetail],
  serviceRef: '<+input>',
  environmentRef: '<+input>',
  monitoredServiceRef: {
    name: 'MS_Prometheus',
    identifier: 'MS_Prometheus'
  },
  existingMetricDetails: fixedMetricDetail,
  healthSourceName: 'testtempprom',
  healthSourceIdentifier: 'testtempprom',
  sourceType: 'Prometheus',
  product: {
    label: 'apm',
    value: 'Prometheus'
  }
}
export const manualQueryMock = {
  connectorRef: 'prometheusConnector',
  healthSourceIdentifier: 'prometheus',
  healthSourceList: [
    {
      environment: 'production',
      identifier: 'prometheus',
      name: 'prometheus',
      service: 'todolist',
      spec: {
        connectorRef: 'prometheusConnector',
        metricDefinitions: [
          {
            additionalFilters: null,
            aggregation: 'count',
            analysis: {
              deploymentVerification: { enabled: true, serviceInstanceFieldName: 'serviceInstanceFieldName' },
              liveMonitoring: { enabled: true },
              riskProfile: {
                category: 'Infrastructure',
                metricType: 'INFRA',
                thresholdTypes: ['ACT_WHEN_LOWER', 'ACT_WHEN_HIGHER']
              }
            },
            envFilter: [{ labelName: 'namespace', labelValue: 'cv-demo', queryFilterString: 'namespace="cv-demo"' }],
            envIdentifier: 'production',
            groupName: 'group1',
            identifier: 'My Identifier',
            isManualQuery: false,
            metricName: 'NoLongerManualQuery',
            prometheusMetric: 'container_cpu_load_average_10s',
            query: 'count(container_cpu_load_average_10s{container="cv-demo",namespace="cv-demo"})',
            serviceFilter: [
              { labelName: 'container', labelValue: 'cv-demo', queryFilterString: 'container="cv-demo"' }
            ],
            serviceIdentifier: 'todolist',
            serviceInstanceFieldName: 'alertname',
            sli: { enabled: true }
          }
        ]
      },
      type: 'Prometheus'
    }
  ],
  healthSourceName: 'prometheus',
  isEdit: true,
  monitoredServiceIdentifier: 'todolist',
  monitoringSourceName: 'todolist',
  product: {},
  sourceType: 'Prometheus'
}

export const manualQueryMock2 = {
  identifier: 'prometheus',
  name: 'prometheus',
  spec: {
    connectorRef: 'prometheusConnector',
    feature: 'apm',
    metricDefinitions: [
      {
        additionalFilters: [],
        aggregation: undefined,
        analysis: {
          deploymentVerification: { enabled: true, serviceInstanceFieldName: 'serviceInstanceFieldName' },
          liveMonitoring: { enabled: true },
          riskProfile: {
            category: 'Infrastructure',
            metricType: 'INFRA',
            thresholdTypes: ['ACT_WHEN_LOWER', 'ACT_WHEN_HIGHER']
          }
        },
        envFilter: [],
        groupName: 'group1',
        identifier: 'My Identifier',
        isManualQuery: true,
        metricName: 'NoLongerManualQuery',
        prometheusMetric: undefined,
        query: 'count(container_cpu_load_average_10s{container="cv-demo",namespace="cv-demo"})',
        serviceFilter: [],
        sli: { enabled: true }
      }
    ],
    metricPacks: [{ identifier: 'Custom', metricThresholds: [] }]
  },
  type: 'Prometheus'
}

export const sourceDataPrometheusPayload = {
  isEdit: true,
  mappedServicesAndEnvs: new Map(),
  healthSourceIdentifier: 'test',
  healthSourceName: 'test',
  connectorRef: 'testprometheus2',
  ignoreThresholds: [
    {
      metricType: 'Custom',
      metricName: 'Prometheus Metric',
      type: 'IgnoreThreshold',
      spec: {
        action: 'Ignore'
      },
      criteria: {
        type: 'Absolute',
        spec: {
          greaterThan: 15,
          lessThan: 122
        }
      }
    }
  ],
  failFastThresholds: [
    {
      metricType: 'Custom',
      metricName: 'Prometheus Metric',
      type: 'FailImmediately',
      spec: {
        action: 'FailAfterOccurrence',
        spec: {
          count: 12
        }
      },
      criteria: {
        type: 'Percentage',
        spec: {
          greaterThan: 1222
        },
        criteriaPercentageType: 'greaterThan'
      }
    }
  ]
}

export const expectedResultPrometheusPayload = {
  identifier: 'test',
  name: 'test',
  spec: {
    connectorRef: 'testprometheus2',
    feature: 'apm',
    metricDefinitions: [],
    metricPacks: [
      {
        identifier: 'Custom',
        metricThresholds: [
          {
            criteria: { spec: { greaterThan: 15, lessThan: 122 }, type: 'Absolute' },
            metricName: 'Prometheus Metric',
            metricType: 'Custom',
            spec: { action: 'Ignore' },
            type: 'IgnoreThreshold'
          },
          {
            criteria: { criteriaPercentageType: 'greaterThan', spec: { greaterThan: 1222 }, type: 'Percentage' },
            metricName: 'Prometheus Metric',
            metricType: 'Custom',
            spec: { action: 'FailAfterOccurrence', spec: { count: 12 } },
            type: 'FailImmediately'
          }
        ]
      }
    ]
  },
  type: 'Prometheus'
}

export const emptyCustomMetricData = {
  ...MockManualQueryData,
  healthSourceList: [
    {
      name: 'prometheus',
      identifier: 'prometheus',
      type: 'Prometheus',
      spec: {
        connectorRef: 'prometheusConnector',
        metricDefinitions: []
      },
      service: 'todolist',
      environment: 'production'
    }
  ]
}
