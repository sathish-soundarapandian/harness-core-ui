/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import routes from '@common/RouteDefinitions'
import { projectPathProps } from '@common/utils/routeUtils'
import type { TestWrapperProps } from '@common/utils/testUtils'
import { cvModuleParams } from '@cv/RouteDestinations'
import type { ServiceLevelIndicatorDTO } from 'services/cv'
import { Comparators, EvaluationType, SLIEventTypes, SLIMetricTypes, SLOV2Form } from '../CVCreateSLOV2.types'
import { getSLOV2InitialFormData } from '../CVCreateSLOV2.utils'

export const errorMessage = 'TEST ERROR MESSAGE'

export const pathParams = {
  accountId: 'account_id',
  projectIdentifier: 'project_identifier',
  orgIdentifier: 'org_identifier',
  module: 'cv'
}

export const testWrapperProps: TestWrapperProps = {
  path: routes.toCVCreateSLOs({ ...projectPathProps, ...cvModuleParams }),
  pathParams
}

export const SLODetailsData = {
  metaData: {},
  resource: {
    serviceLevelObjectiveV2: {
      orgIdentifier: 'default',
      projectIdentifier: 'project1',
      identifier: 'new_slov2',
      name: 'new slov2',
      description: 'composite slo description',
      tags: {},
      userJourneyRefs: ['Second_Journey'],
      sloTarget: {
        type: 'Rolling',
        sloTargetPercentage: 87.0,
        spec: {
          periodLength: '3d'
        }
      },
      type: 'Composite',
      spec: {
        serviceLevelObjectivesDetails: [
          {
            serviceLevelObjectiveRef: 'hHJYxnUFTCypZdmYr0Q0tQ',
            weightagePercentage: 50.0
          },
          {
            serviceLevelObjectiveRef: '7b-_GIZxRu6VjFqAqqdVDQ',
            weightagePercentage: 50.0
          }
        ]
      },
      notificationRuleRefs: []
    },
    createdAt: 1666181322626,
    lastModifiedAt: 1666181322626
  },
  responseMessages: []
}

export const rolling = {
  type: 'Rolling',
  sloTargetPercentage: 87.0,
  spec: {
    periodLength: '3d'
  }
}

export const calendarWeekly = {
  type: 'Calender',
  sloTargetPercentage: 77,
  spec: {
    type: 'Weekly',
    spec: {
      dayOfWeek: 'Fri'
    }
  }
}

export const calendarMonthly = {
  type: 'Calender',
  sloTargetPercentage: 77,
  spec: {
    type: 'Monthly',
    spec: {
      dayOfMonth: '4'
    }
  }
}

export const calendarQuarterly = {
  type: 'Calender',
  sloTargetPercentage: 99,
  spec: {
    type: 'Quarterly',
    spec: {}
  }
}

export const initialFormData: SLOV2Form = getSLOV2InitialFormData('Simple')

export const serviceLevelIndicator: ServiceLevelIndicatorDTO = {
  name: 'SLO-5-updated',
  identifier: 'SLO5',
  healthSourceRef: 'Test_gcp',
  spec: {
    type: SLIMetricTypes.RATIO,
    spec: {
      eventType: SLIEventTypes.GOOD,
      metric1: 'metric1',
      metric2: 'metric2',
      thresholdType: Comparators.LESS,
      thresholdValue: 10
    } as any
  },
  type: EvaluationType.WINDOW
}

export const notificationMock = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 1,
    pageItemCount: 1,
    pageSize: 10,
    content: [
      {
        notificationRule: {
          orgIdentifier: 'cvng',
          projectIdentifier: 'templatetesting',
          identifier: 'Test_Notification_10101',
          name: 'Test Notification 10101',
          type: 'ServiceLevelObjective',
          conditions: [{ type: 'ErrorBudgetRemainingPercentage', spec: { threshold: 99.0 } }],
          notificationMethod: { type: 'Email', spec: { recipients: ['test@harness.io'] } }
        },
        enabled: false,
        createdAt: 1674641345880,
        lastModifiedAt: 1674641345880
      }
    ],
    pageIndex: 0,
    empty: false
  },
  correlationId: 'af0832ea-e71d-4ff1-a284-6b66d93c3573'
}

export const simpleSLOData = {
  metaData: {},
  resource: {
    serviceLevelObjectiveV2: {
      orgIdentifier: 'cvng',
      projectIdentifier: 'templatetesting',
      identifier: 'SLO1',
      name: 'SLO1',
      description: 'SLO which tracks uptime.',
      tags: {},
      userJourneyRefs: ['journey1'],
      sloTarget: { type: 'Rolling', sloTargetPercentage: 99, spec: { periodLength: '1d' } },
      type: 'Simple',
      spec: {
        monitoredServiceRef: 'service_appd_env_appd',
        healthSourceRef: 'appd',
        serviceLevelIndicatorType: 'Latency',
        serviceLevelIndicators: [
          {
            name: 'SLO1_appdMetric_c7cml5choco',
            identifier: 'SLO1_appdMetric_c7cml5choco',
            spec: {
              type: 'Threshold',
              sliMissingDataType: 'Good',
              spec: { metric1: 'appdMetric_1', thresholdValue: 80, thresholdType: '<' }
            }
          }
        ]
      },
      notificationRuleRefs: [
        {
          enabled: true,
          notificationRuleRef: 'Test_Notification_10101'
        }
      ]
    },
    createdAt: 1662966904195,
    lastModifiedAt: 1674026822471
  },
  responseMessages: []
}

