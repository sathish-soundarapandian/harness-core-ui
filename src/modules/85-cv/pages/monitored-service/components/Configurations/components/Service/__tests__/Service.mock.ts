/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { MonitoredServiceForm } from '../Service.types'

export const editModeData = {
  status: 'SUCCESS',
  data: {
    createdAt: 1626320974204,
    lastModifiedAt: 1630674529294,
    monitoredService: {
      orgIdentifier: 'default',
      projectIdentifier: 'Demo',
      identifier: 'monitoredservice101',
      name: 'Monitored Service 101',
      type: 'Application',
      description: 'Monitored Service with change source and health source',
      serviceRef: 'ServiceRef102',
      environmentRef: 'EnvironmentRef102',
      tags: { tag1: '', tag2: '' },
      sources: {
        healthSources: [
          {
            name: 'Splunk 102',
            identifier: 'splunk102',
            type: 'Splunk',
            spec: {
              connectorRef: 'Splunk_Conn',
              feature: 'Cloud Logs',
              queries: [
                {
                  name: 'SPLUNK Logs Query',
                  query: 'error OR failed OR severe OR ( sourcetype=access_* ( 404 OR 500 OR 503 ) )',
                  serviceInstanceIdentifier: '_sourcetype'
                }
              ]
            }
          }
        ],
        changeSources: [
          {
            name: 'PagerDuty 101',
            identifier: 'pagerduty',
            type: 'PagerDuty' as any,
            desc: 'Alert from PagerDuty',
            enabled: true,
            category: 'Alert' as any,
            spec: {
              connectorRef: 'PagerDutyConnector',
              pagerDutyServiceId: 'pagerDutyServiceId101'
            }
          }
        ]
      },
      dependencies: []
    }
  },
  metaData: null,
  correlationId: 'c910c9e2-5a48-4f4b-9dad-afdeac54d060'
}

export const cachedData = {
  orgIdentifier: 'default',
  projectIdentifier: 'Demo',
  identifier: 'monitoredservice101',
  name: 'Monitored Service 101',
  type: 'Application',
  description: 'Monitored Service with change source and health source',
  serviceRef: 'ServiceRef102',
  environmentRef: 'EnvironmentRef102',
  tags: { tag1: '', tag2: '' },
  sources: {
    healthSources: [],
    changeSources: [
      {
        name: 'CD 101',
        identifier: 'cd',
        type: 'HarnessCD' as any,
        desc: 'deployment',
        enabled: true,
        category: 'Deployment' as any,
        spec: {}
      }
    ]
  },
  dependencies: [],
  metaData: null,
  correlationId: 'c910c9e2-5a48-4f4b-9dad-afdeac54d060'
}

export const onUpdatePayload = {
  dependencies: [
    {
      monitoredServiceIdentifier: 'service1'
    },
    {
      monitoredServiceIdentifier: 'service2'
    }
  ],
  description: 'Monitored Service with change source and health source',
  environmentRef: 'EnvironmentRef102',
  identifier: 'monitoredservice101',
  isEdit: true,
  name: 'Monitored Service 101',
  orgIdentifier: 'default',
  projectIdentifier: 'Demo',
  serviceRef: 'ServiceRef102',
  sources: {
    changeSources: [
      {
        category: 'Alert',
        desc: 'Alert from PagerDuty',
        enabled: true,
        identifier: 'pagerduty',
        name: 'PagerDuty 101',
        spec: {
          connectorRef: 'PagerDutyConnector',
          pagerDutyServiceId: 'pagerDutyServiceId101'
        },
        type: 'PagerDuty'
      }
    ],
    healthSources: [
      {
        identifier: 'splunk102',
        name: 'Splunk 102',
        spec: {
          connectorRef: 'Splunk_Conn',
          feature: 'Cloud Logs',
          queries: [
            {
              name: 'SPLUNK Logs Query',
              query: 'error OR failed OR severe OR ( sourcetype=access_* ( 404 OR 500 OR 503 ) )',
              serviceInstanceIdentifier: '_sourcetype'
            }
          ]
        },
        type: 'Splunk'
      }
    ]
  },
  tags: {
    tag1: '',
    tag2: ''
  },
  type: 'Application'
}

export const MockMonitoredServiceDTO: MonitoredServiceForm = {
  dependencies: [],
  environmentRef: '1234_env',
  identifier: '1234_ident',
  name: 'solo-dolo',
  isEdit: false,
  tags: {},
  serviceRef: '1234_serviceRef',
  sources: {
    changeSources: [
      {
        category: 'Deployment',
        enabled: true,
        identifier: '1234_iden',
        name: 'deployment',
        spec: {},
        type: 'HarnessCD'
      },
      {
        category: 'Infrastructure',
        enabled: true,
        identifier: '343_iden',
        name: 'k8',
        spec: {},
        type: 'K8sCluster'
      },
      {
        category: 'Alert',
        enabled: true,
        identifier: '343_iden',
        name: 'pager',
        spec: {},
        type: 'PagerDuty'
      }
    ]
  },
  type: 'Application'
}

export const saveChangeSource = {
  isEdit: false,
  name: 'service1 env1',
  identifier: 'service1_env1',
  description: '',
  tags: '{}',
  serviceRef: 'service1',
  type: 'Application',
  notificationRuleRefs: '[]',
  environmentRef: 'env1',
  environmentRefList: '[]',
  sources: {
    changeSources: [
      {
        category: 'Deployment',
        enabled: true,
        identifier: 'harness_cd_next_gen',
        name: 'Harness CD Next Gen',
        spec: {},
        type: 'HarnessCDNextGen'
      }
    ],
    healthSources: null
  },
  dependencies: '[]'
} as any
