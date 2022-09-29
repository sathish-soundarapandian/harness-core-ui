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

export const setupSource_noData = {
  accountId: 'kmpySmUISimoRrJL6NL73w',
  orgIdentifier: 'default',
  projectIdentifier: 'Demo',
  type: 'ELKLog' as any,
  mappedServicesAndEnvs: getMappedServicesAndEnvs(null),
  messageIdentifier: undefined,
  timeStampFormat: undefined
}

export const setupSourceMappedMetric = {
  accountId: 'kmpySmUISimoRrJL6NL73w',
  orgIdentifier: 'default',
  projectIdentifier: 'Demo',
  type: 'ELKLog' as any,
  mappedServicesAndEnvs: getMappedServicesAndEnvs(null),
  messageIdentifier: undefined,
  timeStampFormat: undefined
}

export const mockedElkSampleData = [
  {
    _index: '.kibana_1',
    _type: 'doc',
    _source: {
      updated_at: '2022-08-24T19:15:35.703Z',
      type: 'space',
      space: {
        color: '#00bfb3',
        _reserved: true,
        name: 'Default',
        description: 'This is your default space!'
      }
    },
    _id: 'space:default',
    _score: 1
  },
  {
    _index: '.kibana_1',
    _type: 'doc',
    _source: {
      migrationVersion: {
        'index-pattern': '6.5.0'
      },
      'index-pattern': {
        timeFieldName: '@timestamp',
        title: 'filebeat-*'
      },
      updated_at: '2022-08-24T19:17:30.774Z',
      type: 'index-pattern'
    },
    _id: 'index-pattern:615e57e0-23e1-11ed-a1d1-d548f45c1824',
    _score: 1
  },
  {
    _index: '.kibana_1',
    _type: 'doc',
    _source: {
      updated_at: '2022-08-24T19:30:02.595Z',
      telemetry: {
        enabled: false
      },
      type: 'telemetry'
    },
    _id: 'telemetry:telemetry',
    _score: 1
  },
  {
    _index: '.kibana_1',
    _type: 'doc',
    _source: {
      migrationVersion: {
        'index-pattern': '6.5.0'
      },
      'index-pattern': {
        timeFieldName: '@timestamp',
        title: '*-todolist*',
        fields:
          '[{"name":"@timestamp","type":"date","count":0,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"_id","type":"string","count":0,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":false},{"name":"_index","type":"string","count":0,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":false},{"name":"_score","type":"number","count":0,"scripted":false,"searchable":false,"aggregatable":false,"readFromDocValues":false},{"name":"_source","type":"_source","count":0,"scripted":false,"searchable":false,"aggregatable":false,"readFromDocValues":false},{"name":"_type","type":"string","count":0,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":false},{"name":"hostname","type":"string","count":0,"scripted":false,"searchable":true,"aggregatable":false,"readFromDocValues":false},{"name":"hostname.keyword","type":"string","count":0,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"level","type":"string","count":0,"scripted":false,"searchable":true,"aggregatable":false,"readFromDocValues":false},{"name":"level.keyword","type":"string","count":0,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"message","type":"string","count":0,"scripted":false,"searchable":true,"aggregatable":false,"readFromDocValues":false},{"name":"message.keyword","type":"string","count":0,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true}]'
      },
      updated_at: '2022-08-24T19:31:36.148Z',
      type: 'index-pattern'
    },
    _id: 'index-pattern:5d7f3700-23e3-11ed-a1d1-d548f45c1824',
    _score: 1
  },
  {
    _index: '.kibana_1',
    _type: 'doc',
    _source: {
      migrationVersion: {
        'index-pattern': '6.5.0'
      },
      'index-pattern': {
        timeFieldName: '@timestamp',
        title: 'integ*',
        fields:
          '[{"name":"@timestamp","type":"date","count":0,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"_id","type":"string","count":0,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":false},{"name":"_index","type":"string","count":0,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":false},{"name":"_score","type":"number","count":0,"scripted":false,"searchable":false,"aggregatable":false,"readFromDocValues":false},{"name":"_source","type":"_source","count":0,"scripted":false,"searchable":false,"aggregatable":false,"readFromDocValues":false},{"name":"_type","type":"string","count":0,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":false},{"name":"hostname","type":"string","count":0,"scripted":false,"searchable":true,"aggregatable":false,"readFromDocValues":false},{"name":"hostname.keyword","type":"string","count":0,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"level","type":"string","count":0,"scripted":false,"searchable":true,"aggregatable":false,"readFromDocValues":false},{"name":"level.keyword","type":"string","count":0,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"name":"message","type":"string","count":0,"scripted":false,"searchable":true,"aggregatable":false,"readFromDocValues":false},{"name":"message.keyword","type":"string","count":0,"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true}]'
      },
      updated_at: '2022-08-25T16:44:48.303Z',
      type: 'index-pattern'
    },
    _id: 'index-pattern:3a6b7000-2495-11ed-a1d1-d548f45c1824',
    _score: 1
  },
  {
    _index: '.kibana_1',
    _type: 'doc',
    _source: {
      updated_at: '2022-08-29T16:15:32.802Z',
      'kql-telemetry': {
        optInCount: 2,
        optOutCount: 1
      },
      type: 'kql-telemetry'
    },
    _id: 'kql-telemetry:kql-telemetry',
    _score: 1
  },
  {
    _index: '.kibana_1',
    _type: 'doc',
    _source: {
      updated_at: '2022-08-30T15:24:28.203Z',
      type: 'config',
      config: {
        buildNum: 20530,
        defaultIndex: '5d7f3700-23e3-11ed-a1d1-d548f45c1824'
      }
    },
    _id: 'config:6.8.8',
    _score: 1
  }
]

