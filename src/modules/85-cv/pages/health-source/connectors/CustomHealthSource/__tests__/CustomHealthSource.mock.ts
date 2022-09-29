/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { MapCustomHealthToService } from '../CustomHealthSource.types'

const metricName = 'CustomHealth Metric 101'
const jsonPath = '$.series.[*].pointlist.[*]'

export const mappedMetric = new Map()
const emptyMappedValue = {
  baseURL: '',
  endTime: {
    customTimestampFormat: '',
    placeholder: '',
    timestampFormat: 'SECONDS'
  },
  identifier: '',
  metricIdentifier: 'CustomHealth_Metric',
  metricName: 'CustomHealth Metric',
  metricValue: '',
  pathURL: '',
  query: '',
  queryType: undefined,
  requestMethod: undefined,
  serviceInstancePath: '',
  startTime: {
    customTimestampFormat: '',
    placeholder: '',
    timestampFormat: 'SECONDS'
  },
  timestamp: '',
  timestampFormat: '',
  failFastThresholds: [],
  ignoreThresholds: []
}
mappedMetric.set('CustomHealth Metric', emptyMappedValue)

export const transformedSetupSource = {
  connectorRef: undefined,
  healthSourceIdentifier: undefined,
  healthSourceName: undefined,
  isEdit: false,
  mappedServicesAndEnvs: mappedMetric,
  failFastThresholds: [],
  ignoreThresholds: []
}

export const mappedValue = {
  metricName,
  metricIdentifier: 'CustomHealthMetric101',
  groupName: { label: 'Group 1', value: 'Group 1' },
  continuousVerification: false,
  healthScore: true,
  sli: false,
  riskCategory: 'Errors/ERROR',
  serviceInstanceIdentifier: 'serviceInstance',
  lowerBaselineDeviation: false,
  higherBaselineDeviation: true,
  queryType: 'SERVICE_BASED',
  requestMethod: 'POST',
  query: 'Select * from ',
  baseURL: '',
  pathURL:
    'https://localhost:8181/#/account/kmpySmUISimoRrJL6NL73w/cv/orgs/default/projects/CustomHealthSource/monitoringservices/edit/Service_101_QA?tab=Configurations',
  metricValue: jsonPath,
  timestamp: jsonPath,
  timestampFormat: 'MMMM DD YY',
  serviceInstancePath: '',
  startTime: { placeholder: 'start_time', timestampFormat: 'MILLISECONDS', customTimestampFormat: '' },
  endTime: { placeholder: 'end_time', timestampFormat: 'MILLISECONDS', customTimestampFormat: '' }
}

export const customHealthSourceData = {
  name: 'customHealthDatadog',
  identifier: 'customHealthDatadog',
  type: 'CustomHealth' as any,
  spec: {
    metricDefinitions: [
      {
        metricName: 'metric110',
        identifier: 'metric110',
        groupName: 'group1',
        queryType: 'SERVICE_BASED',
        urlPath: 'query?query=kubernetes.cpu.usage.total{*}by{pod_name}.rollup(avg,60)',
        method: 'GET',
        startTime: {
          placeholder: 'start_time_seconds',
          timestampFormat: 'SECONDS'
        },
        endTime: {
          placeholder: 'end_time_seconds',
          timestampFormat: 'SECONDS'
        },
        metricResponseMapping: {
          metricValueJsonPath: 'series[*].pointlist[*].[1]',
          timestampJsonPath: 'series[*].pointlist[*].[0]'
        }
      }
    ]
  }
}

