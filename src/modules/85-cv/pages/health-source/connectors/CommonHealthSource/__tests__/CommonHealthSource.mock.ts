/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { StringKeys } from 'framework/strings'
import { CHART_VISIBILITY_ENUM, ThresholdTypes } from '../CommonHealthSource.constants'
import type { CommonHealthSourceConfigurations } from '../CommonHealthSource.types'

export const expectedHealthSourceData = {
  applicationName: 'PR-git-experiment',
  connectorRef: 'TestAppD',
  identifier: 'AppD_Single',
  isEdit: true,
  queryMetricsMap: new Map(),
  metricPacks: [
    {
      identifier: 'Performance',
      metricThresholds: [
        {
          metricType: 'Performance',
          groupName: undefined,
          metricName: undefined,
          type: ThresholdTypes.IgnoreThreshold,
          spec: {
            action: 'Ignore'
          },
          criteria: {
            type: 'Absolute',
            spec: {
              greaterThan: 0,
              lessThan: 0
            }
          }
        }
      ]
    },
    {
      identifier: 'Errors',
      metricThresholds: [
        {
          metricType: 'Errors',
          groupName: undefined,
          metricName: undefined,
          type: ThresholdTypes.FailImmediately,
          spec: {
            action: 'FailImmediately',
            spec: {}
          },
          criteria: {
            type: 'Absolute',
            spec: {
              greaterThan: 0,
              lessThan: 0
            }
          }
        }
      ]
    }
  ],
  name: 'AppD Single',
  product: {
    label: 'Application Monitoring',
    value: 'Application Monitoring'
  },
  tierName: 'cvng',
  type: 'SumoLogic'
}

export const expectedThresholdsInitialData = {
  appDTier: 'cvng',
  appdApplication: 'PR-git-experiment',
  failFastThresholds: [
    {
      criteria: { spec: { greaterThan: 0, lessThan: 0 }, type: 'Absolute' },
      groupName: undefined,
      metricName: undefined,
      metricType: 'Errors',
      spec: { action: 'FailImmediately', spec: {} },
      type: 'FailImmediately'
    }
  ],
  ignoreThresholds: [
    {
      criteria: { spec: { greaterThan: 0, lessThan: 0 }, type: 'Absolute' },
      groupName: undefined,
      metricName: undefined,
      metricType: 'Performance',
      spec: { action: 'Ignore' },
      type: 'IgnoreThreshold'
    }
  ],
  metricData: { Errors: true, Performance: true },
  metricPacks: [
    {
      identifier: 'Performance',
      metricThresholds: [
        {
          criteria: { spec: { greaterThan: 0, lessThan: 0 }, type: 'Absolute' },
          groupName: undefined,
          metricName: undefined,
          metricType: 'Performance',
          spec: { action: 'Ignore' },
          type: 'IgnoreThreshold'
        }
      ]
    },
    {
      identifier: 'Errors',
      metricThresholds: [
        {
          criteria: { spec: { greaterThan: 0, lessThan: 0 }, type: 'Absolute' },
          groupName: undefined,
          metricName: undefined,
          metricType: 'Errors',
          spec: { action: 'FailImmediately', spec: {} },
          type: 'FailImmediately'
        }
      ]
    }
  ]
}

export const healthSourceMetricValue = {
  basePath: {
    basePathDropdown_0: {
      path: '',
      value: 'Overall Application Performance'
    },
    basePathDropdown_1: {
      path: 'Overall Application Performance',
      value: ''
    }
  },
  continuousVerification: true,
  completeMetricPath: 'Overall Application Performance|cvng|Calls per Minute',
  groupName: {
    label: 'Group 1',
    value: 'Group 1'
  },
  healthScore: true,
  higherBaselineDeviation: true,
  lowerBaselineDeviation: true,
  metricName: 'appdMetric',
  metricIdentifier: 'appdMetric',
  metricPath: {
    metricPathDropdown_0: {
      path: '',
      isMetric: true,
      value: 'Calls per Minute'
    },
    metricPathDropdown_1: {
      isMetric: false,
      path: 'Calls per Minute',
      value: ''
    }
  },
  riskCategory: 'Errors/ERROR',
  serviceInstanceMetricPath: 'Individual Nodes|*|Errors per Minute',
  sli: true
}

export const healthSourceConfig = {
  addQuery: {
    label: 'Metric',
    enableDefaultGroupName: false
  },
  customMetrics: {
    enabled: true,
    queryAndRecords: {
      enabled: true,
      titleStringKey: 'cv.monitoringSources.commonHealthSource.defineQuerySubDescription' as StringKeys
    },
    metricsChart: {
      enabled: true,
      chartVisibilityMode: CHART_VISIBILITY_ENUM.AUTO
    }
  },
  metricPacks: {
    enabled: false
  },
  sideNav: {
    shouldBeAbleToDeleteLastMetric: true
  },
  metricThresholds: {
    enabled: true
  }
}

