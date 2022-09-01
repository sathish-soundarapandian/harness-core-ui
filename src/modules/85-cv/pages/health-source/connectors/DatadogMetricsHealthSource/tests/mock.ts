/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { DatadogProduct } from '@cv/pages/health-source/connectors/DatadogMetricsHealthSource/DatadogMetricsHealthSource.utils'
import type { SelectedWidgetMetricData } from '@cv/components/CloudMetricsHealthSource/CloudMetricsHealthSource.type'
import type {
  DatadogMetricInfo,
  DatadogMetricSetupSource
} from '@cv/pages/health-source/connectors/DatadogMetricsHealthSource/DatadogMetricsHealthSource.type'
import { HealthSourceTypes } from '@cv/pages/health-source/types'

export const SourceTabsData = {
  accountId: '1234_accountId',
  projectIdentifier: '1234_projectid',
  orgIdentifier: '1234_orgId',
  identifier: 'datadog_source',
  product: DatadogProduct.CLOUD_METRICS,
  name: 'DatadogSource',
  type: 'DATADOG',
  isEdit: false
}
export const MockSampleData = [
  [
    {
      txnName: 'kubernetes.io/container/cpu/core_usage_time',
      metricName: 'kubernetes.io/container/cpu/core_usage_time',
      metricValue: 12.151677124512961,
      timestamp: 1607599860000
    }
  ]
]

export const mockWidgetSelectedData: SelectedWidgetMetricData = {
  id: 'MOCK_METRIC_ID',
  metricName: 'MOCK_METRIC_NAME',
  query: 'MOCKED_QUERY',
  widgetName: 'MOCK_WIDGET_NAME',
  dashboardTitle: 'MOCK_DASHBOARD_TITLE'
}

export const DatadogMetricsHealthSourceMock = {
  name: 'datadog',
  identifier: 'datadog',
  type: 'DatadogMetrics',
  spec: {
    connectorRef: 'datadogConnector',
    feature: 'Datadog Cloud Metrics',
    metricPacks: [],
    metricDefinitions: [
      {
        identifier: 'mock_identifier',
        aggregation: 'avg',
        dashboardId: 'mock_dashboard_id',
        dashboardName: 'mock_dashboard_name',
        groupingQuery: 'mock_grouping_query',
        isManualQuery: true,
        isCustomCreatedMetric: true,
        metricPath: 'mock_metric_path',
        metric: 'mock_active_metric',
        metricName: 'mock_metric_name',
        metricTags: [],
        query: 'mock_query',
        serviceInstanceIdentifierTag: '',
        sli: { enabled: false },
        analysis: {
          deploymentVerification: {
            enabled: false,
            serviceInstanceFieldName: ''
          },
          liveMonitoring: {
            enabled: false
          },
          riskProfile: {
            category: 'Performance',
            metricType: 'INFRA',
            thresholdTypes: []
          }
        }
      }
    ]
  }
}
export const DatadogMetricsMockHealthSourceData = {
  isEdit: true,
  healthSourceList: [DatadogMetricsHealthSourceMock],
  monitoringSourceName: 'todolist',
  monitoredServiceIdentifier: 'todolist',
  healthSourceName: 'datadog',
  healthSourceIdentifier: 'datadog',
  type: HealthSourceTypes.DatadogMetrics,
  connectorRef: 'datadogConnector',
  product: { label: DatadogProduct.CLOUD_LOGS, value: DatadogProduct.CLOUD_LOGS }
}

const mockMetricDefinitionsMap: Map<string, DatadogMetricInfo> = new Map([
  [
    'mock_metric_path',
    {
      aggregator: 'avg',
      groupName: {
        label: 'mock_dashboard_name',
        value: 'mock_dashboard_name'
      },
      identifier: 'mock_identifier',
      dashboardId: 'mock_dashboard_id',
      groupingQuery: 'mock_grouping_query',
      higherBaselineDeviation: false,
      metricPath: 'mock_metric_path',
      isManualQuery: true,
      isCustomCreatedMetric: true,
      lowerBaselineDeviation: false,
      metric: 'mock_active_metric',
      metricName: 'mock_metric_name',
      metricTags: [],
      query: 'mock_query',
      riskCategory: 'Performance/INFRA',
      serviceInstance: '',
      serviceInstanceIdentifierTag: '',
      continuousVerification: false,
      healthScore: false,
      sli: false,
      ignoreThresholds: [],
      failFastThresholds: []
    }
  ]
])
export const DatadogMetricsSetupSource: DatadogMetricSetupSource = {
  connectorRef: 'datadogConnector',
  healthSourceIdentifier: 'datadog',
  healthSourceName: 'datadog',
  isEdit: true,
  metricDefinition: mockMetricDefinitionsMap,
  product: {
    label: 'Datadog Cloud Logs',
    value: 'Datadog Cloud Logs'
  },
  selectedDashboards: [
    {
      id: 'mock_dashboard_id',
      name: 'mock_dashboard_name'
    }
  ],
  ignoreThresholds: [],
  failFastThresholds: []
}

