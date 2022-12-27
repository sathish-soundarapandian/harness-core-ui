/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { RiskValues } from '@cv/utils/CommonUtils'
import type { ResponsePageMonitoredServiceListItemDTO, MonitoredServiceListItemDTO, CountServiceDTO } from 'services/cv'

export const yamlResponse = {
  metaData: {},
  resource:
    'monitoredService:\n  identifier:\n  type: Application\n  name:\n  desc:\n  projectIdentifier: Demo\n  orgIdentifier: default\n  serviceRef:\n  environmentRef:\n  sources:\n    healthSources:\n    changeSources:\n      - name: Harness CD\n        identifier: harness_cd\n        type: HarnessCD\n        desc: Deployments from Harness CD\n        enabled : true\n',
  responseMessages: []
}

export const rowData = {
  original: {
    name: 'Monitoring service 102',
    identifier: 'Monitoring_service_102',
    serviceRef: 'AppDService101',
    environmentRef: 'AppDTestEnv1',
    serviceName: 'ServiceName 1',
    environmentName: 'EnvironmentName 1',
    type: 'Application' as any,
    healthMonitoringEnabled: true,
    historicalTrend: {
      healthScores: [{ riskStatus: RiskValues.NO_DATA, riskValue: -2 }]
    },
    tags: { tag1: '', tag2: '', tag3: '' },
    currentHealthScore: { riskValue: 50, riskStatus: RiskValues.NEED_ATTENTION }
  }
}

export const changeSummary = {
  categoryCountMap: {
    Deployment: { count: 0, countInPrecedingWindow: 0, percentageChange: 0 },
    Infrastructure: { count: 0, countInPrecedingWindow: 0, percentageChange: 0 },
    FeatureFlag: { count: 0, countInPrecedingWindow: 0, percentageChange: 0 },
    Alert: { count: 0, countInPrecedingWindow: 0, percentageChange: 0 }
  },
  total: { count: 0, countInPrecedingWindow: 0, percentageChange: 0 }
}

export const changeSummaryWithPositiveChange = {
  categoryCountMap: {
    Deployment: { count: 15, countInPrecedingWindow: 10, percentageChange: 50 },
    Infrastructure: { count: 15, countInPrecedingWindow: 10, percentageChange: 50 },
    FeatureFlag: { count: 15, countInPrecedingWindow: 10, percentageChange: 50 },
    Alert: { count: 15, countInPrecedingWindow: 10, percentageChange: 50 }
  },
  total: { count: 60, countInPrecedingWindow: 40, percentageChange: 50 }
}

export const changeSummaryWithNegativeChange = {
  categoryCountMap: {
    Deployment: { count: 10, countInPrecedingWindow: 15, percentageChange: -33.3 },
    Infrastructure: { count: 10, countInPrecedingWindow: 15, percentageChange: -33.3 },
    FeatureFlag: { count: 10, countInPrecedingWindow: 15, percentageChange: -33.3 },
    Alert: { count: 10, countInPrecedingWindow: 15, percentageChange: -33.3 }
  },
  total: { count: 40, countInPrecedingWindow: 60, percentageChange: -33.3 }
}

export const serviceCountData: CountServiceDTO = {
  allServicesCount: 3,
  servicesAtRiskCount: 1
}