export const mockedDefineHealthSourcedata = {
  product: {
    value: 'SUMOLOGIC_METRICS',
    label: 'SumoLogic Cloud Metrics'
  },
  riskCategory: 'Errors',
  sourceType: 'SumoLogic',
  healthSourceName: 'Health source 2 ',
  connectorRef: 'account.Sumologic_Metric_Test',
  healthSourceIdentifier: 'Health_source_2',
  lowerBaselineDeviation: true,
  higherBaselineDeviation: false
}

export const mockedSourceData = {
  connectorRef: 'account.Sumologic_Metric_Test',
  isEdit: true,
  healthSourceList: [
    {
      name: 'Health source 2 ',
      identifier: 'Health_source_2',
      type: 'NextGenHealthSource',
      spec: {
        connectorRef: 'account.Sumologic_Metric_Test',
        dataSourceType: 'SUMOLOGIC_METRICS',
        queryDefinitions: [
          {
            identifier: 'M1',
            name: 'M1',
            groupName: 'G1',
            liveMonitoringEnabled: false,
            continuousVerificationEnabled: false,
            sliEnabled: false,
            query: '*',
            metricThresholds: [],
            riskProfile: {
              category: 'Errors',
              metricType: 'INFRA',
              riskCategory: 'Errors',
              thresholdTypes: ['ACT_WHEN_LOWER']
            }
          }
        ]
      }
    },
    {
      name: 'Log',
      identifier: 'Log',
      type: 'NextGenHealthSource',
      spec: {
        connectorRef: 'SumoLogic',
        dataSourceType: 'SUMOLOGIC_LOG',
        queryDefinitions: [
          {
            identifier: 's1_e1/Log',
            name: 'Log 1',
            queryParams: {
              serviceInstanceField: '_sourcehost'
            },
            query: '*',
            metricThresholds: []
          }
        ]
      }
    },
    {
      name: 'H1',
      identifier: 'H1',
      type: 'NextGenHealthSource',
      spec: {
        connectorRef: 'SumoLogic',
        dataSourceType: 'SUMOLOGIC_METRICS',
        queryDefinitions: [
          {
            identifier: 'M3',
            name: 'M3',
            groupName: 'g2',
            liveMonitoringEnabled: false,
            continuousVerificationEnabled: false,
            sliEnabled: false,
            query: 'm3',
            metricThresholds: [],
            riskProfile: {
              category: 'Errors',
              metricType: 'INFRA',
              thresholdTypes: ['ACT_WHEN_LOWER']
            }
          },
          {
            identifier: 'M1',
            name: 'M1',
            groupName: 'g1',
            liveMonitoringEnabled: false,
            continuousVerificationEnabled: false,
            sliEnabled: false,
            query: 'm1',
            metricThresholds: [],
            riskProfile: {
              category: 'Errors',
              metricType: 'INFRA',
              thresholdTypes: ['ACT_WHEN_LOWER']
            }
          },
          {
            identifier: 'M2',
            name: 'M2',
            groupName: 'g1',
            liveMonitoringEnabled: false,
            continuousVerificationEnabled: false,
            sliEnabled: false,
            query: 'm2',
            metricThresholds: [],
            riskProfile: {
              category: 'Errors',
              metricType: 'INFRA',
              thresholdTypes: ['ACT_WHEN_LOWER']
            }
          }
        ]
      }
    },
    {
      name: 'a',
      identifier: 'a',
      type: 'NextGenHealthSource',
      spec: {
        connectorRef: 'account.Sumologic_Metric_Test',
        dataSourceType: 'SUMOLOGIC_METRICS',
        queryDefinitions: [
          {
            identifier: 'M1',
            name: 'M1',
            groupName: 'G1',
            queryParams: {
              serviceInstanceField: '_sourceHost'
            },
            liveMonitoringEnabled: false,
            continuousVerificationEnabled: false,
            sliEnabled: false,
            query: '*',
            metricThresholds: [],
            riskProfile: {
              category: 'Errors',
              metricType: 'INFRA',
              thresholdTypes: ['ACT_WHEN_LOWER']
            }
          }
        ]
      }
    },
    {
      name: 'AA',
      identifier: 'AA',
      type: 'NextGenHealthSource',
      spec: {
        connectorRef: 'SumoLogic',
        dataSourceType: 'SUMOLOGIC_METRICS',
        queryDefinitions: [
          {
            identifier: 'M2',
            name: 'M2',
            groupName: 'g1',
            queryParams: {
              serviceInstanceField: '_sourceHost'
            },
            liveMonitoringEnabled: false,
            continuousVerificationEnabled: false,
            sliEnabled: false,
            query: 'c new',
            metricThresholds: [],
            riskProfile: {
              category: 'Errors',
              metricType: 'INFRA',
              thresholdTypes: ['ACT_WHEN_LOWER']
            }
          },
          {
            identifier: 'M3',
            name: 'M3',
            groupName: 'g1',
            liveMonitoringEnabled: false,
            continuousVerificationEnabled: false,
            sliEnabled: false,
            query: 'a',
            metricThresholds: [],
            riskProfile: {
              category: 'Errors',
              metricType: 'INFRA',
              thresholdTypes: ['ACT_WHEN_LOWER']
            }
          },
          {
            identifier: 'M4',
            name: 'M4',
            groupName: 'g1',
            liveMonitoringEnabled: false,
            continuousVerificationEnabled: false,
            sliEnabled: false,
            query: 'm4',
            metricThresholds: [],
            riskProfile: {
              category: 'Errors',
              metricType: 'INFRA',
              thresholdTypes: ['ACT_WHEN_LOWER']
            }
          }
        ]
      }
    }
  ],
  serviceRef: 's1',
  environmentRef: 'e1',
  monitoredServiceRef: {
    name: 's1_e1',
    identifier: 's1_e1'
  },
  existingMetricDetails: {
    name: 'Health source 2 ',
    identifier: 'Health_source_2',
    type: 'NextGenHealthSource',
    spec: {
      connectorRef: 'account.Sumologic_Metric_Test',
      dataSourceType: 'SUMOLOGIC_METRICS',
      queryDefinitions: [
        {
          identifier: 'M1',
          name: 'M1',
          groupName: 'G1',
          liveMonitoringEnabled: false,
          continuousVerificationEnabled: false,
          sliEnabled: false,
          query: '*',
          metricThresholds: [],
          riskProfile: {
            category: 'Errors',
            metricType: 'INFRA',
            thresholdTypes: ['ACT_WHEN_LOWER']
          }
        }
      ]
    }
  },
  healthSourceName: 'Health source 2 ',
  healthSourceIdentifier: 'Health_source_2',
  sourceType: 'NextGenHealthSource',
  dataSourceType: null,
  product: {
    label: 'SumoLogic Cloud Metrics',
    value: 'SUMOLOGIC_METRICS'
  }
}

