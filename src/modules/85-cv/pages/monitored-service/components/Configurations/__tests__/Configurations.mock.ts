/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { MonitoredServiceType } from '../components/Service/components/MonitoredServiceOverview/MonitoredServiceOverview.constants'

export const monitoredService = {
  isEdit: true,
  orgIdentifier: 'default',
  projectIdentifier: 'Demo',
  identifier: 'monitoredservice101',
  name: 'Monitored Service 101',
  type: 'Application' as any,
  description: 'Monitored Service with change source and health source',
  serviceRef: 'ServiceRef102',
  environmentRef: 'EnvironmentRef102',
  tags: { tag1: '', tag2: '' },
  sources: {
    healthSources: [
      {
        name: 'Splunk 102',
        identifier: 'splunk102',
        type: 'Splunk' as any,
        spec: {
          connectorRef: 'Splunk_Conn',
          feature: 'Cloud Logs' as any,
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
  dependencies: [
    {
      monitoredServiceIdentifier: 'service1'
    },
    {
      monitoredServiceIdentifier: 'service2'
    }
  ]
}

export const infraMonitoredService = {
  isEdit: true,
  orgIdentifier: 'default',
  projectIdentifier: 'Demo',
  identifier: 'monitoredservice101',
  name: 'Monitored Service 101',
  type: MonitoredServiceType.INFRASTRUCTURE,
  description: 'Monitored Service with change source and health source',
  serviceRef: 'ServiceRef102',
  environmentRef: [
    { label: 'EnvironmentRef101', value: 'EnvironmentRef101' },
    { label: 'EnvironmentRef102', value: 'EnvironmentRef102' }
  ],
  tags: { tag1: '', tag2: '' },
  sources: {
    healthSources: [
      {
        name: 'Splunk 102',
        identifier: 'splunk102',
        type: 'Splunk' as any,
        spec: {
          connectorRef: 'Splunk_Conn',
          feature: 'Cloud Logs' as any,
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
  dependencies: [
    {
      monitoredServiceIdentifier: 'service1'
    },
    {
      monitoredServiceIdentifier: 'service2'
    }
  ]
} as any