export const ratioBasedSLO = {
  metaData: {},
  resource: {
    serviceLevelObjectiveV2: {
      orgIdentifier: 'cvng',
      projectIdentifier: 'templatetesting',
      identifier: 'Ratio_based',
      name: 'Ratio based',
      tags: { serviceLevelIndicatorType: 'AVAILABILITY' },
      userJourneyRefs: ['new102'],
      sloTarget: { type: 'Rolling', sloTargetPercentage: 99.0, spec: { periodLength: '7d' } },
      type: 'Simple',
      spec: {
        monitoredServiceRef: 'AppD_dynatrace',
        healthSourceRef: 'Prometheus',
        serviceLevelIndicatorType: 'Availability',
        serviceLevelIndicators: [
          {
            name: 'AppD_dynatrace_Prometheus_Ratio_based_9b9dc34f-67a5-445a-b0de-b518ef4ff151}',
            identifier: 'AppD_dynatrace_Prometheus_Ratio_based_c454a38a-0c1c-4843-ad9c-224e491a8d65',
            type: 'Window',
            spec: {
              sliMissingDataType: 'Good',
              spec: {
                eventType: 'Good',
                metric1: 'Prometheus_Metric_2',
                metric2: 'prometheus_metric',
                thresholdValue: 99.99,
                thresholdType: '>'
              },
              type: 'Ratio'
            },
            sliMissingDataType: 'Good'
          }
        ]
      },
      notificationRuleRefs: []
    },
    createdAt: 1676346718888,
    lastModifiedAt: 1679570275046
  },
  responseMessages: []
}

export const healthSourceListResponse = {
  status: 'SUCCESS',
  data: {
    createdAt: 1669357987964,
    lastModifiedAt: 1669357987964,
    monitoredService: {
      orgIdentifier: 'cvng',
      projectIdentifier: 'templatetesting',
      identifier: 'AppD_monsoon1',
      name: 'AppD_monsoon1',
      type: 'Application',
      description: '',
      serviceRef: 'AppD',
      environmentRef: 'monsoon1',
      environmentRefList: ['monsoon1'],
      tags: {},
      sources: {
        healthSources: [
          {
            name: 'AppD for SLO 2 metric',
            identifier: 'AppD_for_SLO_2_metric',
            type: 'AppDynamics',
            spec: {
              connectorRef: 'account.appdtest',
              metricPacks: [{ identifier: 'Performance' }, { identifier: 'Errors' }],
              feature: 'Application Monitoring',
              applicationName: 'Harness-Dev',
              tierName: 'manager',
              metricDefinitions: [
                {
                  identifier: 'appdMetric_2',
                  metricName: 'appdMetric 2',
                  riskProfile: { category: 'Errors', thresholdTypes: [] },
                  analysis: {
                    liveMonitoring: { enabled: false },
                    deploymentVerification: { enabled: false },
                    riskProfile: { category: 'Errors', thresholdTypes: [] }
                  },
                  sli: { enabled: true },
                  groupName: 'Group 2',
                  completeMetricPath: 'Overall Application Performance|manager|Calls per Minute'
                },
                {
                  identifier: 'appdMetric_1',
                  metricName: 'appdMetric 1',
                  riskProfile: { category: 'Errors', thresholdTypes: [] },
                  analysis: {
                    liveMonitoring: { enabled: false },
                    deploymentVerification: { enabled: false },
                    riskProfile: { category: 'Errors', thresholdTypes: [] }
                  },
                  sli: { enabled: true },
                  groupName: 'Group 1',
                  completeMetricPath: 'Overall Application Performance|manager|Error Page Redirects per Minute'
                }
              ]
            }
          },
          {
            name: 'AppD for SLO 1 metric',
            identifier: 'AppD_for_SLO_1_metric',
            type: 'AppDynamics',
            spec: {
              connectorRef: 'account.appdtest',
              metricPacks: [{ identifier: 'Performance' }, { identifier: 'Errors' }],
              feature: 'Application Monitoring',
              applicationName: 'Harness-Dev',
              tierName: 'manager',
              metricDefinitions: [
                {
                  identifier: 'appdMetric_1',
                  metricName: 'appdMetric 1',
                  riskProfile: { category: 'Errors', thresholdTypes: [] },
                  analysis: {
                    liveMonitoring: { enabled: false },
                    deploymentVerification: { enabled: false },
                    riskProfile: { category: 'Errors', thresholdTypes: [] }
                  },
                  sli: { enabled: true },
                  groupName: 'Group 2',
                  completeMetricPath: 'Overall Application Performance|manager|Calls per Minute'
                },
                {
                  identifier: 'appdMetric_2',
                  metricName: 'appdMetric 2',
                  riskProfile: { category: 'Errors', thresholdTypes: [] },
                  analysis: {
                    liveMonitoring: { enabled: false },
                    deploymentVerification: { enabled: false },
                    riskProfile: { category: 'Errors', thresholdTypes: [] }
                  },
                  sli: { enabled: true },
                  groupName: 'Group 1',
                  completeMetricPath: 'Overall Application Performance|manager|Error Page Redirects per Minute'
                }
              ]
            }
          }
        ],
        changeSources: []
      },
      dependencies: [],
      notificationRuleRefs: [],
      enabled: false
    }
  },
  correlationId: '9850744f-187b-432e-88ce-ac53a3eedf6f'
}
export const metricListResponse = {
  metaData: {},
  resource: [
    { identifier: 'appdMetric_2', metricName: 'appdMetric 2' },
    { identifier: 'appdMetric_1', metricName: 'appdMetric 1' }
  ],
  responseMessages: []
}

