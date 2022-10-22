/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

const product = 'Cloud Metrics'
export const sourceData = {
  isEdit: true,
  healthSourceList: [
    {
      name: 'GCO manual + Dashboard',
      identifier: 'GCO_manual_Dashboard',
      type: 'Stackdriver',
      spec: {
        connectorRef: 'account.gcpchiplay',
        metricDefinitions: [
          {
            identifier: 'kubernetes.io/container/cpu/limit_utilization',
            metricName: 'kubernetes.io/container/cpu/limit_utilization',
            riskProfile: {
              category: 'Errors',
              metricType: 'ERROR',
              thresholdTypes: ['ACT_WHEN_LOWER', 'ACT_WHEN_HIGHER']
            },
            analysis: {
              liveMonitoring: {
                enabled: true
              },
              deploymentVerification: {
                enabled: true,
                serviceInstanceFieldName: 'test instance',
                serviceInstanceMetricPath: null
              },
              riskProfile: {
                category: 'Errors',
                metricType: 'ERROR',
                thresholdTypes: ['ACT_WHEN_LOWER', 'ACT_WHEN_HIGHER']
              }
            },
            sli: {
              enabled: true
            },
            dashboardName: 'CPU limit utilization [MEAN]',
            dashboardPath: 'projects/7065288960/dashboards/883f5f4e-02e3-44f6-a64e-7f6915d093cf',
            jsonMetricDefinition: {
              dataSets: [
                {
                  timeSeriesQuery: {
                    timeSeriesFilter: {
                      filter: '',
                      secondaryAggregation: {
                        alignmentPeriod: '60s'
                      },
                      aggregation: {
                        perSeriesAligner: 'ALIGN_MEAN',
                        alignmentPeriod: '60s'
                      }
                    }
                  }
                }
              ]
            },
            metricTags: ['CPU limit utilization [MEAN]'],
            serviceInstanceField: 'test instance',
            isManualQuery: false
          },
          {
            identifier: 'Manual GGCO',
            metricName: 'Manual GGCO',
            riskProfile: {
              category: 'Performance',
              metricType: 'RESP_TIME',
              thresholdTypes: ['ACT_WHEN_LOWER', 'ACT_WHEN_HIGHER']
            },
            analysis: {
              liveMonitoring: {
                enabled: false
              },
              deploymentVerification: {
                enabled: true,
                serviceInstanceFieldName: 'test ',
                serviceInstanceMetricPath: null
              },
              riskProfile: {
                category: 'Performance',
                metricType: 'RESP_TIME',
                thresholdTypes: ['ACT_WHEN_LOWER', 'ACT_WHEN_HIGHER']
              }
            },
            sli: {
              enabled: false
            },
            dashboardName: '',
            dashboardPath: '',
            jsonMetricDefinition: {
              dataSets: [
                {
                  timeSeriesQuery: {
                    timeSeriesFilter: {
                      filter: '',
                      secondaryAggregation: {
                        alignmentPeriod: '60s'
                      },
                      aggregation: {
                        perSeriesAligner: 'ALIGN_MEAN',
                        alignmentPeriod: '60s'
                      }
                    }
                  }
                }
              ]
            },
            metricTags: ['test', 'manual'],
            serviceInstanceField: 'test ',
            isManualQuery: true
          }
        ],
        feature: product,
        product: {
          label: product,
          value: product
        }
      }
    }
  ],
  serviceRef: 'Service_101',
  environmentRef: 'PRENV',
  monitoredServiceRef: {
    name: 'Service_101_PRENV',
    identifier: 'Service_101_PRENV'
  },
  healthSourceName: 'GCO manual + Dashboard',
  healthSourceIdentifier: 'GCO_manual_Dashboard',
  sourceType: 'Stackdriver',
  connectorRef: 'account.gcpchiplay',
  product: {
    label: product,
    value: product
  }
}