export const mockedSourceDataWithMetricThresholds = {
  connectorRef: 'account.Sumologic_Metric_Test',
  isEdit: true,
  healthSourceList: [
    {
      name: 'Health source 2 ',
      identifier: 'Health_source_2',
      type: 'NextGenHealthSource',
      spec: {
        connectorRef: 'account.Sumologic_Metric_Test',
        dataSourceType: 'SUMOLOGIC_METRICS',
        queryDefinitions: [
          {
            identifier: 'M1',
            name: 'M1',
            groupName: 'G1',
            liveMonitoringEnabled: false,
            continuousVerificationEnabled: false,
            queryParams: {
              serviceInstanceField: 'test'
            },
            sliEnabled: false,
            query: '*',
            metricThresholds: [
              {
                criteria: { spec: { greaterThan: 21 }, type: 'Percentage' },
                metricName: 'M1',
                metricType: 'Custom',
                spec: { action: 'Ignore' },
                type: 'IgnoreThreshold'
              },
              {
                criteria: { spec: { greaterThan: 21 }, type: 'Percentage' },
                metricName: 'M1',
                metricType: 'Custom',
                spec: { action: 'FailAfterOccurrence' },
                type: 'FailImmediately'
              }
            ],
            riskProfile: {
              category: 'Errors',
              metricType: 'INFRA',
              riskCategory: 'Errors',
              thresholdTypes: ['ACT_WHEN_LOWER']
            }
          }
        ]
      }
    }
  ],
  serviceRef: 's1',
  environmentRef: 'e1',
  monitoredServiceRef: {
    name: 's1_e1',
    identifier: 's1_e1'
  },
  existingMetricDetails: {
    name: 'Health source 2 ',
    identifier: 'Health_source_2',
    type: 'NextGenHealthSource',
    spec: {
      connectorRef: 'account.Sumologic_Metric_Test',
      dataSourceType: 'SUMOLOGIC_METRICS',
      queryDefinitions: [
        {
          identifier: 'M1',
          name: 'M1',
          groupName: 'G1',
          liveMonitoringEnabled: false,
          continuousVerificationEnabled: false,
          sliEnabled: false,
          query: '*',
          metricThresholds: [
            {
              criteria: { spec: { greaterThan: 21 }, type: 'Percentage' },
              metricName: 'M1',
              metricType: 'Custom',
              spec: { action: 'Ignore' },
              type: 'IgnoreThreshold'
            },
            {
              criteria: { spec: { greaterThan: 21 }, type: 'Percentage' },
              metricName: 'M1',
              metricType: 'Custom',
              spec: { action: 'FailAfterOccurrence' },
              type: 'FailImmediately'
            }
          ],
          riskProfile: {
            category: 'Errors',
            metricType: 'INFRA',
            thresholdTypes: ['ACT_WHEN_LOWER']
          }
        }
      ]
    }
  },
  healthSourceName: 'Health source 2 ',
  healthSourceIdentifier: 'Health_source_2',
  sourceType: 'NextGenHealthSource',
  dataSourceType: null,
  product: {
    label: 'SumoLogic Cloud Metrics',
    value: 'SUMOLOGIC_METRICS'
  }
}