export const MOCK_CUSTOM_CREATED_METRICS_LIST = ['mock_metric_path']

export const MOCK_SELECTED_DASHBOARDS_WIDGETS = [
  {
    itemId: 'mock_dashboard_id',
    title: 'mock_dashboard_name'
  }
]

export const MOCK_SELECTED_WIDGET_DATA = {
  id: 'mock_metric_path',
  metricName: 'mock_metric_name',
  query: 'mock_query',
  widgetName: 'mock_metric_name',
  dashboardTitle: 'datadog_dashboard',
  dashboardId: 'mock_dashboard_id'
}

export const EXPECTED_DATADOG_METRIC_INFO = {
  aggregator: 'avg',
  groupName: {
    label: 'datadog_dashboard',
    value: 'datadog_dashboard'
  },
  metricPath: 'mock_metric_path',
  dashboardId: 'mock_dashboard_id',
  isNew: true,
  isCustomCreatedMetric: false,
  isManualQuery: false,
  metricName: 'mock_metric_name',
  identifier: 'mock_metric_name',
  metric: 'datadog.agent.running',
  metricTags: [],
  query: 'avg:datadog.agent.running{*} by {host}.rollup(avg, 60)',
  ignoreThresholds: [],
  failFastThresholds: []
}

export const METRIC_VALIDATION_RESULT = { overall: undefined, sli: undefined }