const gcoName = 'GCO Metric'
const connectorRef = 'account.GCPProd'
const gcoIdentifier = 'logging.googleapis.com/user/metric_traffic_to_pods_prod_1'
const dashboardName = 'Pod Traffic'
const dashboardPath = 'projects/778566137835/dashboards/10875456449297139182'
const txnName = 'kubernetes.io/container/cpu/core_usage_time'
const txnName1 = 'kubernetes.io/container/cpu/core_time'

const gcoHealthSource = {
  name: gcoName,
  identifier: 'GCOMETRIC',
  type: 'Stackdriver',
  spec: {
    connectorRef: connectorRef,
    metricDefinitions: [
      {
        identifier: gcoIdentifier,
        metricName: gcoIdentifier,
        riskProfile: {
          category: 'Errors',
          metricType: null,
          thresholdTypes: []
        },
        analysis: {
          liveMonitoring: {
            enabled: false
          },
          deploymentVerification: {
            enabled: false,
            serviceInstanceFieldName: null,
            serviceInstanceMetricPath: null
          },
          riskProfile: {
            category: 'Errors',
            metricType: null,
            thresholdTypes: []
          }
        },
        sli: {
          enabled: true
        },
        dashboardName: dashboardName,
        dashboardPath: dashboardPath,
        jsonMetricDefinition: {
          dataSets: [
            {
              timeSeriesQuery: {
                timeSeriesFilter: {
                  filter: 'filter',
                  aggregation: {
                    perSeriesAligner: 'ALIGN_RATE',
                    crossSeriesReducer: 'REDUCE_SUM',
                    groupByFields: ['metric.label']
                  }
                }
              }
            }
          ]
        },
        metricTags: ['Prod-1 traffic to pods'],
        serviceInstanceField: null,
        isManualQuery: false
      }
    ],
    feature: 'Cloud Metrics',
    product: {
      label: 'Cloud Metrics',
      value: 'Cloud Metrics'
    }
  }
}

export const sourceDataUpdated = {
  isEdit: true,
  healthSourceList: [gcoHealthSource],
  serviceRef: 'service1',
  environmentRef: 'env1',
  monitoredServiceRef: {
    name: 'service1_env1',
    identifier: 'service1_env1'
  },
  existingMetricDetails: gcoHealthSource,
  healthSourceName: gcoName,
  healthSourceIdentifier: 'GCOMETRIC',
  sourceType: 'Stackdriver',
  connectorRef: connectorRef,
  product: {
    label: 'Cloud Metrics',
    value: 'Cloud Metrics'
  },
  selectedDashboards: [
    {
      name: dashboardName,
      id: dashboardPath
    }
  ]
}

