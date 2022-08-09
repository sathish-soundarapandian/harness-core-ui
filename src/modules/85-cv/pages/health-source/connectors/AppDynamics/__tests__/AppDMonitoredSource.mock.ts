/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { HealthSourceTypes } from '@cv/pages/health-source/types'
import { ThresholdTypes } from '../AppDHealthSource.constants'
import type { AppDynamicsFomikFormInterface } from '../AppDHealthSource.types'

export const sourceData = {
  isEdit: true,
  healthSourceList: [
    {
      name: 'AppD Single',
      identifier: 'AppD_Single',
      type: 'AppDynamics',
      spec: {
        connectorRef: 'TestAppD',
        feature: 'Application Monitoring',
        applicationName: 'PR-git-experiment',
        tierName: 'cvng',
        metricPacks: [{ identifier: 'Performance' }, { identifier: 'Errors' }],
        metricDefinitions: [
          {
            identifier: 'appdMetric',
            metricName: 'appdMetric',
            riskProfile: {
              category: 'Errors',
              metricType: 'ERROR',
              thresholdTypes: ['ACT_WHEN_LOWER', 'ACT_WHEN_HIGHER']
            },
            analysis: {
              liveMonitoring: { enabled: true },
              deploymentVerification: {
                enabled: true,
                serviceInstanceFieldName: null,
                serviceInstanceMetricPath: 'Individual Nodes|*|Errors per Minute'
              },
              riskProfile: {
                category: 'Errors',
                metricType: 'ERROR',
                thresholdTypes: ['ACT_WHEN_LOWER', 'ACT_WHEN_HIGHER']
              }
            },
            sli: { enabled: true },
            groupName: 'Group 1',
            baseFolder: 'Overall Application Performance',
            metricPath: 'Calls per Minute',
            appDApplication: 'PR-git-experiment',
            appDTier: 'cvng',
            lowerBaselineDeviation: true,
            metricPacks: [{ identifier: 'Performance' }, { identifier: 'Errors' }]
          }
        ]
      }
    },
    {
      name: 'AppD Multiple',
      identifier: 'AppD_Multiple',
      type: 'AppDynamics',
      spec: {
        applicationName: 'PR-git-experiment',
        tierName: 'cvng',
        metricDefinitions: [
          {
            metricName: 'appdMetric Two',
            baseFolder: 'Overall Application Performance',
            metricPath: 'Number of Very Slow Calls',
            groupName: 'Group 2',
            sli: { enabled: false },
            analysis: {
              riskProfile: { category: 'Performance', metricType: 'RESP_TIME', thresholdTypes: ['ACT_WHEN_HIGHER'] },
              liveMonitoring: { enabled: true },
              deploymentVerification: { enabled: false, serviceInstanceMetricPath: '' }
            }
          },
          {
            metricName: 'appdMetric One',
            baseFolder: 'Overall Application Performance',
            metricPath: 'Calls per Minute',
            groupName: 'Group 1',
            sli: { enabled: false },
            lowerBaselineDeviation: true,
            analysis: {
              riskProfile: {
                category: 'Performance',
                metricType: 'ERROR',
                thresholdTypes: ['ACT_WHEN_LOWER', 'ACT_WHEN_HIGHER']
              },
              liveMonitoring: { enabled: false },
              deploymentVerification: { enabled: true, serviceInstanceMetricPath: '' }
            }
          },
          {
            metricName: 'appdMetric zgzbjkb7xfj',
            baseFolder: 'Overall Application Performance',
            metricPath: 'Stall Count',
            groupName: 'Group 2',
            sli: { enabled: true },
            analysis: {
              riskProfile: {
                category: 'Performance',
                metricType: 'THROUGHPUT',
                thresholdTypes: ['ACT_WHEN_LOWER', 'ACT_WHEN_HIGHER']
              },
              liveMonitoring: { enabled: true },
              deploymentVerification: { enabled: true, serviceInstanceMetricPath: '' }
            },
            lowerBaselineDeviation: true
          }
        ],
        feature: 'Application Monitoring',
        connectorRef: 'TestAppD',
        metricPacks: [{ identifier: 'Performance' }, { identifier: 'Errors' }]
      }
    }
  ],
  serviceRef: 'test112',
  environmentRef: 'TestEnv',
  monitoredServiceRef: { name: 'test112_TestEnv', identifier: 'test112_TestEnv' },
  healthSourceName: 'AppD Single',
  healthSourceIdentifier: 'AppD_Single',
  sourceType: 'AppDynamics',
  connectorRef: 'TestAppD',
  product: { label: 'Application Monitoring', value: 'Application Monitoring' }
}

