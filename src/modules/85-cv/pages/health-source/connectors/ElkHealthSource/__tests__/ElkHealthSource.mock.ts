/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getMappedServicesAndEnvs } from '../ElkHealthSource.utils'

const mappedServicesAndEnvs = new Map()

mappedServicesAndEnvs.set('ELK Logs Query', {
  serviceInstance: '_sourcetype',
  metricName: 'ELK Logs Query',
  query: 'error OR failed OR severe OR ( sourcetype=access_* ( 404 OR 500 OR 503 ) )'
})

export const params = {
  accountId: 'kmpySmUISimoRrJL6NL73w',
  orgIdentifier: 'default',
  projectIdentifier: 'Demo'
}

export const ElkPayload = {
  type: 'ELKLog',
  identifier: 'elk1',
  name: 'elk1',
  spec: {
    connectorRef: 'ddsfdsfdf',
    feature: 'ELK Logs',
    queries: [
      {
        name: 'ELK Logs Query',
        query: '*',
        serviceInstanceIdentifier: '_source.space.description',
        index: '.kibana_1',
        messageIdentifier: '_type',
        timeStampFormat: 'yyyy MMM dd HH:mm:ss.SSS zzz',
        timeStampIdentifier: '_source.space.name'
      }
    ]
  }
}

export const data = {
  connectorRef: 'ddsfdsfdf',
  isEdit: true,
  healthSourceList: [
    {
      name: 'NewRelic_editname',
      identifier: 'NewRelic',
      type: 'NewRelic',
      spec: {
        connectorRef: 'org.newrelicinsightsconnectorforautomation',
        applicationName: 'My Application',
        applicationId: '107019083',
        feature: 'apm',
        metricPacks: [
          {
            identifier: 'Performance',
            metricThresholds: null
          }
        ],
        newRelicMetricDefinitions: []
      }
    },
    {
      name: 'elk_hs3',
      identifier: 'elk_hs3',
      type: 'ELKLog',
      spec: {
        connectorRef: 'account.ELK',
        feature: 'ELK Logs',
        queries: [
          {
            name: 'ELK Logs Query',
            query: '*',
            index: '.kibana_1',
            serviceInstanceIdentifier: '_source.updated_at',
            timeStampIdentifier: '_source.space.description',
            timeStampFormat: 'MMM dd HH:mm:ss ZZZZ yyyy',
            messageIdentifier: '_index'
          }
        ]
      }
    },

    {
      name: 'elk1',
      identifier: 'elk1',
      type: 'ELKLog',
      spec: {
        connectorRef: 'ddsfdsfdf',
        feature: 'ELK Logs',
        queries: [
          {
            name: 'ELK Logs Query',
            query: '*',
            index: '.kibana_1',
            serviceInstanceIdentifier: '_source.space.description',
            timeStampIdentifier: '_source.space.name',
            timeStampFormat: 'yyyy MMM dd HH:mm:ss.SSS zzz',
            messageIdentifier: '_type'
          }
        ]
      }
    }
  ],
  serviceRef: 'demo',
  environmentRef: 'prod',
  monitoredServiceRef: {
    name: 'demo_prod',
    identifier: 'demo_prod'
  },
  existingMetricDetails: {
    name: 'elk1',
    identifier: 'elk1',
    type: 'ELKLog',
    spec: {
      connectorRef: 'ddsfdsfdf',
      feature: 'ELK Logs',
      queries: [
        {
          name: 'ELK Logs Query',
          query: '*',
          index: '.kibana_1',
          serviceInstanceIdentifier: '_source.space.description',
          timeStampIdentifier: '_source.space.name',
          timeStampFormat: 'yyyy MMM dd HH:mm:ss.SSS zzz',
          messageIdentifier: '_type'
        }
      ]
    }
  },
  healthSourceName: 'elk1',
  healthSourceIdentifier: 'elk1',
  sourceType: 'ELKLog',
  product: {
    label: 'ELK Logs',
    value: 'ELK Logs'
  }
}

export const setupSource = {
  accountId: 'kmpySmUISimoRrJL6NL73w',
  orgIdentifier: 'default',
  projectIdentifier: 'Demo',
  name: 'elk1',
  connectorRef: 'ddsfdsfdf',
  identifier: 'elk1',
  isEdit: true,
  product: 'ELK Logs',
  type: 'ELKLog' as any,
  mappedServicesAndEnvs: getMappedServicesAndEnvs(data),
  messageIdentifier: undefined,
  timeStampFormat: undefined
}

export const mockedElkSampleData = [
  {
    _time: '2021-08-11T00:00:00.000+00:00',
    pool: 'auto_generated_pool_enterprise',
    s: 'www1.zip:./www1/access.log',
    st: 'access_combined_wcookie',
    h: 'Elk-dev',
    idx: 'default',
    b: '4248458'
  },
  {
    _time: '2021-08-11T00:00:00.000+00:00',
    pool: 'auto_generated_pool_enterprise',
    s: 'www1.zip:./www1/secure.log',
    st: 'secure',
    h: 'Elk-dev',
    idx: 'default',
    b: '1160114'
  }
]

export const mockedElkIndicesData = [
  'filebeat-6.8.8-2022.09.03',
  '.kibana_1',
  'filebeat-6.8.8-2022.08.25',
  'filebeat-6.8.8-2022.09.12',
  'filebeat-6.8.8-2022.09.04',
  'filebeat-6.8.8-2022.09.15'
]

export const mockedElkTimeStampFormat = [
  'filebeat-6.8.8-2022.09.03',
  '.kibana_1',
  'filebeat-6.8.8-2022.08.25',
  'filebeat-6.8.8-2022.09.12',
  'filebeat-6.8.8-2022.09.04',
  'filebeat-6.8.8-2022.09.15'
]