const metricDefinitionsTemplate = [
  {
    dashboardName: '',
    dashboardPath: '',
    metricName: 'test2',
    metricTags: ['tag2'],
    identifier: 'test2',
    isManualQuery: true,
    jsonMetricDefinition: '<+input>',
    riskProfile: { thresholdTypes: [] },
    sli: { enabled: true },
    analysis: {
      riskProfile: { thresholdTypes: [] },
      liveMonitoring: { enabled: false },
      deploymentVerification: { enabled: false }
    }
  },
  {
    dashboardName: '',
    dashboardPath: '',
    metricName: 'test1',
    metricTags: ['tag1'],
    identifier: 'test1',
    isManualQuery: true,
    jsonMetricDefinition: {},
    riskProfile: { metricType: 'THROUGHPUT', category: 'Performance', thresholdTypes: ['ACT_WHEN_HIGHER'] },
    sli: { enabled: false },
    analysis: {
      riskProfile: { category: 'Performance', metricType: 'THROUGHPUT', thresholdTypes: ['ACT_WHEN_HIGHER'] },
      liveMonitoring: { enabled: true },
      deploymentVerification: { enabled: false }
    }
  }
]
export const sourceDataTemplate = {
  connectorRef: {
    label: 'Google Cloud Provider ',
    value: 'account.Google_Cloud_Provider',
    scope: 'account',
    live: true,
    connector: {
      name: 'Google Cloud Provider ',
      identifier: 'Google_Cloud_Provider',
      description: '',
      orgIdentifier: null,
      projectIdentifier: null,
      tags: {},
      type: 'Gcp',
      spec: {
        credential: {
          type: 'ManualConfig',
          spec: { secretKeyRef: 'account.cvng_gcp_identifier_BontGcw8zY_secretReferenceID' }
        },
        delegateSelectors: [],
        executeOnDelegate: false
      }
    }
  },
  isEdit: true,
  healthSourceList: [
    {
      type: 'Stackdriver',
      identifier: 'Google_Cloud_Operations',
      name: 'Google Cloud Operations 111',
      spec: {
        connectorRef: 'account.Google_Cloud_Provider',
        feature: 'Cloud Metrics',
        metricDefinitions: metricDefinitionsTemplate,
        product: { label: 'Cloud Metrics', value: 'Cloud Metrics' }
      }
    }
  ],
  serviceRef: 'newRelic',
  environmentRef: 'qa',
  monitoredServiceRef: { name: 'MS_newrelic', identifier: 'MS_newrelic' },
  existingMetricDetails: {
    type: 'Stackdriver',
    identifier: 'Google_Cloud_Operations',
    name: 'Google Cloud Operations 111',
    spec: {
      connectorRef: 'account.Google_Cloud_Provider',
      feature: 'Cloud Metrics',
      metricDefinitions: metricDefinitionsTemplate
    }
  },
  healthSourceName: 'Google Cloud Operations 111',
  healthSourceIdentifier: 'Google_Cloud_Operations',
  sourceType: 'Stackdriver',
  product: { label: 'Cloud Metrics', value: 'Cloud Metrics' },
  selectedDashboards: []
}

export const sourceDataWithMetricPacks = {
  ...sourceDataUpdated,
  healthSourceList: [
    {
      ...gcoHealthSource,
      spec: {
        ...gcoHealthSource.spec,
        metricPacks: [
          {
            identifier: 'Custom',
            metricThresholds: [
              {
                type: 'IgnoreThreshold',
                spec: {
                  action: 'Ignore'
                },
                criteria: {
                  type: 'Absolute',
                  spec: {
                    greaterThan: 54
                  }
                },
                metricType: 'Custom',
                metricName: 'test1'
              },
              {
                type: 'FailImmediately',
                spec: {
                  action: 'FailAfterOccurrence',
                  spec: {
                    count: 45
                  }
                },
                criteria: {
                  type: 'Percentage',
                  spec: {
                    greaterThan: 87
                  },
                  criteriaPercentageType: 'greaterThan'
                },
                metricType: 'Custom',
                metricName: 'test1'
              }
            ]
          }
        ]
      }
    }
  ]
}

export const MockValidationResponse = {
  metaData: {},
  data: [
    {
      txnName: txnName,
      metricName: txnName,
      metricValue: 12.151677124512961,
      timestamp: 1607599860000
    },
    {
      txnName: txnName,
      metricName: txnName,
      metricValue: 12.149014549984008,
      timestamp: 1607599920000
    },
    {
      txnName: txnName,
      metricName: txnName,
      metricValue: 7.050477594430973,
      timestamp: 1607599980000
    }
  ]
}

export const MockQuery = `{}`
export const MockQueryWithGroupBy = '{"sdfsdf": "groupByFields sdfs"}'
export const MockSelectedMetricInfo = {
  query: '{"someQuery": "sdosdf"}',
  widgetName: 'widget_1',
  metric: 'metric_1'
}

