/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

const accountId = 'accountId'
const orgIdentifier = 'default'
const projectIdentifier = 'project1'
const connectorIdentifier = 'prometheussale'
const dataSourceType = 'PROMETHEUS'

export const sampleDataAPI = `/cv/api/prometheus/sample-data?routingId=${accountId}&accountId=${accountId}&projectIdentifier=${projectIdentifier}&orgIdentifier=${orgIdentifier}&query=*&tracingId=*&connectorIdentifier=${connectorIdentifier}`

export const sampleDataResponse = {
  status: 'SUCCESS',
  data: [
    {
      metricDetails: {
        instance: 'prometheusgoto.cie-demo.co.uk:80',
        pod: 'payment-service-goto-deployment-canary-67cdbc674b-bzcfs',
        __name__: 'classes',
        datalnddev: 'classes',
        job: 'payment-service-nikpapag',
        group: 'goto'
      },
      data: [
        {
          timestamp: 1645071060,
          value: 16375
        },
        {
          timestamp: 1645071120,
          value: 16375
        },
        {
          timestamp: 1645071180,
          value: 16375
        },
        {
          timestamp: 1645071240,
          value: 16375
        }
      ]
    }
  ],
  metaData: null,
  correlationId: 'e73f74cd-2dec-49eb-9ea2-cfdf43961ed3'
}

export const metricPackAPI = `/cv/api/metric-pack?routingId=${accountId}&projectIdentifier=${projectIdentifier}&orgIdentifier=${orgIdentifier}&accountId=${accountId}&dataSourceType=${dataSourceType}`