export const monitoredServicelist = {
  status: 'SUCCESS',
  data: [
    {
      identifier: 'AppD_dynatrace',
      name: 'AppD_dynatrace',
      healthSources: [{ name: 'asdasda', identifier: 'asdasda' }]
    },
    { identifier: 'AppD_env1', name: 'AppD_env1', healthSources: [{ name: 'AppDynamics', identifier: 'AppDynamics' }] },
    {
      identifier: 'AppD_monsoon1',
      name: 'AppD_monsoon1',
      healthSources: [{ name: 'AppD for SLO 2 metric', identifier: 'AppD_for_SLO_2_metric' }]
    },
    { identifier: 'AppD_test1e', name: 'AppD_test1e', healthSources: [{ name: 'SumoLogic', identifier: 'SumoLogic' }] },
    { identifier: 'AppD_version1', name: 'AppD_version1', healthSources: [{ name: 'sdasd', identifier: 'sdasd' }] },
    { identifier: 'AppD_version2', name: 'AppD_version2', healthSources: [] }
  ],
  correlationId: '56bdf581-3e9c-4847-9c55-6952a03f28d1'
}

export const initialData = {
  SLIMetricType: 'Ratio',
  SLOTargetPercentage: 99,
  evaluationType: 'Window',
  healthSourceRef: '',
  identifier: '',
  monitoredServiceRef: '',
  name: '',
  notificationRuleRefs: [],
  periodType: 'Rolling',
  serviceLevelIndicatorType: 'Availability',
  type: 'Simple',
  userJourneyRef: []
}

export const serviceLevelObjectiveV2 = {
  orgIdentifier: 'cvng',
  projectIdentifier: 'templatetesting',
  identifier: 'SLO4',
  name: 'SLO 4 Updated',
  description: 'Tracks SLO error rate',
  tags: { serviceLevelIndicatorType: 'LATENCY' },
  userJourneyRefs: ['Journey3'],
  sloTarget: {
    type: 'Rolling',
    sloTargetPercentage: 97,
    spec: { periodLength: '1d' }
  },
  type: 'Simple',
  spec: {
    monitoredServiceRef: 'service_appd_env_appd',
    healthSourceRef: 'appd',
    serviceLevelIndicatorType: 'Latency',
    serviceLevelIndicators: [
      {
        name: 'service_appd_env_appd_appd_SLO4_d0465971-4885-474f-be87-4a32c55d30f9}',
        identifier: 'service_appd_env_appd_appd_SLO4_cc7b5a73-4fbb-4fd4-872f-146f854d74d7',
        type: 'Window',
        spec: {
          sliMissingDataType: 'Good',
          spec: {
            eventType: 'Good',
            metric1: 'appdMetric',
            metric2: 'appdMetric_c7cml5choco',
            thresholdValue: 95,
            thresholdType: '<'
          },
          type: 'Ratio'
        },
        sliMissingDataType: 'Good'
      }
    ]
  },
  notificationRuleRefs: [{ notificationRuleRef: 'test1010', enabled: true }]
}

export const editFormData = {
  type: 'Simple',
  name: 'SLO 4 Updated',
  identifier: 'SLO4',
  description: 'Tracks SLO error rate',
  tags: { serviceLevelIndicatorType: 'LATENCY' },
  userJourneyRef: ['Journey3'],
  periodType: 'Rolling',
  periodLength: '1d',
  SLOTargetPercentage: 97,
  notificationRuleRefs: [{ notificationRuleRef: 'test1010', enabled: true }],
  monitoredServiceRef: 'service_appd_env_appd',
  healthSourceRef: 'appd',
  serviceLevelIndicatorType: 'Latency',
  evaluationType: 'Window',
  SLIMetricType: 'Ratio',
  eventType: 'Good',
  validRequestMetric: 'appdMetric_c7cml5choco',
  goodRequestMetric: 'appdMetric',
  objectiveValue: 95,
  objectiveComparator: '<',
  dayOfMonth: undefined,
  dayOfWeek: undefined,
  periodLengthType: undefined,
  SLIMissingDataType: 'Good'
}