export const mocksampledata = {
  status: 'SUCCESS',
  data: {
    total: {
      results: [{ average: 0.0026334715948905796 }],
      beginTimeSeconds: 1.63974324e9,
      endTimeSeconds: 1.63974504e9,
      inspectedCount: 30.0
    },
    timeSeries: [
      {
        results: [{ average: null }],
        beginTimeSeconds: 1.63974324e9,
        endTimeSeconds: 1.6397433e9,
        inspectedCount: 1.0
      },
      {
        results: [{ average: 0.0030637369491159916 }],
        beginTimeSeconds: 1.6397433e9,
        endTimeSeconds: 1.63974336e9,
        inspectedCount: 1.0
      },
      {
        results: [{ average: 0.0030637369491159916 }],
        beginTimeSeconds: 1.63974336e9,
        endTimeSeconds: 1.63974342e9,
        inspectedCount: 1.0
      },
      {
        results: [{ average: null }],
        beginTimeSeconds: 1.63974342e9,
        endTimeSeconds: 1.63974348e9,
        inspectedCount: 1.0
      },
      {
        results: [{ average: null }],
        beginTimeSeconds: 1.63974348e9,
        endTimeSeconds: 1.63974354e9,
        inspectedCount: 1.0
      },
      {
        results: [{ average: null }],
        beginTimeSeconds: 1.63974354e9,
        endTimeSeconds: 1.6397436e9,
        inspectedCount: 1.0
      },
      {
        results: [{ average: null }],
        beginTimeSeconds: 1.6397436e9,
        endTimeSeconds: 1.63974366e9,
        inspectedCount: 1.0
      },
      {
        results: [{ average: 0.001387411030009389 }],
        beginTimeSeconds: 1.63974366e9,
        endTimeSeconds: 1.63974372e9,
        inspectedCount: 1.0
      },
      {
        results: [{ average: null }],
        beginTimeSeconds: 1.63974372e9,
        endTimeSeconds: 1.63974378e9,
        inspectedCount: 1.0
      },
      {
        results: [{ average: null }],
        beginTimeSeconds: 1.63974378e9,
        endTimeSeconds: 1.63974384e9,
        inspectedCount: 1.0
      },
      {
        results: [{ average: null }],
        beginTimeSeconds: 1.63974384e9,
        endTimeSeconds: 1.6397439e9,
        inspectedCount: 1.0
      },
      {
        results: [{ average: null }],
        beginTimeSeconds: 1.6397439e9,
        endTimeSeconds: 1.63974396e9,
        inspectedCount: 1.0
      },
      {
        results: [{ average: null }],
        beginTimeSeconds: 1.63974396e9,
        endTimeSeconds: 1.63974402e9,
        inspectedCount: 1.0
      },
      {
        results: [{ average: null }],
        beginTimeSeconds: 1.63974402e9,
        endTimeSeconds: 1.63974408e9,
        inspectedCount: 1.0
      },
      {
        results: [{ average: null }],
        beginTimeSeconds: 1.63974408e9,
        endTimeSeconds: 1.63974414e9,
        inspectedCount: 1.0
      },
      {
        results: [{ average: null }],
        beginTimeSeconds: 1.63974414e9,
        endTimeSeconds: 1.6397442e9,
        inspectedCount: 1.0
      },
      {
        results: [{ average: 0.002205845434218645 }],
        beginTimeSeconds: 1.6397442e9,
        endTimeSeconds: 1.63974426e9,
        inspectedCount: 1.0
      },
      {
        results: [{ average: null }],
        beginTimeSeconds: 1.63974426e9,
        endTimeSeconds: 1.63974432e9,
        inspectedCount: 1.0
      },
      {
        results: [{ average: null }],
        beginTimeSeconds: 1.63974432e9,
        endTimeSeconds: 1.63974438e9,
        inspectedCount: 1.0
      },
      {
        results: [{ average: 0.004594903904944658 }],
        beginTimeSeconds: 1.63974438e9,
        endTimeSeconds: 1.63974444e9,
        inspectedCount: 1.0
      },
      {
        results: [{ average: null }],
        beginTimeSeconds: 1.63974444e9,
        endTimeSeconds: 1.6397445e9,
        inspectedCount: 1.0
      },
      {
        results: [{ average: null }],
        beginTimeSeconds: 1.6397445e9,
        endTimeSeconds: 1.63974456e9,
        inspectedCount: 1.0
      },
      {
        results: [{ average: null }],
        beginTimeSeconds: 1.63974456e9,
        endTimeSeconds: 1.63974462e9,
        inspectedCount: 1.0
      },
      {
        results: [{ average: null }],
        beginTimeSeconds: 1.63974462e9,
        endTimeSeconds: 1.63974468e9,
        inspectedCount: 1.0
      },
      {
        results: [{ average: 0.002273146528750658 }],
        beginTimeSeconds: 1.63974468e9,
        endTimeSeconds: 1.63974474e9,
        inspectedCount: 1.0
      },
      {
        results: [{ average: null }],
        beginTimeSeconds: 1.63974474e9,
        endTimeSeconds: 1.6397448e9,
        inspectedCount: 1.0
      },
      {
        results: [{ average: null }],
        beginTimeSeconds: 1.6397448e9,
        endTimeSeconds: 1.63974486e9,
        inspectedCount: 1.0
      },
      {
        results: [{ average: null }],
        beginTimeSeconds: 1.63974486e9,
        endTimeSeconds: 1.63974492e9,
        inspectedCount: 1.0
      },
      {
        results: [{ average: null }],
        beginTimeSeconds: 1.63974492e9,
        endTimeSeconds: 1.63974498e9,
        inspectedCount: 1.0
      },
      {
        results: [{ average: null }],
        beginTimeSeconds: 1.63974498e9,
        endTimeSeconds: 1.63974504e9,
        inspectedCount: 1.0
      }
    ],
    performanceStats: {
      inspectedCount: 30.0,
      omittedCount: 0.0,
      matchCount: 30.0,
      wallClockTime: 145.0,
      matchedFromFileRead: 0.0,
      matchedViaCache: 0.0
    },
    metadata: {
      accounts: [1805869.0],
      eventTypes: ['Metric'],
      eventType: 'Metric',
      timeAggregations: ['raw metrics'],
      openEnded: false,
      beginTime: '2021-12-17T12:14:00Z',
      endTime: '2021-12-17T12:44:00Z',
      beginTimeMillis: 1.63974324e12,
      endTimeMillis: 1.63974504e12,
      rawSince: '1639743240000',
      rawUntil: '1639745040000',
      rawCompareWith: '',
      bucketSizeMillis: 60000.0,
      guid: '48d0cbe4-040c-fea2-b8a8-aba18a7a5d64',
      routerGuid: '48d0cbe4-040c-fea2-b8a8-aba18a7a5d64',
      messages: [],
      timeSeries: {
        messages: [],
        contents: [{ function: 'average', attribute: 'apm.service.transaction.duration', simple: true }]
      }
    }
  },
  metaData: null,
  correlationId: '1fe4535e-2665-483b-a23c-6096f20907b1'
}