export const metricPackResponse = {
  metaData: {},
  resource: [
    {
      uuid: 'f3VK7oDoSXaVJmxZAEPHVQ',
      accountId,
      orgIdentifier,
      projectIdentifier,
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
      uuid: 'inNziIl5TtGFjAtu05qQFg',
      accountId,
      orgIdentifier,
      projectIdentifier,
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
      uuid: 'sxlCCw3hSMWVFq9C3QYSlQ',
      accountId,
      orgIdentifier,
      projectIdentifier,
      dataSourceType,
      identifier: 'Performance',
      category: 'Performance',
      metrics: [
        {
          name: 'Other',
          type: 'ERROR',
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
          name: 'Throughput',
          type: 'THROUGHPUT',
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

export const labelNamesAPI = `/cv/api/prometheus/label-names?routingId=${accountId}&projectIdentifier=${projectIdentifier}&orgIdentifier=${orgIdentifier}&accountId=${accountId}&connectorIdentifier=${connectorIdentifier}&tracingId=*`

export const labelNamesResponse = {
  status: 'SUCCESS',
  data: [
    '__name__',
    'datalnddev',
    'generation',
    'group',
    'implementation',
    'instance',
    'job',
    'major',
    'minor',
    'patchlevel',
    'pod',
    'version'
  ],
  metaData: null,
  correlationId: '49e05f9e-2098-4efe-a7ee-c9b74083c436'
}

export const labelValuesAPI = `/cv/api/prometheus/label-values?routingId=${accountId}&projectIdentifier=${projectIdentifier}&orgIdentifier=${orgIdentifier}&accountId=${accountId}&connectorIdentifier=${connectorIdentifier}&labelName=*&tracingId=*`

export const metricListAPI = `/cv/api/prometheus/metric-list?routingId=${accountId}&projectIdentifier=${projectIdentifier}&orgIdentifier=${orgIdentifier}&accountId=${accountId}&tracingId=*&connectorIdentifier=${connectorIdentifier}`

export const metricListResponse = {
  status: 'SUCCESS',
  data: [
    'classes',
    'classes_loaded',
    'classes_unloaded',
    'datasource_primary_active',
    'datasource_primary_usage',
    'gauge_servo_response_application_metrics',
    'gauge_servo_response_mvc_createpayment',
    'gauge_servo_response_mvc_payment',
    'gauge_servo_response_root',
    'gauge_servo_response_star_star',
    'gauge_servo_response_star_star_favicon_ico',
    'gauge_servo_response_unmapped',
    'gauge_servo_rest_max',
    'gauge_servo_rest_min',
    'gc_ps_marksweep_count',
    'gc_ps_marksweep_time',
    'gc_ps_scavenge_count',
    'gc_ps_scavenge_time',
    'heap',
    'heap_committed',
    'heap_init',
    'heap_used',
    'httpsessions_active',
    'httpsessions_max',
    'instance_uptime',
    'mem',
    'mem_free',
    'nonheap',
    'nonheap_committed',
    'nonheap_init',
    'nonheap_used',
    'normalized_servo_rest_count',
    'normalized_servo_rest_totaltime',
    'process_cpu_seconds_total',
    'process_max_fds',
    'process_open_fds',
    'process_resident_memory_bytes',
    'process_start_time_seconds',
    'process_virtual_memory_bytes',
    'processors',
    'python_gc_collections_total',
    'python_gc_objects_collected_total',
    'python_gc_objects_uncollectable_total',
    'python_info',
    'scrape_duration_seconds',
    'scrape_samples_post_metric_relabeling',
    'scrape_samples_scraped',
    'scrape_series_added',
    'systemload_average',
    'threads',
    'threads_daemon',
    'threads_peak',
    'threads_totalStarted',
    'up',
    'uptime'
  ],
  metaData: null,
  correlationId: 'c9a53cb2-1a56-400c-ab74-edab8bce2307'
}

export const monitoredService = {
  status: 'SUCCESS',
  data: {
    createdAt: 1642157779711,
    lastModifiedAt: 1643278935584,
    monitoredService: {
      orgIdentifier,
      projectIdentifier,
      identifier: 'service1_env1',
      name: 'service1_env1',
      type: 'Application',
      description: '',
      serviceRef: 'service1',
      environmentRef: 'env1',
      environmentRefList: null,
      tags: {},
      sources: {
        healthSources: [
          {
            name: 'Prometheus',
            identifier: 'Prometheus',
            type: 'Prometheus',
            spec: {
              connectorRef: connectorIdentifier,
              metricDefinitions: [
                {
                  identifier: 'prometheus_metric',
                  metricName: 'Prometheus Metric',
                  riskProfile: {
                    riskCategory: 'Infrastructure',
                    thresholdTypes: ['ACT_WHEN_HIGHER']
                  },
                  analysis: {
                    liveMonitoring: {
                      enabled: true
                    },
                    deploymentVerification: {
                      enabled: true,
                      serviceInstanceFieldName: '__name__',
                      serviceInstanceMetricPath: null
                    },
                    riskProfile: {
                      riskCategory: 'Infrastructure',
                      thresholdTypes: ['ACT_WHEN_HIGHER']
                    }
                  },
                  sli: {
                    enabled: true
                  },
                  query: 'classes {\n\n}',
                  groupName: 'Group 1',
                  serviceInstanceFieldName: '__name__',
                  prometheusMetric: null,
                  serviceFilter: null,
                  envFilter: null,
                  additionalFilters: null,
                  aggregation: null,
                  isManualQuery: true
                },
                {
                  identifier: 'Prometheus_Metric_123',
                  metricName: 'Prometheus Metric 123',
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
                  query: 'classes {\n\n}',
                  groupName: 'Group 1',
                  serviceInstanceFieldName: null,
                  prometheusMetric: null,
                  serviceFilter: null,
                  envFilter: null,
                  additionalFilters: null,
                  aggregation: null,
                  isManualQuery: true
                }
              ]
            }
          }
        ],
        changeSources: []
      },
      dependencies: []
    }
  },
  metaData: null,
  correlationId: 'f3cdbd07-e92d-4162-854e-c6aac938d0c0'
}

export const awsPrometheusMonitoredService = {
  status: 'SUCCESS',
  data: {
    createdAt: 1642157779711,
    lastModifiedAt: 1643278935584,
    monitoredService: {
      orgIdentifier,
      projectIdentifier,
      identifier: 'service1_env1',
      name: 'service1_env1',
      type: 'Application',
      description: '',
      serviceRef: 'service1',
      environmentRef: 'env1',
      environmentRefList: null,
      tags: {},
      sources: {
        healthSources: [
          {
            name: 'AwsPrometheusTest',
            identifier: 'AwsPrometheusTest',
            type: 'AwsPrometheus',
            spec: {
              region: 'region 1',
              workspaceId: 'sjksm43455n-34x53c45vdssd-fgdfd232sdfad',
              connectorRef: connectorIdentifier,
              metricDefinitions: [
                {
                  identifier: 'prometheus_metric',
                  metricName: 'Prometheus Metric',
                  riskProfile: {},
                  analysis: {
                    liveMonitoring: {
                      enabled: false
                    },
                    deploymentVerification: {
                      enabled: false,
                      serviceInstanceFieldName: '__name__',
                      serviceInstanceMetricPath: null
                    },
                    riskProfile: {}
                  },
                  sli: {
                    enabled: true
                  },
                  query: 'classes {\n\n}',
                  groupName: 'Group 1',
                  serviceInstanceFieldName: '__name__',
                  prometheusMetric: null,
                  serviceFilter: null,
                  envFilter: null,
                  additionalFilters: null,
                  aggregation: null,
                  isManualQuery: true
                }
              ]
            }
          }
        ],
        changeSources: []
      },
      dependencies: []
    }
  },
  metaData: null,
  correlationId: 'f3cdbd07-e92d-4162-854e-c6aac938d0c0'
}

export const monitoredServiceForBuildQuery = {
  status: 'SUCCESS',
  data: {
    createdAt: 1642157779711,
    lastModifiedAt: 1643278935584,
    monitoredService: {
      orgIdentifier,
      projectIdentifier,
      identifier: 'service1_env1',
      name: 'service1_env1',
      type: 'Application',
      description: '',
      serviceRef: 'service1',
      environmentRef: 'env1',
      environmentRefList: null,
      tags: {},
      sources: {
        healthSources: [
          {
            name: 'Prometheus',
            identifier: 'Prometheus',
            type: 'Prometheus',
            spec: {
              connectorRef: connectorIdentifier,
              metricDefinitions: [
                {
                  identifier: 'prometheus_metric',
                  metricName: 'Prometheus Metric',
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
                  query:
                    'avg(classes{__name__:classes="__name__",__name__:classes="__name__",__name__:classes="__name__"})',
                  groupName: 'Group 1',
                  serviceInstanceFieldName: null,
                  prometheusMetric: 'classes',
                  serviceFilter: [
                    {
                      labelName: '__name__:classes',
                      labelValue: '__name__'
                    }
                  ],
                  envFilter: [
                    {
                      labelName: '__name__:classes',
                      labelValue: '__name__'
                    }
                  ],
                  additionalFilters: [
                    {
                      labelName: '__name__:classes',
                      labelValue: '__name__'
                    }
                  ],
                  aggregation: 'avg',
                  isManualQuery: false
                }
              ]
            }
          }
        ],
        changeSources: []
      },
      dependencies: []
    }
  },
  metaData: null,
  correlationId: 'f3cdbd07-e92d-4162-854e-c6aac938d0c0'
}