export const templateSourceDataWithCustomMetric = {
  connectorRef: '<+input>',
  isEdit: true,
  healthSourceList: [
    {
      name: 'appd',
      identifier: 'appd',
      type: 'AppDynamics',
      spec: {
        applicationName: '<+input>',
        tierName: '<+input>',
        metricData: { Errors: true, Performance: true },
        metricDefinitions: [
          {
            identifier: 'appdMetric1',
            metricName: 'appdMetric1',
            baseFolder: '',
            metricPath: '',
            completeMetricPath: '<+input>',
            groupName: 'g1',
            sli: { enabled: true },
            analysis: {
              riskProfile: {
                category: 'Performance',
                metricType: 'THROUGHPUT',
                thresholdTypes: ['ACT_WHEN_HIGHER']
              },
              liveMonitoring: { enabled: true },
              deploymentVerification: {
                enabled: true,
                serviceInstanceMetricPath: '<+input>'
              }
            }
          }
        ],
        feature: 'Application Monitoring',
        connectorRef: '<+input>',
        metricPacks: [{ identifier: 'Errors' }, { identifier: 'Performance' }]
      }
    }
  ],
  serviceRef: '<+input>',
  environmentRef: 'prod',
  monitoredServiceRef: { name: 'MS-appd2', identifier: 'MSappd2' },
  existingMetricDetails: {
    name: 'appd',
    identifier: 'appd',
    type: 'AppDynamics',
    spec: {
      applicationName: '<+input>',
      tierName: '<+input>',
      metricData: { Errors: true, Performance: true },
      metricDefinitions: [
        {
          identifier: 'appdMetric1',
          metricName: 'appdMetric1',
          baseFolder: '',
          metricPath: '',
          completeMetricPath: '<+input>',
          groupName: 'g1',
          sli: { enabled: true },
          analysis: {
            riskProfile: {
              category: 'Performance',
              metricType: 'THROUGHPUT',
              thresholdTypes: ['ACT_WHEN_HIGHER']
            },
            liveMonitoring: { enabled: true },
            deploymentVerification: {
              enabled: true,
              serviceInstanceMetricPath: '<+input>'
            }
          }
        }
      ],
      feature: 'Application Monitoring',
      connectorRef: '<+input>',
      metricPacks: [{ identifier: 'Errors' }, { identifier: 'Performance' }]
    }
  },
  healthSourceName: 'appd',
  healthSourceIdentifier: 'appd',
  sourceType: 'AppDynamics',
  product: {
    label: 'Application Monitoring',
    value: 'Application Monitoring'
  }
}

export const templateSourceData = {
  connectorRef: '<+input>',
  isEdit: true,
  healthSourceList: [
    {
      name: 'appd',
      identifier: 'appd',
      type: 'AppDynamics',
      spec: {
        applicationName: '<+input>',
        tierName: '<+input>',
        metricData: { Errors: true, Performance: true },
        metricDefinitions: [],
        feature: 'Application Monitoring',
        connectorRef: '<+input>',
        metricPacks: [{ identifier: 'Errors' }, { identifier: 'Performance' }]
      }
    }
  ],
  serviceRef: '<+input>',
  environmentRef: '<+input>',
  monitoredServiceRef: { name: 'MS-appd', identifier: 'MSappd' },
  existingMetricDetails: {
    name: 'appd',
    identifier: 'appd',
    type: 'AppDynamics',
    spec: {
      applicationName: '<+input>',
      tierName: '<+input>',
      metricData: { Errors: true, Performance: true },
      metricDefinitions: [],
      feature: 'Application Monitoring',
      connectorRef: '<+input>',
      metricPacks: [{ identifier: 'Errors' }, { identifier: 'Performance' }]
    }
  },
  healthSourceName: 'appd',
  healthSourceIdentifier: 'appd',
  sourceType: 'AppDynamics',
  product: { label: 'Application Monitoring', value: 'Application Monitoring' }
}
// {
//   name: 'appd',
//   identifier: 'appd',
//   connectorRef: '<+input>',
//   isEdit: true,
//   product: { label: 'Application Monitoring', value: 'Application Monitoring' },
//   type: 'AppDynamics',
//   applicationName: '<+input>',
//   tierName: '<+input>',
//   metricPacks: [{ identifier: 'Errors' }, { identifier: 'Performance' }],
//   mappedServicesAndEnvs: {}
// }

export const applicationName = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 15,
    pageItemCount: 15,
    pageSize: 10000,
    content: [
      {
        name: 'Harness-CI-Manager',
        id: 708406
      },
      {
        name: 'Harness-Dev',
        id: 708417
      },
      {
        name: 'cv-app',
        id: 7596
      },
      {
        name: 'cv-app-ng',
        id: 343254
      }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: null,
  correlationId: 'b23ba1a0-90ba-44b1-9ab0-ac4a193c5809'
}

