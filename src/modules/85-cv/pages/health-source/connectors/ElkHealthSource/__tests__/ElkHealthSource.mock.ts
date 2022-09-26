/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

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

export const setupSource = {
  accountId: 'kmpySmUISimoRrJL6NL73w',
  orgIdentifier: 'default',
  projectIdentifier: 'Demo',
  name: 'Elk dev 12',
  identifier: 'Elk_dev',
  connectorRef: 'Elk_Conn',
  isEdit: true,
  product: 'Elk Cloud Logs',
  type: 'ELKLog' as any,
  mappedServicesAndEnvs,
  identify_timestamp: undefined,
  logIndexes: undefined,
  messageIdentifier: undefined,
  timeStampFormat: undefined
}

export const ElkPayload = {
  type: 'ELKLog',
  identifier: 'Elk_dev',
  name: 'Elk dev 12',
  spec: {
    connectorRef: 'Elk_Conn',
    feature: 'ELK Logs',
    queries: [
      {
        name: 'ELK Logs Query',
        query: 'error OR failed OR severe OR ( sourcetype=access_* ( 404 OR 500 OR 503 ) )',
        serviceInstanceIdentifier: '_sourcetype',
        index: undefined,
        messageIdentifier: undefined,
        timeStampFormat: undefined,
        timeStampIdentifier: undefined
      }
    ]
  }
}

export const data = {
  isEdit: true,
  healthSourceList: [
    {
      name: 'Elk dev 12',
      identifier: 'Elk_dev',
      type: 'Elk',
      spec: {
        connectorRef: 'Elk_Conn',
        feature: 'Elk Cloud Logs',
        queries: [
          {
            name: 'ELK Logs Query',
            query: 'error OR failed OR severe OR ( sourcetype=access_* ( 404 OR 500 OR 503 ) )',
            serviceInstanceIdentifier: '_sourcetype'
          }
        ]
      }
    }
  ],
  serviceRef: 'AppDService102',
  environmentRef: 'delete',
  monitoredServiceRef: {
    name: 'WithTagAndDescription 12',
    identifier: 'dadadadadsa',
    description: 'dasdasdas',
    tags: {
      tag1: '',
      tag2: ''
    }
  },
  healthSourceName: 'Elk dev 12',
  healthSourceIdentifier: 'Elk_dev',
  sourceType: 'Elk',
  connectorRef: 'Elk_Conn',
  product: {
    label: 'Elk Cloud Logs',
    value: 'Elk Cloud Logs'
  }
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