export const mockedElkIndicesData = [
  'filebeat-6.8.8-2022.09.03',
  '.kibana_1',
  'filebeat-6.8.8-2022.08.25',
  'filebeat-6.8.8-2022.09.12',
  'filebeat-6.8.8-2022.09.24',
  'filebeat-6.8.8-2022.09.04',
  'filebeat-6.8.8-2022.09.25',
  'filebeat-6.8.8-2022.09.15',
  'cv-demo',
  'filebeat-6.8.8-2022.09.06',
  'filebeat-6.8.8-2022.09.01',
  'filebeat-6.8.8-2022.09.22',
  'filebeat-6.8.8-2022.08.24',
  'filebeat-6.8.8-2022.09.09',
  'filebeat-6.8.8-2022.09.07',
  'filebeat-6.8.8-2022.09.05',
  'filebeat-6.8.8-2022.09.17',
  'filebeat-6.8.8-2022.09.13',
  'filebeat-6.8.8-2022.08.26',
  'filebeat-6.8.8-2022.09.10',
  'filebeat-6.8.8-2022.09.16',
  'filebeat-6.8.8-2022.09.11',
  'filebeat-6.8.8-2022.09.27',
  'filebeat-6.8.8-2022.08.27',
  'filebeat-6.8.8-2022.08.31',
  'filebeat-6.8.8-2022.08.28',
  'filebeat-6.8.8-2022.09.02',
  'filebeat-6.8.8-2022.09.28',
  'local-todolist-logs',
  'filebeat-6.8.8-2022.09.14',
  'filebeat-6.8.8-2022.09.26',
  'integration-test',
  'filebeat-6.8.8-2022.09.08',
  'filebeat-6.8.8-2022.09.18',
  'filebeat-6.8.8-2022.08.29',
  'filebeat-6.8.8-2022.09.19',
  'filebeat-6.8.8-2022.09.21',
  'filebeat-6.8.8-2022.08.30',
  'filebeat-6.8.8-2022.09.23',
  'filebeat-6.8.8-2022.09.20'
]

export const mockedElkTimeStampFormat = [
  "yyyy-MM-dd'T'HH:mm:ss*SSSZZZZ",
  'yyyy MMM dd HH:mm:ss.SSS zzz',
  'MMM dd HH:mm:ss ZZZZ yyyy',
  'dd/MMM/yyyy:HH:mm:ss ZZZZ',
  'MMM dd, yyyy hh:mm:ss a',
  'MMM dd yyyy HH:mm:ss',
  'MMM dd HH:mm:ss yyyy',
  'MMM dd HH:mm:ss ZZZZ',
  'MMM dd HH:mm:ss',
  "yyyy-MM-dd'T'HH:mm:ssZZZZ",
  "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
  'yyyy-MM-dd HH:mm:ss ZZZZ',
  'yyyy-MM-dd HH:mm:ssZZZZ',
  'yyyy-MM-dd HH:mm:ss,SSS',
  'yyyy/MM/dd*HH:mm:ss',
  'yyyy MMM dd HH:mm:ss.SSS*zzz',
  'yyyy MMM dd HH:mm:ss.SSS',
  'yyyy-MM-dd HH:mm:ss,SSSZZZZ',
  'yyyy-MM-dd HH:mm:ss.SSS',
  'yyyy-MM-dd HH:mm:ss.SSSZZZZ',
  "yyyy-MM-dd'T'HH:mm:ss.SSS",
  "yyyy-MM-dd'T'HH:mm:ss",
  "yyyy-MM-dd'T'HH:mm:ss'Z'",
  "yyyy-MM-dd'T'HH:mm:ss.SSS",
  "yyyy-MM-dd'T'HH:mm:ss",
  'yyyy-MM-dd*HH:mm:ss:SSS',
  'yyyy-MM-dd*HH:mm:ss',
  'yy-MM-dd HH:mm:ss,SSS ZZZZ',
  'yy-MM-dd HH:mm:ss,SSS',
  'yy-MM-dd HH:mm:ss',
  'yy/MM/dd HH:mm:ss',
  'yyMMdd HH:mm:ss',
  'yyyyMMdd HH:mm:ss.SSS',
  'MM/dd/yy*HH:mm:ss',
  'MM/dd/yyyy*HH:mm:ss',
  'MM/dd/yyyy*HH:mm:ss*SSS',
  'MM/dd/yy HH:mm:ss ZZZZ',
  'MM/dd/yyyy HH:mm:ss ZZZZ',
  'HH:mm:ss',
  'HH:mm:ss.SSS',
  'HH:mm:ss,SSS',
  'dd/MMM HH:mm:ss,SSS',
  'dd/MMM/yyyy:HH:mm:ss',
  'dd-MMM-yyyy HH:mm:ss',
  'dd-MMM-yyyy HH:mm:ss.SSS',
  'dd MMM yyyy HH:mm:ss',
  'dd MMM yyyy HH:mm:ss*SSS',
  'MMdd_HH:mm:ss',
  'MMdd_HH:mm:ss.SSS',
  'MM/dd/yyyy hh:mm:ss a:SSS',
  'MM/dd/yyyy hh:mm:ss a'
]

export const sourceData = {
  accountId: '-k53qRQAQ1O7DBLb9ACnjQ',
  module: 'cv',
  orgIdentifier: 'cvng',
  projectIdentifier: 'SRM_QA_Sign_Off_Automation',
  name: 'dsfdsfdf',
  identifier: 'dsfdsfdf',
  connectorRef: 'elk_conn3',
  isEdit: false,
  product: 'Cloud Logs',
  type: 'ELKLog',
  mappedServicesAndEnvs: new Map()
}