export const mockedHealthSourcePayload = {
  identifier: 'New_Custom',
  name: 'New Custom',
  spec: {
    connectorRef: 'customhealth',
    metricDefinitions: [
      {
        analysis: {
          deploymentVerification: {
            enabled: false,
            serviceInstanceMetricPath: 'serviceInstance'
          },
          liveMonitoring: {
            enabled: true
          },
          riskProfile: {
            category: 'Errors',
            metricType: 'ERROR',
            thresholdTypes: ['ACT_WHEN_HIGHER']
          }
        },
        groupName: 'Group 1',
        identifier: 'CustomHealthMetric101',
        metricName: 'CustomHealth Metric 101',
        metricResponseMapping: {
          metricValueJsonPath: '$.series.[*].pointlist.[*]',
          serviceInstanceJsonPath: 'serviceInstance',
          timestampFormat: 'MMMM DD YY',
          timestampJsonPath: '$.series.[*].pointlist.[*]'
        },
        queryType: 'SERVICE_BASED',
        requestDefinition: {
          endTimeInfo: {
            customTimestampFormat: '',
            placeholder: 'end_time',
            timestampFormat: 'MILLISECONDS'
          },
          method: 'POST',
          requestBody: 'Select * from ',
          startTimeInfo: {
            customTimestampFormat: '',
            placeholder: 'start_time',
            timestampFormat: 'MILLISECONDS'
          },
          urlPath:
            'https://localhost:8181/#/account/kmpySmUISimoRrJL6NL73w/cv/orgs/default/projects/CustomHealthSource/monitoringservices/edit/Service_101_QA?tab=Configurations'
        },
        sli: {
          enabled: false
        }
      }
    ],
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
  type: 'CustomHealthMetric'
}

export const noErrorValidatation = {
  metricName,
  metricIdentifier: 'CustomHealthMetric101',
  groupName: { label: 'Group 1', value: 'Group 1' },
  continuousVerification: false,
  healthScore: true,
  sli: false,
  riskCategory: 'Errors/ERROR',
  serviceInstanceIdentifier: 'serviceInstance',
  lowerBaselineDeviation: false,
  higherBaselineDeviation: true,
  queryType: 'SERVICE_BASED',
  requestMethod: 'POST',
  query: 'Select * from ',
  baseURL: '',
  pathURL:
    'https://localhost:8181/#/account/kmpySmUISimoRrJL6NL73w/cv/orgs/default/projects/CustomHealthSource/monitoringservices/edit/Service_101_QA?tab=Configurations?start_time=dfgdd&end_time=5433',
  metricValue: jsonPath,
  timestamp: jsonPath,
  timestampFormat: 'MMMM DD YY',
  serviceInstancePath: '',
  startTime: { placeholder: 'start_time', timestampFormat: 'MILLISECONDS', customTimestampFormat: '' },
  endTime: { placeholder: 'end_time', timestampFormat: 'MILLISECONDS', customTimestampFormat: '' }
}

export const sourceData = {
  isEdit: true,
  healthSourceList: [
    {
      name: 'New Custom',
      identifier: 'New_Custom',
      type: 'Custom Health',
      spec: {
        connectorRef: 'customhealth',
        metricDefinitions: [
          {
            identifier: 'CustomHealthMetric101',
            metricName: 'CustomHealth Metric 101',
            riskProfile: { category: 'Errors', metricType: 'ERROR', thresholdTypes: ['ACT_WHEN_HIGHER'] },
            analysis: {
              liveMonitoring: { enabled: true },
              deploymentVerification: {
                enabled: false,
                serviceInstanceFieldName: 'serviceInstance',
                serviceInstanceMetricPath: null
              },
              riskProfile: { category: 'Errors', metricType: 'ERROR', thresholdTypes: ['ACT_WHEN_HIGHER'] }
            },
            sli: null,
            groupName: 'Group 1',
            queryType: 'SERVICE_BASED',
            urlPath:
              'https://localhost:8181/#/account/kmpySmUISimoRrJL6NL73w/cv/orgs/default/projects/CustomHealthSource/monitoringservices/edit/Service_101_QA?tab=Configurations',
            method: 'POST',
            requestBody: 'Select * from ',
            startTime: { placeholder: 'start_time', timestampFormat: 'MILLISECONDS', customTimestampFormat: '' },
            endTime: { placeholder: 'end_time', timestampFormat: 'MILLISECONDS', customTimestampFormat: '' },
            metricResponseMapping: {
              metricValueJsonPath: '$.series.[*].pointlist.[*]',
              timestampJsonPath: '$.series.[*].pointlist.[*]',
              serviceInstanceJsonPath: null,
              timestampFormat: 'MMMM DD YY'
            }
          }
        ]
      }
    }
  ],
  serviceRef: 'Service_101',
  environmentRef: 'QA',
  monitoredServiceRef: { name: 'Service_101_QA', identifier: 'Service_101_QA' },
  existingMetricDetails: {
    name: 'New Custom',
    identifier: 'New_Custom',
    type: 'CustomHealth',
    spec: {
      connectorRef: 'customhealth',
      metricDefinitions: [
        {
          identifier: 'CustomHealthMetric101',
          metricName: 'CustomHealth Metric 101',
          riskProfile: { category: 'Errors', metricType: 'ERROR', thresholdTypes: ['ACT_WHEN_HIGHER'] },
          analysis: {
            liveMonitoring: { enabled: true },
            deploymentVerification: {
              enabled: false,
              serviceInstanceFieldName: 'serviceInstance',
              serviceInstanceMetricPath: null
            },
            riskProfile: { category: 'Errors', metricType: 'ERROR', thresholdTypes: ['ACT_WHEN_HIGHER'] }
          },
          sli: null,
          groupName: 'Group 1',
          queryType: 'SERVICE_BASED',
          urlPath:
            'https://localhost:8181/#/account/kmpySmUISimoRrJL6NL73w/cv/orgs/default/projects/CustomHealthSource/monitoringservices/edit/Service_101_QA?tab=Configurations',
          method: 'POST',
          requestBody: 'Select * from ',
          startTime: { placeholder: 'start_time', timestampFormat: 'MILLISECONDS', customTimestampFormat: '' },
          endTime: { placeholder: 'end_time', timestampFormat: 'MILLISECONDS', customTimestampFormat: '' },
          metricResponseMapping: {
            metricValueJsonPath: '$.series.[*].pointlist.[*]',
            timestampJsonPath: '$.series.[*].pointlist.[*]',
            serviceInstanceJsonPath: null,
            timestampFormat: 'MMMM DD YY'
          }
        }
      ]
    }
  },
  healthSourceName: 'New Custom',
  healthSourceIdentifier: 'New_Custom',
  sourceType: 'CustomHealth',
  connectorRef: 'customhealth',
  product: {}
}

export const emptyCustomMetricData = {
  ...sourceData,
  healthSourceList: [
    {
      name: 'New Custom',
      identifier: 'New_Custom',
      type: 'Custom Health',
      spec: {
        connectorRef: 'customhealth',
        metricDefinitions: []
      },
      service: 'todolist',
      environment: 'production'
    }
  ]
}

export const mappedMetricValues = [
  {
    metricName: 'CustomHealth Metric',
    metricIdentifier: 'customMetric101',
    groupName: { label: 'Group 1', value: 'Group 1' },
    continuousVerification: false,
    healthScore: false,
    sli: true,
    riskCategory: '',
    serviceInstanceIdentifier: 'serviceInstance',
    lowerBaselineDeviation: false,
    higherBaselineDeviation: false,
    queryType: 'SERVICE_BASED',
    requestMethod: 'GET',
    query: '*',
    baseURL: '',
    pathURL:
      'query?query=kubernetes.cpu.usage.total{*}by{pod_name}.rollup(avg,60)&from=start_time_seconds&to=end_time_seconds&pod_name=harness-datadog-dummy-pipeline-deployment-canary-76586cb6fvjsfp',
    metricValue: '$.series.[*].query_index',
    timestamp: '$.series.[*].length',
    timestampFormat: '',
    serviceInstancePath: '',
    startTime: { placeholder: 'start_time_seconds', timestampFormat: 'SECONDS', customTimestampFormat: '' },
    endTime: { placeholder: 'end_time_seconds', timestampFormat: 'SECONDS', customTimestampFormat: '' }
  },
  {
    metricName: 'appdMetric 8ltxanbnvzv',
    metricIdentifier: '',
    groupName: { label: 'Group 1', value: 'Group 1' },
    continuousVerification: false,
    healthScore: false,
    sli: true,
    riskCategory: '',
    serviceInstanceIdentifier: 'serviceInstance',
    lowerBaselineDeviation: false,
    higherBaselineDeviation: false,
    queryType: 'SERVICE_BASED',
    requestMethod: 'GET',
    query: '*',
    baseURL: '',
    pathURL:
      'query?query=kubernetes.cpu.usage.total{*}by{pod_name}.rollup(avg,60)&from=start_time_seconds&to=end_time_seconds&pod_name=harness-datadog-dummy-pipeline-deployment-canary-76586cb6fvjsfp',
    metricValue: '$.series.[*].interval',
    timestamp: '$.series.[*].scope',
    timestampFormat: '',
    serviceInstancePath: '',
    startTime: { placeholder: 'start_time_seconds' },
    endTime: { placeholder: 'end_time_seconds' }
  }
]

export const mappedMetricWithValue = new Map()
mappedMetricWithValue.set('CustomHealth Metric', mappedMetricValues[0])
mappedMetricWithValue.set('CustomHealth Metric new', mappedMetricValues[1])

export const formikValue: MapCustomHealthToService = {
  metricName: 'CustomHealth Metric',
  metricIdentifier: '',
  groupName: { label: 'Group 1', value: 'Group 1' },
  continuousVerification: true,
  healthScore: true,
  sli: true,
  riskCategory: '',
  serviceInstanceIdentifier: 'serviceInstance',
  lowerBaselineDeviation: false,
  higherBaselineDeviation: false,
  queryType: 'SERVICE_BASED' as any,
  requestMethod: 'GET' as any,
  query: '*',
  baseURL: '',
  pathURL:
    'query?query=kubernetes.cpu.usage.total{*}by{pod_name}.rollup(avg,60)&from=start_time_seconds&to=end_time_seconds&pod_name=harness-datadog-dummy-pipeline-deployment-canary-76586cb6fvjsfp',
  metricValue: '$.series.[*].query_index',
  timestamp: '$.series.[*].length',
  timestampFormat: '',
  serviceInstancePath: '',
  startTime: { placeholder: 'start_time_seconds', timestampFormat: 'SECONDS' as any, customTimestampFormat: '' },
  endTime: { placeholder: 'end_time_seconds', timestampFormat: 'SECONDS' as any, customTimestampFormat: '' },
  ignoreThresholds: [],
  failFastThresholds: []
}

export const recordsData = {
  status: 'SUCCESS',
  data: {
    status: 'ok',
    resp_version: 1,
    series: [
      {
        end: 1645108259000,
        attributes: {},
        metric: 'kubernetes.cpu.usage.total',
        interval: 60,
        tag_set: ['pod_name:qa-target-automation-1-xicobc-0'],
        start: 1645106460000,
        length: 30,
        query_index: 0,
        aggr: null,
        scope: 'pod_name:qa-target-automation-1-xicobc-0',
        pointlist: [
          [1645106460000, 30747548.5],
          [1645106520000, 604424862.5],
          [1645106580000, 65365139],
          [1645106640000, 30227738.25],
          [1645106700000, 615818645],
          [1645106760000, 97485564.5],
          [1645106820000, 32996677],
          [1645106880000, 606363362.5],
          [1645106940000, 93898013],
          [1645107000000, 32993409.5],
          [1645107060000, 586815239],
          [1645107120000, 79365294],
          [1645107180000, 27949067],
          [1645107240000, 666112412.5],
          [1645107300000, 80059776],
          [1645107360000, 27407712.5],
          [1645107420000, 618593223.5],
          [1645107480000, 94986383],
          [1645107540000, 27407679],
          [1645107600000, 595496268],
          [1645107660000, 80597132],
          [1645107720000, 31315295],
          [1645107780000, 613968769.5],
          [1645107840000, 103850589],
          [1645107900000, 21259266.5],
          [1645107960000, 614662304],
          [1645108020000, 95614903.5],
          [1645108080000, 30763894.5],
          [1645108140000, 645740712.25],
          [1645108200000, 125004939.33333333]
        ],
        expression: 'kubernetes.cpu.usage.total{pod_name:qa-target-automation-1-xicobc-0}.rollup(avg, 60)',
        unit: [
          { family: 'cpu', scale_factor: 1e-9, name: 'nanocore', short_name: 'ncores', plural: 'nanocores', id: 121 },
          null
        ],
        display_name: 'kubernetes.cpu.usage.total'
      }
    ],
    to_date: 1645108253000,
    query: 'kubernetes.cpu.usage.total{*}by{pod_name}.rollup(avg,60)',
    message: '',
    res_type: 'time_series',
    times: [],
    from_date: 1645106453000,
    group_by: ['pod_name'],
    values: []
  },
  metaData: null,
  correlationId: 'f591fee5-d771-4581-9711-7223f667a619'
}

export const chartData = {
  correlationId: 'correlationId',
  data: [
    {
      metricName: 'ms 101',
      metricValue: 100,
      timestamp: 0,
      txnName: 'ms101'
    }
  ],
  metaData: {},
  status: 'SUCCESS'
}

export const sourceDataWithValidMetric = {
  connectorRef: 'org.customhsappdtestconnectorforautomation',
  isEdit: true,
  healthSourceList: [
    {
      type: 'CustomHealthMetric',
      identifier: 'tstsss',
      name: 'tstsss',
      spec: {
        connectorRef: 'org.customhsappdtestconnectorforautomation',
        metricDefinitions: [
          {
            identifier: 'CustomHealth_Metric',
            requestDefinition: {
              urlPath:
                'rest/applications/cv-app/metric-data?metric-path=Overall%20Application%20Performance%7C*%7CAverage%20Response%20Time%20%28ms%29&time-range-type=BETWEEN_TIMES&start-time=start_time&end-time=end_time&rollup=false&output=json',
              method: 'GET',
              requestBody: '',
              startTimeInfo: {
                placeholder: 'start_time',
                timestampFormat: 'MILLISECONDS',
                customTimestampFormat: ''
              },
              endTimeInfo: {
                placeholder: 'end_time',
                timestampFormat: 'MILLISECONDS',
                customTimestampFormat: ''
              }
            },
            queryType: 'HOST_BASED',
            metricName: 'CustomHealth Metric',
            groupName: 'G12',
            metricResponseMapping: {
              metricValueJsonPath: '$.[*].metricValues.[*].occurrences',
              timestampJsonPath: '$.[*].metricValues.[*].min',
              timestampFormat: ''
            },
            sli: {
              enabled: false
            },
            analysis: {
              riskProfile: {
                category: 'Performance',
                metricType: 'RESP_TIME',
                thresholdTypes: ['ACT_WHEN_HIGHER']
              },
              liveMonitoring: {
                enabled: false
              },
              deploymentVerification: {
                enabled: true
              }
            }
          }
        ],
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
                    greaterThan: 12
                  }
                },
                metricType: 'Custom',
                metricName: 'CustomHealth Metric'
              },
              {
                type: 'FailImmediately',
                spec: {
                  action: 'FailAfterOccurrence',
                  spec: {
                    count: 12
                  }
                },
                criteria: {
                  type: 'Absolute',
                  spec: {
                    greaterThan: 2
                  }
                },
                metricType: 'Custom',
                metricName: 'CustomHealth Metric'
              }
            ]
          }
        ]
      }
    }
  ],
  serviceRef: 'svctc5',
  environmentRef: 'envtc5',
  monitoredServiceRef: {
    name: 'svctc5_envtc5',
    identifier: 'svctc5_envtc5'
  },
  healthSourceName: 'tstsss',
  healthSourceIdentifier: 'tstsss',
  sourceType: 'CustomHealth',
  product: {
    label: 'Custom Health Metrics',
    value: 'metrics'
  }
}

