/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type {
  ResponsePageSLODashboardWidget,
  ResponsePageUserJourneyResponse,
  RestResponseListSLOErrorBudgetResetDTO,
  SLODashboardWidget
} from 'services/cv'
import type { TestWrapperProps } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { projectPathProps } from '@common/utils/routeUtils'
import { RiskValues } from '@cv/utils/CommonUtils'
import { SLIMetricEnum } from '../components/CVCreateSLO/components/CreateSLOForm/components/SLI/SLI.constants'
import { PeriodTypes, SLITypes } from '../components/CVCreateSLO/CVCreateSLO.types'

export const errorMessage = 'TEST ERROR MESSAGE'

export const pathParams = {
  accountId: 'account_id',
  projectIdentifier: 'project_identifier',
  orgIdentifier: 'org_identifier'
}

export const testWrapperProps: TestWrapperProps = {
  path: routes.toCVSLOs({ ...projectPathProps, module: 'cv' }),
  pathParams
}

export const dashboardWidgetsContent: SLODashboardWidget = {
  burnRate: {
    currentRatePercentage: 90
  },
  currentPeriodEndTime: 9000,
  currentPeriodLengthDays: 10,
  currentPeriodStartTime: 8000,
  errorBudgetBurndown: [{ timestamp: 1639993380000, value: 0 }, { value: 0 }],
  errorBudgetRemaining: 60,
  errorBudgetRemainingPercentage: 60,
  errorBudgetRisk: RiskValues.HEALTHY,
  healthSourceIdentifier: 'health_source_identifier',
  healthSourceName: 'Health Source Name',
  monitoredServiceIdentifier: 'monitored_service_identifier',
  monitoredServiceName: 'Monitored Service Name',
  sloIdentifier: 'slo_identifier',
  sloPerformanceTrend: [
    { timestamp: 1639993380000, value: 0 },
    { timestamp: 1639993440000, value: 0 }
  ],
  sloTargetPercentage: 60,
  sloTargetType: PeriodTypes.ROLLING,
  tags: {},
  timeRemainingDays: 10,
  title: 'Title',
  totalErrorBudget: 100,
  type: SLITypes.AVAILABILITY,
  serviceIdentifier: 'service',
  environmentIdentifier: 'env',
  environmentName: 'env',
  serviceName: 'serviceName'
}

export const dashboardWidgetsResponse: ResponsePageSLODashboardWidget = {
  data: {
    totalItems: 1,
    totalPages: 1,
    pageIndex: 0,
    pageItemCount: 1,
    pageSize: 4,
    content: [dashboardWidgetsContent]
  }
}

export const userJourneyResponse: ResponsePageUserJourneyResponse = {
  data: {
    content: [
      { userJourney: { name: 'First Journey', identifier: 'First_Journey' } },
      { userJourney: { name: 'Second Journey', identifier: 'Second_Journey' } }
    ]
  }
}

export const initialFormData = {
  name: '',
  identifier: '',
  description: '',
  tags: {},
  userJourneyRef: '',
  monitoredServiceRef: '',
  healthSourceRef: '',
  serviceLevelIndicators: {
    name: '',
    identifier: '',
    type: 'latency',
    spec: {
      type: SLIMetricEnum.RATIO,
      spec: {
        eventType: '',
        metric1: '',
        metric2: ''
      }
    }
  },
  target: {
    type: '',
    sloTargetPercentage: 10,
    spec: {
      periodLength: '',
      startDate: '',
      endDate: ''
    }
  }
}

export const initialStateForDisableTest = {
  userJourney: { label: 'all', value: 'all' },
  monitoredService: { label: 'all', value: 'all' },
  sliTypes: { label: 'all', value: 'all' },
  targetTypes: { label: 'all', value: 'all' },
  sloRiskFilter: null
}

export const errorBudgetResetHistoryResponse: RestResponseListSLOErrorBudgetResetDTO = {
  resource: [
    {
      errorBudgetAtReset: 75,
      remainingErrorBudgetAtReset: 60,
      errorBudgetIncrementPercentage: 50,
      createdAt: 1643328000000,
      reason: 'REASON'
    },
    {
      errorBudgetAtReset: 50,
      remainingErrorBudgetAtReset: 60,
      errorBudgetIncrementPercentage: 50,
      createdAt: 1643241600000,
      reason: 'REASON'
    }
  ]
}

export const mockedSLORiskCountsData = [
  { count: 0, displayName: 'Exhausted', identifier: 'EXHAUSTED' },
  { count: 0, displayName: 'Unhealthy', identifier: 'UNHEALTHY' },
  { count: 0, displayName: 'Need Attention', identifier: 'NEED_ATTENTION' },
  { count: 0, displayName: 'Observe', identifier: 'OBSERVE' },
  { count: 0, displayName: 'Healthy', identifier: 'HEALTHY' }
]

export const mockSLODashboardWidgetsData = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 1,
    pageItemCount: 10,
    pageSize: 10,
    content: [
      {
        sloIdentifier: 'SLO4',
        name: 'SLO-4',
        monitoredServiceIdentifier: 'service_appd_env_appd',
        monitoredServiceName: 'service_appd_env_appd',
        healthSourceIdentifier: 'appd',
        healthSourceName: 'appd',
        serviceIdentifier: 'service_appd',
        environmentIdentifier: 'env_appd',
        environmentName: 'env_appd',
        serviceName: 'service_appd',
        tags: {},
        description: 'Tracks SLO error rate',
        userJourneyIdentifier: 'Journey3',
        userJourneyName: 'Journey-3',
        burnRate: 0.0,
        errorBudgetRemainingPercentage: 100.0,
        errorBudgetRemaining: 43,
        totalErrorBudget: 43,
        sloTargetType: 'Rolling',
        sloTargetPercentage: 97.0,
        noOfActiveAlerts: 12,
        noOfMaximumAlerts: 5,
        errorBudgetRisk: 'HEALTHY'
      }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: null,
  correlationId: '8d19830f-e176-4957-83a1-9d898144ae00'
}