const MSListContent: MonitoredServiceListItemDTO[] = [
  {
    name: 'delete me test',
    identifier: 'delete_me_test',
    serviceRef: 'AppDService',
    serviceName: 'ServiceName 1',
    environmentName: 'EnvironmentName 1',
    environmentRef: 'new_env_test',
    type: 'Application',
    healthMonitoringEnabled: true,
    serviceLicenseEnabled: true,
    historicalTrend: {
      healthScores: [{ riskStatus: RiskValues.NO_DATA }]
    },
    currentHealthScore: { riskStatus: RiskValues.HEALTHY, healthScore: 100 },
    tags: { hi: '', new: '', yes: '', again: '', now: '', why: '' }
  },
  {
    name: 'Monitoring service 102 new',
    identifier: 'Monitoring_service_101',
    serviceRef: 'AppDService101',
    environmentRef: 'AppDTestEnv1',
    serviceName: 'ServiceName 2',
    environmentName: 'EnvironmentName 2',
    serviceLicenseEnabled: true,
    type: 'Application',
    healthMonitoringEnabled: true,
    historicalTrend: {
      healthScores: [{ riskStatus: RiskValues.NO_DATA }]
    },
    currentHealthScore: { riskStatus: RiskValues.NEED_ATTENTION, healthScore: 40 },
    tags: {}
  },
  {
    name: 'new monitored service 101',
    identifier: 'test_service_AppDTestEnv2',
    serviceRef: 'test_service',
    environmentRef: 'AppDTestEnv2',
    serviceName: 'ServiceName 3',
    environmentName: 'EnvironmentName 3',
    serviceLicenseEnabled: true,
    type: 'Application',
    healthMonitoringEnabled: true,
    historicalTrend: {
      healthScores: [{ riskStatus: RiskValues.NO_DATA }]
    },
    currentHealthScore: { riskStatus: RiskValues.UNHEALTHY, healthScore: 10 },
    tags: {}
  }
]

const MSListContentMock2: MonitoredServiceListItemDTO[] = [
  {
    name: 'delete me test',
    identifier: 'delete_me_test',
    serviceRef: 'AppDService',
    serviceName: 'ServiceName 1',
    environmentName: 'EnvironmentName 1',
    environmentRef: 'new_env_test',
    type: 'Application',
    healthMonitoringEnabled: true,
    serviceLicenseEnabled: false,
    historicalTrend: {
      healthScores: [{ riskStatus: RiskValues.NO_DATA }]
    },
    currentHealthScore: { riskStatus: RiskValues.HEALTHY, healthScore: 100 },
    tags: { hi: '', new: '', yes: '', again: '', now: '', why: '' }
  }
]

const MSListContentEnforcementMock: MonitoredServiceListItemDTO[] = [
  {
    name: 'delete me test',
    identifier: 'delete_me_test',
    serviceRef: 'AppDService',
    serviceName: 'ServiceName 1',
    environmentName: 'EnvironmentName 1',
    environmentRef: 'new_env_test',
    type: 'Application',
    healthMonitoringEnabled: true,
    serviceLicenseEnabled: false,
    historicalTrend: {
      healthScores: [{ riskStatus: RiskValues.NO_DATA }]
    },
    currentHealthScore: { riskStatus: RiskValues.HEALTHY, healthScore: 100 },
    tags: { hi: '', new: '', yes: '', again: '', now: '', why: '' }
  }
]

export const MSListData: ResponsePageMonitoredServiceListItemDTO = {
  data: {
    totalPages: 1,
    totalItems: serviceCountData.allServicesCount,
    pageItemCount: serviceCountData.allServicesCount,
    pageSize: 10,
    content: MSListContent,
    pageIndex: 0
  }
}

export const MSListDataMock: ResponsePageMonitoredServiceListItemDTO = {
  data: {
    totalPages: 1,
    totalItems: serviceCountData.allServicesCount,
    pageItemCount: serviceCountData.allServicesCount,
    pageSize: 10,
    content: MSListContentMock2,
    pageIndex: 0
  }
}

export const MSListDataEnforcementMock: ResponsePageMonitoredServiceListItemDTO = {
  data: {
    totalPages: 1,
    totalItems: serviceCountData.allServicesCount,
    pageItemCount: serviceCountData.allServicesCount,
    pageSize: 10,
    content: MSListContentEnforcementMock,
    pageIndex: 0
  }
}

export const updatedServiceCountData: CountServiceDTO = {
  allServicesCount: 2,
  servicesAtRiskCount: 1
}

export const updatedMSListData: ResponsePageMonitoredServiceListItemDTO = {
  data: {
    totalPages: 1,
    totalItems: updatedServiceCountData.allServicesCount,
    pageItemCount: updatedServiceCountData.allServicesCount,
    pageSize: 10,
    content: MSListContent.slice(1),
    pageIndex: 0
  }
}