export const metricPack = {
  metaData: {},
  resource: [
    {
      uuid: 'S2vfVwx8TSCkcxjSXLZupg',
      accountId: 'kmpySmUISimoRrJL6NL73w',
      orgIdentifier: 'default',
      projectIdentifier: 'Demo',
      dataSourceType: 'APP_DYNAMICS',
      identifier: 'Errors',
      category: 'Errors',
      metrics: [
        {
          name: 'Number of Errors',
          metricIdentifier: 'Number of Errors',
          type: 'ERROR',
          path: 'Errors|__tier_name__|__metric_filter__|Number of Errors',
          validationPath: 'Overall Application Performance|__tier_name__|Exceptions per Minute',
          responseJsonPath: null,
          validationResponseJsonPath: null,
          thresholds: [],
          included: true
        }
      ],
      thresholds: null
    },
    {
      uuid: 'mvMy4bRuQ-uBju4hH2WKxw',
      accountId: 'kmpySmUISimoRrJL6NL73w',
      orgIdentifier: 'default',
      projectIdentifier: 'Demo',
      dataSourceType: 'APP_DYNAMICS',
      identifier: 'Performance',
      category: 'Performance',
      metrics: [
        {
          name: 'Average Wait Time (ms)',
          metricIdentifier: 'Average Wait Time (ms)',
          type: 'RESP_TIME',
          path: 'Business Transaction Performance|Business Transactions|__tier_name__|__metric_filter__|Average Wait Time (ms)',
          validationPath: null,
          responseJsonPath: null,
          validationResponseJsonPath: null,
          thresholds: [],
          included: false
        },
        {
          name: 'Calls per Minute',
          metricIdentifier: 'test 1',
          type: 'THROUGHPUT',
          path: 'Business Transaction Performance|Business Transactions|__tier_name__|__metric_filter__|Calls per Minute',
          validationPath: 'Overall Application Performance|__tier_name__|Calls per Minute',
          responseJsonPath: null,
          validationResponseJsonPath: null,
          thresholds: [],
          included: true
        },
        {
          name: 'Stall Count',
          metricIdentifier: 'test 1',
          type: 'ERROR',
          path: 'Business Transaction Performance|Business Transactions|__tier_name__|__metric_filter__|Stall Count',
          validationPath: 'Overall Application Performance|__tier_name__|Stall Count',
          responseJsonPath: null,
          validationResponseJsonPath: null,
          thresholds: [],
          included: true
        },
        {
          name: 'Number of Slow Calls',
          metricIdentifier: 'test 1',
          type: 'ERROR',
          path: 'Business Transaction Performance|Business Transactions|__tier_name__|__metric_filter__|Number of Slow Calls',
          validationPath: 'Overall Application Performance|__tier_name__|Number of Slow Calls',
          responseJsonPath: null,
          validationResponseJsonPath: null,
          thresholds: [],
          included: false
        },
        {
          name: '95th Percentile Response Time (ms)',
          metricIdentifier: 'test 1',
          type: 'RESP_TIME',
          path: 'Business Transaction Performance|Business Transactions|__tier_name__|__metric_filter__|95th Percentile Response Time (ms)',
          validationPath: null,
          responseJsonPath: null,
          validationResponseJsonPath: null,
          thresholds: [],
          included: false
        },
        {
          name: 'Normal Average Response Time (ms)',
          metricIdentifier: 'test 1',
          type: 'RESP_TIME',
          path: 'Business Transaction Performance|Business Transactions|__tier_name__|__metric_filter__|Normal Average Response Time (ms)',
          validationPath: 'Overall Application Performance|__tier_name__|Normal Average Response Time (ms)',
          responseJsonPath: null,
          validationResponseJsonPath: null,
          thresholds: [],
          included: false
        },
        {
          name: 'Errors per Minute',
          metricIdentifier: 'test 1',
          type: 'ERROR',
          path: 'Business Transaction Performance|Business Transactions|__tier_name__|__metric_filter__|Errors per Minute',
          validationPath: 'Overall Application Performance|__tier_name__|Errors per Minute',
          responseJsonPath: null,
          validationResponseJsonPath: null,
          thresholds: [],
          included: true
        },
        {
          name: 'Average Response Time (ms)',
          metricIdentifier: 'test 1',
          type: 'RESP_TIME',
          path: 'Business Transaction Performance|Business Transactions|__tier_name__|__metric_filter__|Average Response Time (ms)',
          validationPath: 'Overall Application Performance|__tier_name__|Average Response Time (ms)',
          responseJsonPath: null,
          validationResponseJsonPath: null,
          thresholds: [],
          included: true
        },
        {
          name: 'Average Block Time (ms)',
          metricIdentifier: 'test 1',
          type: 'RESP_TIME',
          path: 'Business Transaction Performance|Business Transactions|__tier_name__|__metric_filter__|Average Block Time (ms)',
          validationPath: null,
          responseJsonPath: null,
          validationResponseJsonPath: null,
          thresholds: [],
          included: false
        },
        {
          name: 'Average CPU Used (ms)',
          metricIdentifier: 'test 1',
          type: 'INFRA',
          path: 'Business Transaction Performance|Business Transactions|__tier_name__|__metric_filter__|Average CPU Used (ms)',
          validationPath: null,
          responseJsonPath: null,
          validationResponseJsonPath: null,
          thresholds: [],
          included: false
        },
        {
          name: 'Number of Very Slow Calls',
          metricIdentifier: 'test 1',
          type: 'ERROR',
          path: 'Business Transaction Performance|Business Transactions|__tier_name__|__metric_filter__|Number of Very Slow Calls',
          validationPath: 'Overall Application Performance|__tier_name__|Number of Very Slow Calls',
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

export const appTier = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 1,
    pageItemCount: 1,
    pageSize: 10000,
    content: [
      {
        id: 1192087,
        name: 'manager'
      }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: null,
  correlationId: '7c9c29a7-5bd4-4df4-86d0-2a0bc94249fe'
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

export const mappedServicesAndEnvs = new Map()

export const appDMetricValue = {
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
  serviceInstance: null,
  serviceInstanceMetricPath: 'Individual Nodes|*|Errors per Minute',
  sli: true
}

mappedServicesAndEnvs.set('appdMetric', appDMetricValue)

export const expectedAppDynamicData = {
  applicationName: 'PR-git-experiment',
  connectorRef: 'TestAppD',
  identifier: 'AppD_Single',
  isEdit: true,
  mappedServicesAndEnvs,
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
  type: 'AppDynamics'
}
export const expectedAppDynamicDataForContainer = {
  applicationName: 'PR-git-experiment',
  connectorRef: 'TestAppD',
  identifier: 'AppD_Single',
  isEdit: true,
  mappedServicesAndEnvs,
  metricPacks: [
    {
      identifier: 'Performance'
    },
    {
      identifier: 'Errors'
    }
  ],
  name: 'AppD Single',
  product: {
    label: 'Application Monitoring',
    value: 'Application Monitoring'
  },
  tierName: 'cvng',
  type: 'AppDynamics'
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

export const onPreviousPayload = {
  connectorRef: 'TestAppD',
  environmentRef: 'TestEnv',
  healthSourceIdentifier: 'AppD_Single',
  healthSourceList: [
    {
      identifier: 'AppD_Single',
      name: 'AppD Single',
      spec: {
        applicationName: 'PR-git-experiment',
        connectorRef: 'TestAppD',
        feature: 'Application Monitoring',
        metricDefinitions: [
          {
            analysis: {
              deploymentVerification: {
                enabled: true,
                serviceInstanceFieldName: null,
                serviceInstanceMetricPath: 'Individual Nodes|*|Errors per Minute'
              },
              liveMonitoring: { enabled: true },
              riskProfile: {
                category: 'Errors',
                metricType: 'ERROR',
                thresholdTypes: ['ACT_WHEN_LOWER', 'ACT_WHEN_HIGHER']
              }
            },
            appDApplication: 'PR-git-experiment',
            appDTier: 'cvng',
            baseFolder: 'Overall Application Performance',
            groupName: 'Group 1',
            identifier: 'appdMetric',
            lowerBaselineDeviation: true,
            metricName: 'appdMetric',
            metricPacks: [{ identifier: 'Performance' }, { identifier: 'Errors' }],
            metricPath: 'Calls per Minute',
            riskProfile: {
              category: 'Errors',
              metricType: 'ERROR',
              thresholdTypes: ['ACT_WHEN_LOWER', 'ACT_WHEN_HIGHER']
            },
            sli: { enabled: true }
          }
        ],
        metricPacks: [{ identifier: 'Performance' }, { identifier: 'Errors' }],
        tierName: 'cvng'
      },
      type: 'AppDynamics'
    },
    {
      identifier: 'AppD_Multiple',
      name: 'AppD Multiple',
      spec: {
        applicationName: 'PR-git-experiment',
        connectorRef: 'TestAppD',
        feature: 'Application Monitoring',
        metricDefinitions: [
          {
            analysis: {
              deploymentVerification: { enabled: false, serviceInstanceMetricPath: '' },
              liveMonitoring: { enabled: true },
              riskProfile: { category: 'Performance', metricType: 'RESP_TIME', thresholdTypes: ['ACT_WHEN_HIGHER'] }
            },
            baseFolder: 'Overall Application Performance',
            groupName: 'Group 2',
            metricName: 'appdMetric Two',
            metricPath: 'Number of Very Slow Calls',
            sli: { enabled: false }
          },
          {
            analysis: {
              deploymentVerification: { enabled: true, serviceInstanceMetricPath: '' },
              liveMonitoring: { enabled: false },
              riskProfile: {
                category: 'Performance',
                metricType: 'ERROR',
                thresholdTypes: ['ACT_WHEN_LOWER', 'ACT_WHEN_HIGHER']
              }
            },
            baseFolder: 'Overall Application Performance',
            groupName: 'Group 1',
            lowerBaselineDeviation: true,
            metricName: 'appdMetric One',
            metricPath: 'Calls per Minute',
            sli: { enabled: false }
          },
          {
            analysis: {
              deploymentVerification: { enabled: true, serviceInstanceMetricPath: '' },
              liveMonitoring: { enabled: true },
              riskProfile: {
                category: 'Performance',
                metricType: 'THROUGHPUT',
                thresholdTypes: ['ACT_WHEN_LOWER', 'ACT_WHEN_HIGHER']
              }
            },
            baseFolder: 'Overall Application Performance',
            groupName: 'Group 2',
            lowerBaselineDeviation: true,
            metricName: 'appdMetric zgzbjkb7xfj',
            metricPath: 'Stall Count',
            sli: { enabled: true }
          }
        ],
        metricPacks: [{ identifier: 'Performance' }, { identifier: 'Errors' }],
        tierName: 'cvng'
      },
      type: 'AppDynamics'
    }
  ],
  healthSourceName: 'AppD Single',
  isEdit: true,
  monitoredServiceRef: { identifier: 'test112_TestEnv', name: 'test112_TestEnv' },
  product: { label: 'Application Monitoring', value: 'Application Monitoring' },
  serviceRef: 'test112',
  sourceType: 'AppDynamics'
}

export const onPreviousPayloadTemplate = {
  connectorRef: '<+input>',
  environmentRef: '<+input>',
  existingMetricDetails: {
    identifier: 'appd',
    name: 'appd',
    spec: {
      applicationName: '<+input>',
      connectorRef: '<+input>',
      feature: 'Application Monitoring',
      metricData: { Errors: true, Performance: true },
      metricDefinitions: [],
      metricPacks: [{ identifier: 'Errors' }, { identifier: 'Performance' }],
      tierName: '<+input>'
    },
    type: 'AppDynamics'
  },
  healthSourceIdentifier: 'appd',
  healthSourceList: [
    {
      identifier: 'appd',
      name: 'appd',
      spec: {
        applicationName: '<+input>',
        connectorRef: '<+input>',
        feature: 'Application Monitoring',
        metricData: { Errors: true, Performance: true },
        metricDefinitions: [],
        metricPacks: [{ identifier: 'Errors' }, { identifier: 'Performance' }],
        tierName: '<+input>'
      },
      type: 'AppDynamics'
    }
  ],
  healthSourceName: 'appd',
  isEdit: true,
  monitoredServiceRef: { identifier: 'MSappd', name: 'MS-appd' },
  product: { label: 'Application Monitoring', value: 'Application Monitoring' },
  serviceRef: '<+input>',
  sourceType: 'AppDynamics'
}

export const validateMappingNoError: AppDynamicsFomikFormInterface = {
  name: 'AppD Single Metric',
  identifier: 'AppD_Multiple_Metric',
  metricIdentifier: 'AppD_Multiple_Metric',
  connectorRef: { connector: { identifier: 'testID' } },
  isEdit: true,
  product: 'test',
  type: HealthSourceTypes.AppDynamics,
  mappedServicesAndEnvs: new Map(),
  appdApplication: 'PR-git-experiment',
  appDTier: 'cvng',
  metricPacks: [{ identifier: 'Performance' }, { identifier: 'Errors' }],
  metricData: { Performance: true, Errors: true },
  metricPath: {
    metricPathDropdown_0: { path: '', value: 'JVM', isMetric: true },
    metricPathDropdown_1: { path: 'JVM', value: '', isMetric: false }
  },
  basePath: {
    basePathDropdown_0: { path: '', value: 'Application Infrastructure Performance' },
    basePathDropdown_1: { path: 'Application Infrastructure Performance', value: '' }
  },
  metricName: 'appdMetric Two',
  riskCategory: 'Errors/ERROR',
  lowerBaselineDeviation: true,
  higherBaselineDeviation: false,
  groupName: { label: 'Two', value: 'Two' },
  continuousVerification: false,
  healthScore: true,
  sli: false,
  showCustomMetric: true,
  ignoreThresholds: [],
  failFastThresholds: []
}

export const validateMappingWithMetricPathError: AppDynamicsFomikFormInterface = {
  name: 'AppD Single Metric',
  identifier: 'AppD_Multiple_Metric',
  metricIdentifier: 'AppD_Multiple_Metric',
  connectorRef: { connector: { identifier: 'testID' } },
  isEdit: true,
  product: 'test',
  type: HealthSourceTypes.AppDynamics,
  mappedServicesAndEnvs: new Map(),
  appdApplication: 'PR-git-experiment',
  appDTier: 'cvng',
  metricPacks: [{ identifier: 'Performance' }, { identifier: 'Errors' }],
  metricData: { Performance: true, Errors: true },
  metricPath: {
    metricPathDropdown_0: { path: '', value: 'JVM', isMetric: false },
    metricPathDropdown_1: { path: 'JVM', value: '', isMetric: false }
  },
  basePath: {
    basePathDropdown_0: { path: '', value: 'Application Infrastructure Performance' },
    basePathDropdown_1: { path: 'Application Infrastructure Performance', value: '' }
  },
  metricName: 'appdMetric Two',
  riskCategory: 'Errors/ERROR',
  lowerBaselineDeviation: true,
  higherBaselineDeviation: false,
  groupName: { label: 'Two', value: 'Two' },
  continuousVerification: false,
  healthScore: true,
  sli: false,
  showCustomMetric: true,
  pathType: 'dropdownPath',
  ignoreThresholds: [],
  failFastThresholds: []
}

export const validateMappingWithErrors: AppDynamicsFomikFormInterface = {
  name: 'AppD Single Metric',
  identifier: 'AppD_Multiple_Metric',
  connectorRef: { connector: { identifier: 'testID' } },
  isEdit: true,
  product: 'test',
  type: HealthSourceTypes.AppDynamics,
  mappedServicesAndEnvs: new Map(),
  appdApplication: '',
  appDTier: '',
  metricPacks: [],
  metricData: { Performance: true, Errors: true },
  metricPath: {},
  basePath: {},
  metricName: '',
  riskCategory: '',
  lowerBaselineDeviation: false,
  higherBaselineDeviation: false,
  groupName: { label: 'Two', value: 'Two' },
  continuousVerification: true,
  healthScore: true,
  sli: false,
  showCustomMetric: true,
  pathType: 'dropdownPath',
  ignoreThresholds: [],
  failFastThresholds: []
}

export const createAppDynamicsDataValue = {
  isEdit: true,
  healthSourceList: [
    {
      name: 'AppD Single Metric',
      identifier: 'AppD_Multiple_Metric',
      type: 'AppDynamics',
      spec: {
        connectorRef: 'account.appdtest',
        feature: 'Application Monitoring',
        applicationName: 'PR-git-experiment',
        tierName: 'cvng',
        metricPacks: [{ identifier: 'Performance' }, { identifier: 'Errors' }],
        metricDefinitions: [
          {
            identifier: 'appdMetricTwo',
            metricName: 'appdMetric Two',
            riskProfile: { category: 'Errors', metricType: 'ERROR', thresholdTypes: [] },
            analysis: {
              liveMonitoring: { enabled: true },
              deploymentVerification: { enabled: false, serviceInstanceFieldName: null, serviceInstanceMetricPath: '' },
              riskProfile: { category: 'Errors', metricType: 'ERROR', thresholdTypes: [] }
            },
            sli: { enabled: false },
            groupName: 'Two',
            baseFolder: 'Application Infrastructure Performance',
            metricPath: 'JVM'
          },
          {
            identifier: 'appdMetricOneUpdated',
            metricName: 'appdMetric One Updated',
            riskProfile: { category: 'Errors', metricType: 'INFRA', thresholdTypes: [] },
            analysis: {
              liveMonitoring: { enabled: false },
              deploymentVerification: { enabled: true, serviceInstanceFieldName: null, serviceInstanceMetricPath: '' },
              riskProfile: { category: 'Errors', metricType: 'INFRA', thresholdTypes: [] }
            },
            sli: { enabled: false },
            groupName: 'One',
            baseFolder: 'Overall Application Performance',
            metricPath: 'Calls per Minute'
          }
        ]
      }
    }
  ],
  serviceRef: 'service15',
  environmentRef: 'env11',
  monitoredServiceRef: { name: 'service15_env11', identifier: 'service15_env11' },
  healthSourceName: 'AppD Single Metric',
  healthSourceIdentifier: 'AppD_Multiple_Metric',
  sourceType: 'AppDynamics',
  connectorRef: 'account.appdtest',
  product: { label: 'Application Monitoring', value: 'Application Monitoring' }
}

const newMappedServicesAndEnvs = new Map()
newMappedServicesAndEnvs.set('appdMetric Two', {
  name: 'AppD Single Metric',
  identifier: 'AppD_Multiple_Metric',
  connectorRef: 'account.appdtest',
  isEdit: true,
  product: { label: 'Application Monitoring', value: 'Application Monitoring' },
  type: 'AppDynamics',
  mappedServicesAndEnvs: {},
  metricPacks: [{ identifier: 'Performance' }, { identifier: 'Errors' }],
  metricPath: { metricPathDropdown_0: { path: '', value: 'JVM' }, metricPathDropdown_1: { path: 'JVM', value: '' } },
  basePath: {
    basePathDropdown_0: { path: '', value: 'Application Infrastructure Performance' },
    basePathDropdown_1: { path: 'Application Infrastructure Performance', value: '' }
  },
  metricName: 'appdMetric Two',
  riskCategory: 'Errors/ERROR',
  lowerBaselineDeviation: false,
  higherBaselineDeviation: false,
  groupName: { label: 'Two', value: 'Two' },
  continuousVerification: false,
  healthScore: true,
  sli: true,
  showCustomMetric: true
})
newMappedServicesAndEnvs.set('appdMetric One Updated', {
  name: 'AppD Single Metric',
  identifier: 'AppD_Multiple_Metric',
  connectorRef: 'account.appdtest',
  isEdit: true,
  product: { label: 'Application Monitoring', value: 'Application Monitoring' },
  type: 'AppDynamics',
  mappedServicesAndEnvs: {},
  appdApplication: 'PR-git-experiment',
  appDTier: 'cvng',
  metricPacks: [{ identifier: 'Performance' }, { identifier: 'Errors' }],
  metricData: { Performance: true, Errors: true },
  metricPath: {
    metricPathDropdown_0: { path: '', value: 'Calls per Minute', isMetric: true },
    metricPathDropdown_1: { path: 'Calls per Minute', value: '', isMetric: false }
  },
  basePath: {
    basePathDropdown_0: { path: '', value: 'Overall Application Performance' },
    basePathDropdown_1: { path: 'Overall Application Performance', value: '' }
  },
  metricName: 'appdMetric One Updated',
  riskCategory: 'Errors/INFRA',
  lowerBaselineDeviation: true,
  higherBaselineDeviation: false,
  groupName: { label: 'One', value: 'One' },
  continuousVerification: true,
  healthScore: false,
  sli: false,
  showCustomMetric: true
})

export const ignoreThresholdsMockData = [
  {
    metricType: 'Performance',
    groupName: 'testP2',
    metricName: 'average_wait_time_ms',
    type: 'IgnoreThreshold',
    spec: {
      action: 'Ignore'
    },
    criteria: {
      type: 'Percentage',
      spec: {
        lessThan: 1
      },
      criteriaPercentageType: 'lessThan'
    }
  },
  {
    metricType: 'Performance',
    groupName: 'testP',
    metricName: 'stall_count',
    type: 'IgnoreThreshold',
    spec: {
      action: 'Ignore'
    },
    criteria: {
      type: 'Percentage',
      spec: {
        greaterThan: 12
      },
      criteriaPercentageType: 'greaterThan'
    }
  },
  {
    metricType: 'Custom',
    groupName: 'testP',
    metricName: 'stall_count',
    type: 'IgnoreThreshold',
    spec: {
      action: 'Ignore'
    },
    criteria: {
      type: 'Percentage',
      spec: {
        greaterThan: 12
      },
      criteriaPercentageType: 'greaterThan'
    }
  },
  {
    metricType: 'Errors',
    groupName: 'testE',
    metricName: 'number_of_errors',
    type: 'IgnoreThreshold',
    spec: {
      action: 'Ignore'
    },
    criteria: {
      type: 'Absolute',
      spec: {
        greaterThan: 13,
        lessThan: 2
      }
    }
  }
]

export const failFastThresholdsMockData = [
  {
    metricType: 'Performance',
    groupName: 'testPE',
    metricName: 'average_response_time_ms',
    type: 'FailImmediately',
    spec: {
      action: 'FailAfterOccurrence',
      spec: {
        count: 2
      }
    },
    criteria: {
      type: 'Percentage',
      spec: {
        greaterThan: 22
      },
      criteriaPercentageType: 'greaterThan'
    }
  },
  {
    metricType: 'Errors',
    groupName: 'testFE',
    metricName: 'number_of_errors',
    type: 'FailImmediately',
    spec: {
      action: 'FailImmediately',
      spec: {}
    },
    criteria: {
      type: 'Absolute',
      spec: {
        greaterThan: 12,
        lessThan: 1
      }
    }
  }
]

export const formData = {
  name: 'AppD Single Metric',
  identifier: 'AppD_Multiple_Metric',
  connectorRef: 'account.appdtest',
  isEdit: true,
  product: { label: 'Application Monitoring', value: 'Application Monitoring' },
  type: 'AppDynamics',
  mappedServicesAndEnvs: newMappedServicesAndEnvs,
  appdApplication: 'PR-git-experiment',
  appDTier: 'cvng',
  metricPacks: [{ identifier: 'Performance' }, { identifier: 'Errors' }],
  metricData: { Performance: true, Errors: true },
  metricPath: {
    metricPathDropdown_0: { path: '', value: 'Calls per Minute', isMetric: true },
    metricPathDropdown_1: { path: 'Calls per Minute', value: '', isMetric: false }
  },
  basePath: {
    basePathDropdown_0: { path: '', value: 'Overall Application Performance' },
    basePathDropdown_1: { path: 'Overall Application Performance', value: '' }
  },
  metricName: 'appdMetric One Updated',
  riskCategory: 'Errors/INFRA',
  lowerBaselineDeviation: true,
  higherBaselineDeviation: false,
  groupName: { label: 'One', value: 'One' },
  continuousVerification: true,
  healthScore: false,
  sli: false,
  showCustomMetric: true,
  ignoreThresholds: ignoreThresholdsMockData,
  failFastThresholds: failFastThresholdsMockData
}

export const formDataExpectedOutput = {
  identifier: 'AppD_Multiple_Metric',
  name: 'AppD Single Metric',
  spec: {
    applicationName: 'PR-git-experiment',
    connectorRef: 'account.appdtest',
    feature: 'Application Monitoring',
    metricData: {
      Errors: true,
      Performance: true
    },
    metricDefinitions: [
      {
        analysis: {
          deploymentVerification: {
            enabled: false,
            serviceInstanceMetricPath: undefined
          },
          liveMonitoring: {
            enabled: true
          },
          riskProfile: {
            category: 'Errors',
            metricType: 'ERROR',
            thresholdTypes: []
          }
        },
        baseFolder: 'Application Infrastructure Performance',
        groupName: 'Two',
        identifier: undefined,
        metricName: 'appdMetric Two',
        metricPath: 'JVM',
        sli: {
          enabled: true
        }
      },
      {
        analysis: {
          deploymentVerification: {
            enabled: true,
            serviceInstanceMetricPath: undefined
          },
          liveMonitoring: {
            enabled: false
          },
          riskProfile: {
            category: 'Errors',
            metricType: 'INFRA',
            thresholdTypes: ['ACT_WHEN_LOWER']
          }
        },
        baseFolder: 'Overall Application Performance',
        groupName: 'One',
        identifier: undefined,
        metricName: 'appdMetric One Updated',
        metricPath: 'Calls per Minute',
        sli: {
          enabled: false
        }
      }
    ],
    metricPacks: [
      {
        identifier: 'Performance'
      },
      {
        identifier: 'Errors'
      }
    ],
    tierName: 'cvng'
  },
  type: 'AppDynamics'
}

export const payloadWithThreshold = {
  ...formDataExpectedOutput,
  spec: {
    ...formDataExpectedOutput.spec,
    metricPacks: [
      {
        identifier: 'Performance',
        metricThresholds: [
          {
            criteria: { criteriaPercentageType: 'lessThan', spec: { lessThan: 1 }, type: 'Percentage' },
            groupName: 'testP2',
            metricName: 'average_wait_time_ms',
            metricType: 'Performance',
            spec: { action: 'Ignore' },
            type: 'IgnoreThreshold'
          },
          {
            criteria: { criteriaPercentageType: 'greaterThan', spec: { greaterThan: 12 }, type: 'Percentage' },
            groupName: 'testP',
            metricName: 'stall_count',
            metricType: 'Performance',
            spec: { action: 'Ignore' },
            type: 'IgnoreThreshold'
          },
          {
            criteria: { criteriaPercentageType: 'greaterThan', spec: { greaterThan: 22 }, type: 'Percentage' },
            groupName: 'testPE',
            metricName: 'average_response_time_ms',
            metricType: 'Performance',
            spec: { action: 'FailAfterOccurrence', spec: { count: 2 } },
            type: 'FailImmediately'
          }
        ]
      },
      {
        identifier: 'Errors',
        metricThresholds: [
          {
            criteria: { spec: { greaterThan: 13, lessThan: 2 }, type: 'Absolute' },
            groupName: 'testE',
            metricName: 'number_of_errors',
            metricType: 'Errors',
            spec: { action: 'Ignore' },
            type: 'IgnoreThreshold'
          },
          {
            criteria: { spec: { greaterThan: 12, lessThan: 1 }, type: 'Absolute' },
            groupName: 'testFE',
            metricName: 'number_of_errors',
            metricType: 'Errors',
            spec: { action: 'FailImmediately', spec: {} },
            type: 'FailImmediately'
          }
        ]
      },
      {
        identifier: 'Custom',
        metricThresholds: [
          {
            criteria: { criteriaPercentageType: 'greaterThan', spec: { greaterThan: 12 }, type: 'Percentage' },
            groupName: 'testP',
            metricName: 'stall_count',
            metricType: 'Custom',
            spec: { action: 'Ignore' },
            type: 'IgnoreThreshold'
          }
        ]
      }
    ]
  }
}

export const nonCustomFeilds = {
  appDTier: 'cvng',
  appdApplication: 'PR-git-experiment',
  metricData: {
    Errors: true,
    Performance: true
  },
  metricPacks: [
    {
      identifier: 'Performance'
    },
    {
      identifier: 'Errors'
    }
  ],
  ignoreThresholds: [],
  failFastThresholds: []
}

const appdMetricData = {
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
  serviceInstance: null,
  serviceInstanceMetricPath: 'Individual Nodes|*|Errors per Minute',
  sli: true
}

const mappedMetric = new Map()
mappedMetric.set('appdMetric', appdMetricData)

export const formikInitialData = {
  appDTier: 'cvng',
  appdApplication: 'PR-git-experiment',
  mappedServicesAndEnvs: mappedMetric,
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
  completeMetricPath: '',
  connectorRef: 'TestAppD',
  continuousVerification: true,
  groupName: {
    label: 'Group 1',
    value: 'Group 1'
  },
  healthScore: true,
  higherBaselineDeviation: true,
  identifier: 'AppD_Single',
  pathType: 'dropdownPath',
  isEdit: true,
  lowerBaselineDeviation: true,
  metricIdentifier: 'appdMetric',
  fullPath: 'Overall Application Performance|cvng|Calls per Minute',
  metricData: {
    Errors: true,
    Performance: true
  },
  metricName: 'appdMetric',
  metricPacks: [
    {
      identifier: 'Performance'
    },
    {
      identifier: 'Errors'
    }
  ],
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
  name: 'AppD Single',
  product: {
    label: 'Application Monitoring',
    value: 'Application Monitoring'
  },
  riskCategory: 'Errors/ERROR',
  serviceInstance: null,
  serviceInstanceMetricPath: 'Individual Nodes|*|Errors per Minute',
  showCustomMetric: true,
  sli: true,
  type: 'AppDynamics',
  failFastThresholds: [],
  ignoreThresholds: []
}

export const onSubmitPayload = {
  identifier: 'AppD_Single',
  name: 'AppD Single',
  spec: {
    applicationName: 'PR-git-experiment',
    connectorRef: 'TestAppD',
    feature: 'Application Monitoring',
    metricData: {
      Errors: true,
      Performance: true
    },
    metricDefinitions: [
      {
        analysis: {
          deploymentVerification: { enabled: false, serviceInstanceMetricPath: '' },
          liveMonitoring: { enabled: true },
          riskProfile: { category: 'Errors', metricType: 'ERROR', thresholdTypes: ['ACT_WHEN_HIGHER'] }
        },
        baseFolder: 'Overall Application Performance',
        groupName: 'Group 1',
        identifier: 'appdMetric',
        metricName: 'appdMetric',
        metricPath: 'Calls per Minute',
        sli: { enabled: true },
        completeMetricPath: undefined
      }
    ],
    metricPacks: [
      { identifier: 'Performance', metricThresholds: [] },
      { identifier: 'Errors', metricThresholds: [] }
    ],
    tierName: 'cvng'
  },
  type: 'AppDynamics'
}

export const onSubmitPayloadTemplate = {
  identifier: 'appd',
  name: 'appd',
  spec: {
    applicationName: '<+input>',
    connectorRef: '<+input>',
    feature: 'Application Monitoring',
    metricData: {
      Errors: true,
      Performance: true
    },
    metricDefinitions: [],
    metricPacks: [
      {
        identifier: 'Errors',
        metricThresholds: []
      },
      {
        identifier: 'Performance',
        metricThresholds: []
      }
    ],
    tierName: '<+input>'
  },
  type: 'AppDynamics'
}

export const defaultTemplateData = {
  name: 'appdtemplate',
  identifier: 'appdtemplate',
  connectorRef: '<+input>',
  isEdit: false,
  product: { value: 'Application Monitoring', label: 'Application Monitoring' },
  type: 'AppDynamics',
  applicationName: '',
  tierName: '',
  mappedServicesAndEnvs: {}
}
export const defaultPayload = {
  appDTier: 'manager',
  appdApplication: 'cv-app',
  completeMetricPath: '',
  connectorRef: 'appdconnector',
  fullPath: '',
  identifier: 'appdtemplate',
  isEdit: false,
  metricData: {
    Errors: true,
    Performance: true
  },
  mappedServicesAndEnvs: new Map(),
  metricIdentifier: 'cv.monitoringSources.appD.defaultAppDMetricName',
  metricName: 'cv.monitoringSources.appD.defaultAppDMetricName',
  metricPacks: undefined,
  name: 'appdtemplate',
  pathType: 'fullPath',
  product: {
    label: 'Application Monitoring',
    value: 'Application Monitoring'
  },
  showCustomMetric: false,
  type: 'AppDynamics'
}
export const appDynamicsDataFull = {
  name: 'appd',
  identifier: 'appd',
  connectorRef: 'org.appdprod',
  isEdit: true,
  type: 'AppDynamics',
  applicationName: 'QA',
  tierName: 'manager',
  mappedServicesAndEnvs: new Map(),
  metricPacks: [
    {
      identifier: 'Performance'
    },
    {
      identifier: 'Errors'
    }
  ]
}

export const formDataMock = {
  metricData: {
    Performance: true,
    Errors: false
  },
  ignoreThresholds: ignoreThresholdsMockData,
  failFastThresholds: failFastThresholdsMockData
}

export const metricThresholdsPayloadMockData = [
  {
    identifier: 'Performance',
    metricThresholds: [
      {
        criteria: { criteriaPercentageType: 'lessThan', spec: { lessThan: 1 }, type: 'Percentage' },
        groupName: 'testP2',
        metricName: 'average_wait_time_ms',
        metricType: 'Performance',
        spec: { action: 'Ignore' },
        type: 'IgnoreThreshold'
      },
      {
        criteria: { criteriaPercentageType: 'greaterThan', spec: { greaterThan: 12 }, type: 'Percentage' },
        groupName: 'testP',
        metricName: 'stall_count',
        metricType: 'Performance',
        spec: { action: 'Ignore' },
        type: 'IgnoreThreshold'
      },
      {
        criteria: { criteriaPercentageType: 'greaterThan', spec: { greaterThan: 22 }, type: 'Percentage' },
        groupName: 'testPE',
        metricName: 'average_response_time_ms',
        metricType: 'Performance',
        spec: { action: 'FailAfterOccurrence', spec: { count: 2 } },
        type: 'FailImmediately'
      }
    ]
  },
  {
    identifier: 'Custom',
    metricThresholds: [
      {
        criteria: { criteriaPercentageType: 'greaterThan', spec: { greaterThan: 12 }, type: 'Percentage' },
        groupName: 'testP',
        metricName: 'stall_count',
        metricType: 'Custom',
        spec: { action: 'Ignore' },
        type: 'IgnoreThreshold'
      }
    ]
  }
]
