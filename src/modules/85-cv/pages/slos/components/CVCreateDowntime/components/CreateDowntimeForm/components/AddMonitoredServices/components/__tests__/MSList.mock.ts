/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { MonitoredServiceDetail } from 'services/cv'

export const environmentDataList = {
  status: 'SUCCESS',
  data: [
    {
      environment: {
        accountId: 'kmpySmUISimoRrJL6NL73w',
        orgIdentifier: 'default',
        projectIdentifier: 'demokaran',
        identifier: 'env1234',
        name: 'env1234',
        description: '',
        color: '#0063F7',
        type: 'Production',
        deleted: false,
        tags: {},
        yaml: 'environment:\n  orgIdentifier: "default"\n  projectIdentifier: "demokaran"\n  identifier: "env"\n  tags: {}\n  name: "env"\n  description: ""\n  type: "Production"\n'
      },
      createdAt: 1668501167612,
      lastModifiedAt: 1668501167612
    },
    {
      environment: {
        accountId: 'kmpySmUISimoRrJL6NL73w',
        orgIdentifier: 'default',
        projectIdentifier: 'demokaran',
        identifier: 'gcpl',
        name: 'gcp-l',
        description: '',
        color: '#0063F7',
        type: 'PreProduction',
        deleted: false,
        tags: {},
        yaml: 'environment:\n  orgIdentifier: "default"\n  projectIdentifier: "demokaran"\n  identifier: "gcpl"\n  tags: {}\n  name: "gcp-l"\n  description: ""\n  type: "PreProduction"\n'
      },
      createdAt: 1664191984767,
      lastModifiedAt: 1664191984767
    },
    {
      environment: {
        accountId: 'kmpySmUISimoRrJL6NL73w',
        orgIdentifier: 'default',
        projectIdentifier: 'demokaran',
        identifier: 'gcpm',
        name: 'gcp-m',
        description: '',
        color: '#0063F7',
        type: 'PreProduction',
        deleted: false,
        tags: {},
        yaml: 'environment:\n  orgIdentifier: "default"\n  projectIdentifier: "demokaran"\n  identifier: "gcpm"\n  tags: {}\n  name: "gcp-m"\n  description: ""\n  type: "PreProduction"\n'
      },
      createdAt: 1664191247731,
      lastModifiedAt: 1664191247731
    }
  ],
  correlationId: '86ea3b1c-ef28-45f0-b90f-bfd15dc886da'
}

export const msList = [
  {
    monitoredServiceIdentifier: 'newone_datadog',
    monitoredServiceName: 'newone_datadog',
    serviceIdentifier: 'newone',
    serviceName: 'newone',
    environmentIdentifier: 'datadog',
    environmentName: 'datadog',
    projectParams: {
      accountIdentifier: 'kmpySmUISimoRrJL6NL73w',
      orgIdentifier: 'default',
      projectIdentifier: 'demokaran'
    }
  } as MonitoredServiceDetail
]

// changed pages configuration in the mock to check pagination
export const monitoredServiceList = {
  status: 'SUCCESS',
  data: {
    totalPages: 2,
    totalItems: 3,
    pageItemCount: 2,
    pageSize: 2,
    content: [
      {
        name: 'newone_datadog',
        identifier: 'newone_datadog',
        serviceRef: 'newone',
        environmentRef: 'datadog',
        environmentRefList: ['datadog'],
        serviceName: 'newone',
        environmentName: 'datadog',
        type: 'Application',
        healthMonitoringEnabled: false,
        currentHealthScore: {
          riskStatus: 'NO_DATA',
          startTime: 0,
          endTime: 0
        },
        dependentHealthScore: [],
        historicalTrend: {},
        changeSummary: {},
        tags: {},
        serviceMonitoringEnabled: true
      },
      {
        name: 'newone_datadogm',
        identifier: 'newone_datadogm',
        serviceRef: 'newone',
        environmentRef: 'datadogm',
        environmentRefList: ['datadogm'],
        serviceName: 'newone',
        environmentName: 'datadog-m',
        type: 'Application',
        healthMonitoringEnabled: false,
        currentHealthScore: {
          riskStatus: 'NO_DATA',
          startTime: 0,
          endTime: 0
        },
        dependentHealthScore: [],
        historicalTrend: {},
        changeSummary: {},
        tags: {},
        serviceMonitoringEnabled: false
      }
    ],
    pageIndex: 0,
    empty: false
  },
  correlationId: '27a94d22-ccdc-42d6-8f49-65f58c80dae9'
}

export const monitoredServiceListWithIncorrectData = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 2,
    pageItemCount: 2,
    pageSize: 10,
    content: [
      {
        name: 'newone_datadog',
        identifier: 'newone_datadog',
        type: 'Application',
        tags: { hi: '' }
      },
      {
        name: 'newone_datadogm',
        identifier: 'newone_datadogm',
        serviceRef: 'newone',
        environmentRef: 'datadogm',
        environmentRefList: ['datadogm'],
        serviceName: 'newone',
        environmentName: 'datadog-m',
        type: 'Application',
        dependentHealthScore: [],
        historicalTrend: {},
        changeSummary: {},
        serviceMonitoringEnabled: false
      }
    ],
    pageIndex: 0,
    empty: false
  },
  correlationId: '27a94d22-ccdc-42d6-8f49-65f58c80dae9'
}