export const sourceDataWithValidMetricPopupMock = {
  connectorRef: 'org.customhsappdtestconnectorforautomation',
  isEdit: true,
  healthSourceList: [
    {
      type: 'CustomHealthMetric',
      identifier: 'tstsss',
      name: 'tstsss',
      spec: {
        connectorRef: 'org.customhsappdtestconnectorforautomation',
        metricDefinitions: [
          {
            identifier: 'CustomHealth_Metric',
            requestDefinition: {
              urlPath:
                'rest/applications/cv-app/metric-data?metric-path=Overall%20Application%20Performance%7C*%7CAverage%20Response%20Time%20%28ms%29&time-range-type=BETWEEN_TIMES&start-time=start_time&end-time=end_time&rollup=false&output=json',
              method: 'GET',
              requestBody: '',
              startTimeInfo: {
                placeholder: 'start_time',
                timestampFormat: 'MILLISECONDS',
                customTimestampFormat: ''
              },
              endTimeInfo: {
                placeholder: 'end_time',
                timestampFormat: 'MILLISECONDS',
                customTimestampFormat: ''
              }
            },
            queryType: 'HOST_BASED',
            metricName: 'CustomHealth Metric',
            groupName: 'G12',
            metricResponseMapping: {
              metricValueJsonPath: '$.[*].metricValues.[*].occurrences',
              timestampJsonPath: '$.[*].metricValues.[*].min',
              timestampFormat: ''
            },
            sli: {
              enabled: false
            },
            analysis: {
              riskProfile: {
                category: 'Performance',
                metricType: 'RESP_TIME',
                thresholdTypes: ['ACT_WHEN_HIGHER']
              },
              liveMonitoring: {
                enabled: false
              },
              deploymentVerification: {
                enabled: true
              }
            }
          },
          {
            identifier: 'CustomHealth_Metric_2',
            requestDefinition: {
              urlPath:
                'rest/applications/cv-app/metric-data?metric-path=Overall%20Application%20Performance%7C*%7CAverage%20Response%20Time%20%28ms%29&time-range-type=BETWEEN_TIMES&start-time=start_time&end-time=end_time&rollup=false&output=json',
              method: 'GET',
              requestBody: '',
              startTimeInfo: {
                placeholder: 'start_time',
                timestampFormat: 'MILLISECONDS',
                customTimestampFormat: ''
              },
              endTimeInfo: {
                placeholder: 'end_time',
                timestampFormat: 'MILLISECONDS',
                customTimestampFormat: ''
              }
            },
            queryType: 'HOST_BASED',
            metricName: 'CustomHealth Metric 2',
            groupName: 'G12',
            metricResponseMapping: {
              metricValueJsonPath: '$.[*].metricValues.[*].occurrences',
              timestampJsonPath: '$.[*].metricValues.[*].min',
              timestampFormat: ''
            },
            sli: {
              enabled: false
            },
            analysis: {
              riskProfile: {
                category: 'Performance',
                metricType: 'RESP_TIME',
                thresholdTypes: ['ACT_WHEN_HIGHER']
              },
              liveMonitoring: {
                enabled: false
              },
              deploymentVerification: {
                enabled: true
              }
            }
          }
        ],
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
                    greaterThan: 12
                  }
                },
                metricType: 'Custom',
                metricName: 'CustomHealth Metric'
              },
              {
                type: 'FailImmediately',
                spec: {
                  action: 'FailAfterOccurrence',
                  spec: {
                    count: 12
                  }
                },
                criteria: {
                  type: 'Absolute',
                  spec: {
                    greaterThan: 2
                  }
                },
                metricType: 'Custom',
                metricName: 'CustomHealth Metric'
              }
            ]
          }
        ]
      }
    }
  ],
  serviceRef: 'svctc5',
  environmentRef: 'envtc5',
  monitoredServiceRef: {
    name: 'svctc5_envtc5',
    identifier: 'svctc5_envtc5'
  },
  healthSourceName: 'tstsss',
  healthSourceIdentifier: 'tstsss',
  sourceType: 'CustomHealth',
  product: {
    label: 'Custom Health Metrics',
    value: 'metrics'
  }
}
