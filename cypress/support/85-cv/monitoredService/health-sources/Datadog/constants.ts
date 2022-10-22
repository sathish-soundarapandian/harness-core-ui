/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

const projectIdentifier = 'project1'
const orgIdentifier = 'default'
const accountId = 'accountId'
const dataSourceType = 'DATADOG_METRICS'
const selectedDashboardId = 'gas-53u-ruk'
const configuredMetric = 'datadog.agent.python.version'
export const connectorIdentifier = 'datadog'
export const selectedDashboardName = "praveen's Timeboard 5 Apr 2019 18:16"

export const dashboards = {
  dashboardsAPI: `/cv/api/datadog-metrics/dashboards?routingId=${accountId}&accountId=${accountId}&projectIdentifier=${projectIdentifier}&orgIdentifier=${orgIdentifier}&connectorIdentifier=${connectorIdentifier}&pageSize=7&offset=0&tracingId=*`,
  dashboardsResponse: {
    status: 'SUCCESS',
    data: {
      totalPages: 2,
      totalItems: 14,
      pageItemCount: 7,
      pageSize: 7,
      content: [
        { id: 'a97-8cs-426', name: 'test', path: '/dashboard/a97-8cs-426/test' },
        {
          id: 'c8p-tpb-fn4',
          name: "praveen's Screenboard 11 Apr 2019 17:46",
          path: '/dashboard/c8p-tpb-fn4/praveens-screenboard-11-apr-2019-1746'
        },
        {
          id: 'iph-s8x-tu9',
          name: "pranjal's Timeboard 7 May 2019 15:32",
          path: '/dashboard/iph-s8x-tu9/pranjals-timeboard-7-may-2019-1532'
        },
        {
          id: 'gas-53u-ruk',
          name: "praveen's Timeboard 5 Apr 2019 18:16",
          path: '/dashboard/gas-53u-ruk/praveens-timeboard-5-apr-2019-1816'
        },
        {
          id: 'vxi-z6n-udt',
          name: "praveen's Timeboard 20 Dec 2018 12:25",
          path: '/dashboard/vxi-z6n-udt/praveens-timeboard-20-dec-2018-1225'
        },
        {
          id: '8i3-d5k-7wq',
          name: "parnian's Timeboard 18 Jul 2018 15:05",
          path: '/dashboard/8i3-d5k-7wq/parnians-timeboard-18-jul-2018-1505'
        },
        {
          id: 'jgw-pbc-evf',
          name: "praveen's Timeboard 18 Jul 2018 15:01",
          path: '/dashboard/jgw-pbc-evf/praveens-timeboard-18-jul-2018-1501'
        }
      ],
      pageIndex: 0,
      empty: false
    },
    metaData: null,
    correlationId: 'eafd4a53-f439-4202-91ae-6d59efa2195c'
  }
}