export const metricThresholdDisabledPayloadResult = {
  identifier: 'Health_source_2',
  name: 'Health source 2 ',
  spec: {
    connectorRef: 'account.Sumologic_Metric_Test',
    queryDefinitions: [
      {
        continuousVerificationEnabled: false,
        groupName: 'G1',
        identifier: 'M1',
        liveMonitoringEnabled: false,
        metricThresholds: [],
        name: 'M1',
        query: '*',
        queryParams: {},
        riskProfile: {
          riskCategory: 'Errors',
          thresholdTypes: ['ACT_WHEN_LOWER']
        },
        sliEnabled: false
      }
    ]
  },
  type: 'SUMOLOGIC_METRICS',
  version: 'v2'
}
const queryMetricsMap = new Map()
queryMetricsMap.set('M1', {
  identifier: 'M1',
  metricName: 'metric 1',
  groupName: {
    label: 'G1',
    value: 'G1'
  },
  query: '*',
  riskCategory: 'Errors',
  lowerBaselineDeviation: true,
  higherBaselineDeviation: false
})

export const consfigureHealthSourceDataWithMetricThresholds: CommonHealthSourceConfigurations = {
  queryMetricsMap,
  selectedMetric: 'M1',
  ignoreThresholds: [
    {
      criteria: { spec: { greaterThan: 21 }, type: 'Percentage' },
      metricName: 'metric 1',
      metricType: 'Custom',
      spec: { action: 'Ignore' },
      type: 'IgnoreThreshold'
    }
  ],
  failFastThresholds: [
    {
      criteria: { spec: { greaterThan: 21 }, type: 'Percentage' },
      metricName: 'metric 1',
      metricType: 'Custom',
      spec: { action: 'FailAfterOccurrence' },
      type: 'FailImmediately'
    }
  ]
}

export const payloadMockWithMetricThresholdsMock = {
  identifier: 'Health_source_2',
  name: 'Health source 2 ',
  spec: {
    connectorRef: 'account.Sumologic_Metric_Test',
    queryDefinitions: [
      {
        continuousVerificationEnabled: false,
        groupName: 'G1',
        identifier: 'M1',
        liveMonitoringEnabled: false,
        metricThresholds: [
          {
            criteria: {
              spec: {
                greaterThan: 21
              },
              type: 'Percentage'
            },
            metricName: 'metric 1',
            metricType: 'Custom',
            spec: {
              action: 'Ignore'
            },
            type: 'IgnoreThreshold'
          },
          {
            criteria: {
              spec: {
                greaterThan: 21
              },
              type: 'Percentage'
            },
            metricName: 'metric 1',
            metricType: 'Custom',
            spec: {
              action: 'FailAfterOccurrence'
            },
            type: 'FailImmediately'
          }
        ],
        name: 'metric 1',
        query: '*',
        queryParams: {},
        riskProfile: {
          riskCategory: 'Errors',
          thresholdTypes: ['ACT_WHEN_LOWER']
        },
        sliEnabled: false
      }
    ]
  },
  type: 'SUMOLOGIC_METRICS',
  version: 'v2'
}

export const expectedMetrithresholdsEdit = {
  queryMetricsMap: queryMetricsMap,
  failFastThresholds: [
    {
      criteria: { spec: { greaterThan: 21 }, type: 'Percentage' },
      metricName: 'M1',
      metricType: 'Custom',
      spec: { action: 'FailAfterOccurrence' },
      type: 'FailImmediately'
    }
  ],
  ignoreThresholds: [
    {
      criteria: { spec: { greaterThan: 21 }, type: 'Percentage' },
      metricName: 'M1',
      metricType: 'Custom',
      spec: { action: 'Ignore' },
      type: 'IgnoreThreshold'
    }
  ],
  selectedMetric: 'M1'
}

export const metricThresholdsValidationMock = {
  'failFastThresholds.0.criteria.type': 'pipeline.required',
  'failFastThresholds.0.metricName': 'pipeline.required',
  'failFastThresholds.0.metricType': 'pipeline.required',
  'failFastThresholds.0.spec.spec.count': 'pipeline.required',
  'ignoreThresholds.0.criteria.type': 'pipeline.required',
  'ignoreThresholds.0.metricName': 'pipeline.required',
  'ignoreThresholds.0.metricType': 'pipeline.required'
}
