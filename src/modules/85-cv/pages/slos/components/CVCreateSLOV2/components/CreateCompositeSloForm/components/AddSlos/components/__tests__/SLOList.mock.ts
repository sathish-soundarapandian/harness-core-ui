/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const mockSLODashboardWidgetsData = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 2,
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
      },
      {
        sloIdentifier: 'SLO3',
        name: 'SLO-3',
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
        sloTargetType: 'Calender',
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