export const metrics = {
  getMetricsCall: `/cv/api/metric-pack?routingId=${accountId}&projectIdentifier=${projectIdentifier}&orgIdentifier=${orgIdentifier}&accountId=${accountId}&dataSourceType=${dataSourceType}`,
  getMetricsResponse: {
    metaData: {},
    resource: [
      {
        uuid: '5r4EUPHhRFaXtb6L7IHAkA',
        accountId: '${accountId}',
        orgIdentifier,
        projectIdentifier: 'Harshil',
        dataSourceType,
        identifier: 'Errors',
        category: 'Errors',
        metrics: [
          {
            name: 'Errors',
            type: 'ERROR',
            path: null,
            validationPath: null,
            responseJsonPath: null,
            validationResponseJsonPath: null,
            thresholds: [],
            included: false
          }
        ],
        thresholds: null
      },
      {
        uuid: 'MGTNKXwYTrGfC27sch_u4Q',
        accountId: '${accountId}',
        orgIdentifier,
        projectIdentifier: 'Harshil',
        dataSourceType,
        identifier: 'Infrastructure',
        category: 'Infrastructure',
        metrics: [
          {
            name: 'Infrastructure',
            type: 'INFRA',
            path: null,
            validationPath: null,
            responseJsonPath: null,
            validationResponseJsonPath: null,
            thresholds: [],
            included: false
          }
        ],
        thresholds: null
      },
      {
        uuid: 'yqsrmlaBR-2Y4oawK9iYaQ',
        accountId: '${accountId}',
        orgIdentifier,
        projectIdentifier: 'Harshil',
        dataSourceType,
        identifier: 'Performance',
        category: 'Performance',
        metrics: [
          {
            name: 'Throughput',
            type: 'THROUGHPUT',
            path: null,
            validationPath: null,
            responseJsonPath: null,
            validationResponseJsonPath: null,
            thresholds: [],
            included: false
          },
          {
            name: 'Response Time',
            type: 'RESP_TIME',
            path: null,
            validationPath: null,
            responseJsonPath: null,
            validationResponseJsonPath: null,
            thresholds: [],
            included: false
          },
          {
            name: 'Other',
            type: 'ERROR',
            path: null,
            validationPath: null,
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
}

export const metricTags = {
  getMetricsTags: `/cv/api/datadog-metrics/metric-tags-v2?routingId=${accountId}&projectIdentifier=${projectIdentifier}&orgIdentifier=${orgIdentifier}&accountId=${accountId}&connectorIdentifier=${connectorIdentifier}&tracingId=*&metric=datadog.agent.python.version`,
  getMetricsTagsResponse: {
    status: 'SUCCESS',
    data: { metricTags: ['agent_version_major:7'], tagKeys: ['agent_version_major'] },
    metaData: null,
    correlationId: 'd5055d0d-e6d2-4ac5-8f29-c373ad9ae893'
  }
}

export const getActiveMetricWithFilter = (filter: string): string =>
  `/cv/api/datadog-metrics/active-metrics?routingId=${accountId}&projectIdentifier=${projectIdentifier}&orgIdentifier=${orgIdentifier}&accountId=${accountId}&connectorIdentifier=${connectorIdentifier}&tracingId=*filter=${filter}`

export const activeMetrics = {
  getActiveMetrics: `/cv/api/datadog-metrics/active-metrics?routingId=${accountId}&projectIdentifier=${projectIdentifier}&orgIdentifier=${orgIdentifier}&accountId=${accountId}&connectorIdentifier=${connectorIdentifier}&tracingId=*`,
  getActiveMetricsResponse: {
    status: 'SUCCESS',
    data: [configuredMetric],
    metaData: null,
    correlationId: 'eb9d6780-8db5-4f51-b476-aac2f63a00d0'
  },
  getActiveMetricsFilteredResponse: {
    status: 'SUCCESS',
    data: [configuredMetric, 'docker.cpu.usage'],
    metaData: null,
    correlationId: 'eb9d6780-8db5-4f51-b476-aac2f63a00d0'
  }
}

export const dashboardDetails = {
  getDashboardDetails: `/cv/api/datadog-metrics/dashboard-details?routingId=${accountId}&projectIdentifier=${projectIdentifier}&orgIdentifier=${orgIdentifier}&accountId=${accountId}&connectorIdentifier=${connectorIdentifier}&tracingId=*&dashboardId=${selectedDashboardId}&path=${selectedDashboardId}`,
  getDashboardDetailsResponse: {
    status: 'SUCCESS',
    data: [
      {
        widgetName: configuredMetric,
        dataSets: [
          {
            name: `avg:${configuredMetric}{kube_service:cv24-7-test-dev-cv-todolist-cv-24-7-appd}`,
            query: `avg:${configuredMetric}{kube_service:cv24-7-test-dev-cv-todolist-cv-24-7-appd}`
          }
        ]
      }
    ],
    metaData: null,
    correlationId: 'd480b740-f160-48d7-910d-3491c557ff40'
  }
}

export const dataLogsIndexes = {
  getDatadogLogsIndexes: `/cv/api/datadog-logs/log-indexes?routingId=${accountId}&projectIdentifier=${projectIdentifier}&orgIdentifier=${orgIdentifier}&accountId=${accountId}&connectorIdentifier=${connectorIdentifier}&tracingId=*`,
  getDatadogLogsIndexesResponse: {
    status: 'SUCCESS',
    data: ['main'],
    metaData: null,
    correlationId: '37ed6880-a7e0-4c95-86f0-cccf72a8ad7d'
  }
}

export const datadogLogsSample = {
  getDatadogLogsSample: `/cv/api/datadog-logs/sample-data?routingId=${accountId}&accountId=${accountId}&projectIdentifier=${projectIdentifier}&orgIdentifier=${orgIdentifier}&tracingId=*&connectorIdentifier=${connectorIdentifier}`,
  getDatadogLogsSampleResponse: {
    metaData: null,
    status: 'SUCCESS',
    correlationId: '2960107f-804b-4739-871d-60050f002048',
    data: [
      {
        attributes: {
          attributes: {
            date: 1645672196524,
            view: {
              referrer: '',
              url_details: {
                path: '/dashboard/shows/1300',
                scheme: 'https',
                host: 'portal.artistconnection.net'
              },
              referrer_details: {
                path: ''
              },
              url: 'https://portal.artistconnection.net/dashboard/shows/1300'
            },
            logger: {
              name: 'test'
            },
            http: {
              useragent:
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36',
              useragent_details: {
                os: {
                  patch: '7',
                  major: '10',
                  minor: '15',
                  family: 'Mac OS X'
                },
                browser: {
                  patch_minor: '102',
                  patch: '4758',
                  major: '98',
                  minor: '0',
                  family: 'Chrome'
                },
                device: {
                  model: 'Mac',
                  category: 'Desktop',
                  family: 'Mac',
                  brand: 'Apple'
                }
              }
            },
            session_id: 'f4b8b465-b014-46e6-b3be-61f968cbed7e',
            status: 'info',
            network: {
              client: {
                geoip: {
                  continent: {
                    code: 'AS',
                    name: 'Asia'
                  },
                  subdivision: {
                    name: 'Tokyo'
                  },
                  country: {
                    name: 'Japan',
                    iso_code: 'JP'
                  },
                  as: {
                    number: 'AS2497',
                    route: '2001:240::/32',
                    domain: 'iij.ad.jp',
                    name: 'Internet Initiative Japan Inc.',
                    type: 'isp'
                  },
                  city: {
                    name: 'Tokyo'
                  },
                  timezone: 'Asia/Tokyo',
                  ipAddress: '2001:240:29a2:7800:e915:25a9:bb39:9a5e',
                  location: {
                    latitude: 35.6895,
                    longitude: 139.69171
                  }
                },
                ip: '2001:240:29a2:7800:e915:25a9:bb39:9a5e'
              }
            }
          },
          message: 'Log number: 372',
          status: 'info',
          tags: ['source:browser', 'sdk_version:3.6.12', 'source:browser'],
          timestamp: '2022-02-24T03:09:56.524Z'
        },
        id: 'AQAAAX8ptOmsUqyhswAAAABBWDhwdE9zM0FBQWJEN1FLTkh0empnQUE',
        type: 'log'
      }
    ]
  }
}

export const dataDogMonitoredService = {
  status: 'SUCCESS',
  data: {
    createdAt: 1644978191147,
    lastModifiedAt: 1644978191147,
    monitoredService: {
      orgIdentifier,
      projectIdentifier: 'Harshil',
      identifier: 'service1_env1',
      name: 'service1_env1',
      type: 'Application',
      description: '',
      serviceRef: 'service1',
      environmentRef: 'env1',
      environmentRefList: ['env1'],
      tags: {},
      sources: {
        healthSources: [
          {
            name: 'DD new',
            identifier: 'DD_new',
            type: 'DatadogMetrics',
            spec: {
              connectorRef: connectorIdentifier,
              feature: 'Datadog Cloud Metrics',
              metricDefinitions: [
                {
                  identifier: 'DD metric',
                  metricName: 'DD metric',
                  riskProfile: { riskCategory: 'Errors', thresholdTypes: ['ACT_WHEN_HIGHER'] },
                  analysis: {
                    liveMonitoring: { enabled: false },
                    deploymentVerification: {
                      enabled: true,
                      serviceInstanceFieldName: '',
                      serviceInstanceMetricPath: null
                    },
                    riskProfile: { riskCategory: 'Errors', thresholdTypes: ['ACT_WHEN_HIGHER'] }
                  },
                  serviceInstanceIdentifierTag: 'agent_version_major',
                  sli: { enabled: false },
                  dashboardId: null,
                  dashboardName: 'group-1',
                  metricPath: 'DD metric',
                  query: `${configuredMetric}{}.rollup(avg, 60)`,
                  groupingQuery: `${configuredMetric}{}.rollup(avg, 60)`,
                  metric: configuredMetric,
                  aggregation: null,
                  metricTags: [''],
                  isManualQuery: false,
                  isCustomCreatedMetric: true
                }
              ]
            }
          }
        ],
        changeSources: [
          {
            name: 'Harness CD Next Gen',
            identifier: 'harness_cd_next_gen',
            type: 'HarnessCDNextGen',
            enabled: true,
            spec: {},
            category: 'Deployment'
          }
        ]
      },
      dependencies: []
    }
  },
  metaData: null,
  correlationId: '88174d93-852a-4ff5-9dce-60b5e43d27cb'
}

export const datadogLogsMonitoredService = {
  status: 'SUCCESS',
  data: {
    createdAt: 1644978191147,
    lastModifiedAt: 1645763817204,
    monitoredService: {
      orgIdentifier: 'CV',
      projectIdentifier: 'Harshil',
      identifier: 'dd_service_dd_env',
      name: 'dd_service_dd_env',
      type: 'Application',
      description: '',
      serviceRef: 'dd_service',
      environmentRef: 'dd_env',
      environmentRefList: ['dd_env'],
      tags: {},
      sources: {
        healthSources: [
          {
            name: 'DD Logs',
            identifier: 'DD_Logs',
            type: 'DatadogLog',
            spec: {
              connectorRef: connectorIdentifier,
              feature: 'Datadog Cloud Logs',
              queries: [
                {
                  name: 'Datadog Logs Query',
                  query: 'source:browser',
                  indexes: ['main'],
                  serviceInstanceIdentifier: 'source'
                }
              ]
            }
          }
        ],
        changeSources: [
          {
            name: 'Harness CD Next Gen',
            identifier: 'harness_cd_next_gen',
            type: 'HarnessCDNextGen',
            enabled: true,
            spec: {},
            category: 'Deployment'
          }
        ]
      },
      dependencies: []
    }
  },
  metaData: null,
  correlationId: '41066f1f-c4c5-4622-bcb8-02abca059a11'
}