export const mockData = {
  connectorRef: 'datadoglog',
  isEdit: true,
  healthSourceList: [
    {
      type: 'DatadogMetrics',
      identifier: 'datadogmetric',
      name: 'datadog-metric',
      spec: {
        connectorRef: 'org.datadog',
        feature: 'Datadog Cloud Metrics',
        metricDefinitions: [
          {
            identifier: 'CPU_Limit',
            dashboardName: 'g1',
            dashboardId: null,
            metricPath: 'CPU Limit',
            metricName: 'CPU Limit',
            metric: 'kubernetes.cpu.limits',
            metricTags: [],
            isManualQuery: true,
            isCustomCreatedMetric: true,
            serviceInstanceIdentifierTag: 'pod_name',
            groupingQuery: 'kubernetes.cpu.limits{*} by {pod_name}.rollup(avg, 60)',
            query: 'kubernetes.cpu.limits{*}.rollup(avg, 60)',
            sli: {
              enabled: true
            },
            analysis: {
              riskProfile: {
                metricType: 'RESP_TIME',
                category: 'Performance',
                thresholdTypes: ['ACT_WHEN_HIGHER']
              },
              liveMonitoring: {
                enabled: true
              },
              deploymentVerification: {
                enabled: true,
                serviceInstanceFieldName: 'pod_name'
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
                  type: 'Percentage',
                  spec: {
                    greaterThan: 54
                  },
                  criteriaPercentageType: 'greaterThan'
                },
                metricType: 'Custom',
                metricName: 'CPU Limit'
              },
              {
                type: 'IgnoreThreshold',
                spec: {
                  action: 'Ignore'
                },
                criteria: {
                  type: 'Absolute',
                  spec: {
                    greaterThan: 6,
                    lessThan: 77
                  }
                },
                metricType: 'Custom',
                metricName: 'CPU Limit'
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
                  type: 'Percentage',
                  spec: {
                    greaterThan: 33
                  },
                  criteriaPercentageType: 'greaterThan'
                },
                metricType: 'Custom',
                metricName: 'CPU Limit'
              }
            ]
          }
        ]
      }
    },
    {
      type: 'DatadogMetrics',
      identifier: 'asda',
      name: 'asda',
      spec: {
        connectorRef: 'datadoglog',
        feature: 'Datadog Cloud Metrics',
        metricDefinitions: [
          {
            identifier: 'test1',
            dashboardName: 'G2',
            continuousVerification: true,
            metricPath: 'test1',
            metricName: 'test1',
            metric: 'No matching data.',
            metricTags: [],
            aggregation: 'avg',
            isManualQuery: false,
            isCustomCreatedMetric: true,
            serviceInstanceIdentifierTag: '',
            groupingQuery: 'avg:No matching data.{*}.rollup(avg, 60)',
            query: 'avg:No matching data.{*}.rollup(avg, 60)',
            sli: {
              enabled: true
            },
            analysis: {
              riskProfile: {
                category: null,
                thresholdTypes: []
              },
              liveMonitoring: {
                enabled: false
              },
              deploymentVerification: {
                enabled: false,
                serviceInstanceFieldName: ''
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
  ],
  serviceRef: 'datadogmetric',
  environmentRef: 'prod',
  monitoredServiceRef: {
    name: 'datadogmetric_prod',
    identifier: 'datadogmetric_prod'
  },
  existingMetricDetails: {
    name: 'asda',
    identifier: 'asda',
    type: 'DatadogMetrics',
    spec: {
      connectorRef: 'datadoglog',
      feature: 'Datadog Cloud Metrics',
      metricDefinitions: [
        {
          identifier: 'test1',
          metricName: 'test1',
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
              serviceInstanceFieldName: '',
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
          dashboardId: null,
          dashboardName: 'G2',
          metricPath: 'test1',
          query: 'avg:No matching data.{*}.rollup(avg, 60)',
          groupingQuery: 'avg:No matching data.{*}.rollup(avg, 60)',
          continuousVerification: true,
          metric: 'No matching data.',
          aggregation: 'avg',
          serviceInstanceIdentifierTag: '',
          metricTags: null,
          isManualQuery: false,
          isCustomCreatedMetric: true
        }
      ]
    }
  },
  healthSourceName: 'asda',
  healthSourceIdentifier: 'asda',
  sourceType: 'DatadogMetrics',
  product: {
    label: 'Datadog Cloud Metrics',
    value: 'Datadog Cloud Metrics'
  },
  selectedDashboards: [
    {
      name: 'G2'
    }
  ]
}

export const mockDatadogData = {
  connectorRef: 'org.ddtest0706',
  isEdit: true,
  healthSourceList: [
    {
      type: 'DatadogMetrics',
      identifier: 'DD',
      name: 'DD',
      spec: {
        connectorRef: 'org.ddtest0706',
        feature: 'Datadog Cloud Metrics',
        metricDefinitions: [
          {
            identifier: 'test_metric_name',
            dashboardName: 'G1',
            dashboardId: null,
            metricPath: 'test metric name',
            metricName: 'test metric name',
            metric: 'container.cpu.limit',
            aggregation: null,
            isManualQuery: false,
            isCustomCreatedMetric: true,
            serviceInstanceIdentifierTag: 'host',
            groupingQuery: 'container.cpu.limit{*} by {host}.rollup(avg, 60)',
            query: 'container.cpu.limit{*}.rollup(avg, 60)',
            sli: {
              enabled: false
            },
            analysis: {
              riskProfile: {
                metricType: 'ERROR',
                category: 'Performance',
                thresholdTypes: ['ACT_WHEN_HIGHER']
              },
              liveMonitoring: {
                enabled: false
              },
              deploymentVerification: {
                enabled: true,
                serviceInstanceFieldName: 'host'
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
                metricName: 'test metric name'
              },
              {
                criteria: { spec: { greaterThan: 21 }, type: 'Percentage' },
                metricName: 'metric 3',
                metricType: 'Custom',
                spec: { action: 'FailAfterOccurrence' },
                type: 'FailImmediately'
              }
            ]
          }
        ]
      }
    }
  ],
  serviceRef: 'appdtest',
  environmentRef: 'prod',
  monitoredServiceRef: {
    name: 'appdtest_prod',
    identifier: 'appdtest_prod'
  },
  existingMetricDetails: {
    name: 'DD',
    identifier: 'DD',
    type: 'DatadogMetrics',
    spec: {
      connectorRef: 'org.ddtest0706',
      feature: 'Datadog Cloud Metrics',
      metricDefinitions: [
        {
          identifier: 'test_metric_name',
          metricName: 'test metric name',
          riskProfile: {
            category: 'Performance',
            metricType: 'ERROR',
            thresholdTypes: ['ACT_WHEN_HIGHER']
          },
          analysis: {
            liveMonitoring: {
              enabled: false
            },
            deploymentVerification: {
              enabled: true,
              serviceInstanceFieldName: 'host',
              serviceInstanceMetricPath: null
            },
            riskProfile: {
              category: 'Performance',
              metricType: 'ERROR',
              thresholdTypes: ['ACT_WHEN_HIGHER']
            }
          },
          sli: {
            enabled: false
          },
          dashboardId: null,
          dashboardName: 'G1',
          metricPath: 'test metric name',
          query: 'container.cpu.limit{*}.rollup(avg, 60)',
          groupingQuery: 'container.cpu.limit{*} by {host}.rollup(avg, 60)',
          metric: 'container.cpu.limit',
          aggregation: null,
          serviceInstanceIdentifierTag: 'host',
          metricTags: null,
          isManualQuery: false,
          isCustomCreatedMetric: true
        }
      ]
    }
  },
  healthSourceName: 'DD',
  healthSourceIdentifier: 'DD',
  sourceType: 'DatadogMetrics',
  product: {
    label: 'Datadog Cloud Metrics',
    value: 'Datadog Cloud Metrics'
  },
  selectedDashboards: [
    {
      name: 'G1',
      id: null
    }
  ]
}