export const riskMSListData: ResponsePageMonitoredServiceListItemDTO = {
  data: {
    totalPages: 1,
    totalItems: updatedServiceCountData.servicesAtRiskCount,
    pageItemCount: updatedServiceCountData.servicesAtRiskCount,
    pageSize: 10,
    content: MSListContent.filter(service => service.currentHealthScore?.riskStatus === RiskValues.UNHEALTHY),
    pageIndex: 0
  }
}

export const graphData = {
  metaData: {},
  resource: {
    nodes: [
      {
        serviceRef: 'service300',
        environmentRef: 'env300',
        riskScore: -1,
        riskLevel: RiskValues.NO_ANALYSIS,
        anomalousMetricsCount: 0,
        anomalousLogsCount: 0,
        changeCount: 0,
        identifierRef: 'service300_env300'
      },
      {
        serviceRef: 'service260',
        environmentRef: 'env260',
        riskScore: -1,
        riskLevel: RiskValues.NO_ANALYSIS,
        anomalousMetricsCount: 0,
        anomalousLogsCount: 0,
        changeCount: 0,
        identifierRef: 'service260_env260'
      }
    ],
    edges: [
      {
        from: 'service300_env300',
        to: 'service260_env260'
      }
    ]
  },
  responseMessages: []
}

export const monitoredServiceMockData = {
  createdAt: 1625571657044,
  lastModifiedAt: 1625627957333,
  monitoredService: {
    orgIdentifier: 'default',
    projectIdentifier: 'Demo',
    enabled: true,
    identifier: 'monitored-service',
    name: 'Monitoring service 102 new',
    type: 'Application',
    description: '',
    serviceRef: 'AppDService101',
    environmentRef: 'AppDTestEnv1',
    sources: {
      healthSources: [
        {
          name: 'new hs old',
          identifier: 'new_hs',
          type: 'AppDynamics',
          spec: {
            connectorRef: 'AppD_Connector_102',
            feature: 'Application Monitoring',
            appdApplicationName: '700712',
            appdTierName: '1181911',
            metricPacks: [
              {
                identifier: 'Errors'
              }
            ]
          }
        },
        {
          name: 'Health Source 101',
          identifier: 'Health_Source_101',
          type: 'AppDynamics',
          spec: {
            connectorRef: 'AppD_Connector_102',
            feature: 'Application Monitoring',
            appdApplicationName: '700015',
            appdTierName: '1180990',
            metricPacks: [
              {
                identifier: 'Performance'
              },
              {
                identifier: 'Errors'
              }
            ]
          }
        }
      ]
    }
  }
}

export const monitoredServiceMockData2 = {
  ...monitoredServiceMockData,
  monitoredService: {
    ...monitoredServiceMockData.monitoredService,
    enabled: false
  }
}

export const monitoredService: MonitoredServiceListItemDTO = {
  name: 'name',
  identifier: 'identifier',
  serviceRef: 'serviceRef',
  environmentRef: 'environmentRef',
  serviceName: 'serviceName',
  environmentName: 'environmentName',
  type: 'Application',
  dependentHealthScore: [
    {
      healthScore: 99,
      riskStatus: RiskValues.HEALTHY
    }
  ],
  healthMonitoringEnabled: true,
  currentHealthScore: {
    healthScore: 45,
    riskStatus: RiskValues.NEED_ATTENTION
  },
  changeSummary: {
    categoryCountMap: {
      Infrastructure: {
        count: 10,
        countInPrecedingWindow: 0
      },
      Alert: {
        count: 10,
        countInPrecedingWindow: 0
      },
      Deployment: {
        count: 10,
        countInPrecedingWindow: 0
      }
    }
  }
}

export const checkFeatureReturnMock = {
  enabled: true,
  featureDetail: {
    count: 1,
    limit: 5
  }
}