export const MetricPackResponse = {
  metaData: {},
  resource: [
    {
      uuid: '9Xg2tjyAQCqcekCTVc_xtw',
      accountId: 'eWZFoTkESDSkPfnGwAp0lQ',
      orgIdentifier: 'cv_stable',
      projectIdentifier: 'cv_validation',
      dataSourceType: 'STACKDRIVER',
      identifier: 'Errors',
      category: 'Errors',
      metrics: [{ name: 'Errors', type: 'ERROR', path: null, validationPath: null, thresholds: [], included: false }],
      thresholds: null
    },
    {
      uuid: '5CBVKks3T4WLIpYtaNO58g',
      accountId: 'eWZFoTkESDSkPfnGwAp0lQ',
      orgIdentifier: 'cv_stable',
      projectIdentifier: 'cv_validation',
      dataSourceType: 'STACKDRIVER',
      identifier: 'Infrastructure',
      category: 'Infrastructure',
      metrics: [
        { name: 'Infrastructure', type: 'INFRA', path: null, validationPath: null, thresholds: [], included: false }
      ],
      thresholds: null
    },
    {
      uuid: 'NmTC-1wRSfmviaeu3n87Gw',
      accountId: 'eWZFoTkESDSkPfnGwAp0lQ',
      orgIdentifier: 'cv_stable',
      projectIdentifier: 'cv_validation',
      dataSourceType: 'STACKDRIVER',
      identifier: 'Performance',
      category: 'Performance',
      metrics: [
        { name: 'Response Time', type: 'RESP_TIME', path: null, validationPath: null, thresholds: [], included: false },
        { name: 'Other', type: 'ERROR', path: null, validationPath: null, thresholds: [], included: false },
        { name: 'Throughput', type: 'THROUGHPUT', path: null, validationPath: null, thresholds: [], included: false }
      ],
      thresholds: null
    }
  ],
  responseMessages: []
}
export const MockValidationResponseWithMultipleTxns = {
  metaData: {},
  data: [
    {
      txnName: txnName,
      metricName: txnName,
      metricValue: 12.151677124512961,
      timestamp: 1607599860000
    },
    {
      txnName: txnName,
      metricName: txnName,
      metricValue: 12.149014549984008,
      timestamp: 1607599920000
    },
    {
      txnName: txnName,
      metricName: txnName,
      metricValue: 7.050477594430973,
      timestamp: 1607599980000
    },
    {
      txnName: txnName1,
      metricName: txnName1,
      metricValue: 12.65,
      timestamp: 1607599920000
    },
    {
      txnName: txnName1,
      metricName: 'kubernetes.io/container/cpu/core_time/s',
      metricValue: 12.65,
      timestamp: 1607599980000
    }
  ]
}

export const MockDataDashBOardDetails = {
  status: 'SUCCESS',
  data: [
    {
      widgetName: 'Restart count - Works',
      dataSetList: [
        {
          timeSeriesQuery: {
            dataSets: [
              {
                timeSeriesQuery: {
                  timeSeriesFilter: {
                    filter: 'metric.type="kubernetes.io/container/restart_count" resource.type="k8s_container"',
                    aggregation: { perSeriesAligner: 'ALIGN_RATE', crossSeriesReducer: 'REDUCE_SUM' }
                  }
                }
              }
            ]
          },
          metricName: 'kubernetes.io/container/restart_count'
        }
      ]
    },
    {
      widgetName: 'Kubernetes Container - Memory usage ',
      dataSetList: [
        {
          timeSeriesQuery: {
            dataSets: [
              {
                timeSeriesQuery: {
                  unitOverride: 'By',
                  timeSeriesFilter: {
                    filter: 'metric.type="kubernetes.io/container/memory/used_bytes" resource.type="k8s_container"',
                    aggregation: { perSeriesAligner: 'ALIGN_MEAN', crossSeriesReducer: 'REDUCE_MEAN' }
                  }
                }
              }
            ]
          },
          metricName: 'kubernetes.io/container/memory/used_bytes'
        }
      ]
    }
  ],
  metaData: null,
  correlationId: 'dcf1ae0e-38fe-421d-a621-3ddf2a5a3349'
}
