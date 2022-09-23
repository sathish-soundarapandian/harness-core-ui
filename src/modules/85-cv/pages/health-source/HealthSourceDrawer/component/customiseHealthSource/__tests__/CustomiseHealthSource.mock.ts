/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const sourceData = {
  isEdit: false,
  healthSourceList: [],
  environmentName: 'TestDemo101',
  environmentIdentifier: 'TestDemo101',
  serviceName: 'TestDemo',
  serviceIdentifier: 'TestDemo',
  monitoringSourceName: 'AppD Test',
  monitoredServiceIdentifier: 'AppD_Test',
  product: { label: 'Application Monitoring', value: 'Application Monitoring' },
  metricPacks: [{ identifier: 'Errors' }, { identifier: 'Performance' }],
  healthSourceName: 'AppD 101',
  healthSourceIdentifier: 'AppD_101',
  sourceType: 'AppDynamics',
  connectorRef: 'AppD_Connector_102'
}

export const sourceDataSplunkMetric = {
  connectorRef: 'splunk_trial',
  isEdit: true,
  healthSourceList: [
    {
      type: 'SplunkMetric',
      identifier: 'ghjghj',
      name: 'ghjghj',
      spec: {
        connectorRef: 'splunk_trial',
        feature: 'Splunk Metric',
        metricDefinitions: [
          {
            identifier: 'splunk_metric',
            groupName: 'G1',
            metricName: 'Splunk Metric',
            query: 'sdfsdf',
            sli: {
              enabled: false
            }
          }
        ]
      }
    }
  ],
  serviceRef: 'prometheustest',
  environmentRef: 'prod',
  monitoredServiceRef: {
    name: 'prometheustest_prod',
    identifier: 'prometheustest_prod'
  },
  existingMetricDetails: null,
  healthSourceName: 'ghjghj',
  healthSourceIdentifier: 'ghjghj',
  sourceType: 'SplunkMetric',
  product: {
    label: 'Splunk Metric',
    value: 'Splunk Metric'
  }
}

export const healthSourcesPayload = {
  type: 'Splunk' as any,
  identifier: 'Splunk_dev',
  name: 'Splunk dev 12',
  spec: {
    connectorRef: 'Splunk_Conn',
    feature: 'Cloud Logs',
    queries: [
      {
        name: 'SPLUNK Logs Query',
        query: '*',
        serviceInstanceIdentifier: 'pool'
      },
      {
        name: 'SPLUNK Logs Query 101',
        query: 'error OR failed OR severe OR ( sourcetype=access_* ( 404 OR 500 OR 503 ) )',
        serviceInstanceIdentifier: '_indextime'
      }
    ]
  }
}

export const RowData = {
  healthSourceList: [
    {
      name: 'Health source 101',
      identifier: 'dadsada',
      type: 'AppDynamics',
      spec: {
        connectorRef: 'AppD_Connector',
        feature: 'Application Monitoring',
        applicationName: 'Harness-Dev',
        tierName: 'manager',
        metricPacks: [
          {
            identifier: 'Errors'
          },
          {
            identifier: 'Performance'
          }
        ]
      }
    },
    {
      name: 'Splunk dev 12',
      identifier: 'Splunk_dev',
      type: 'Splunk',
      spec: {
        connectorRef: 'Splunk_Conn',
        feature: 'Cloud Logs',
        queries: [
          {
            name: 'SPLUNK Logs Query',
            query: '*',
            serviceInstanceIdentifier: 'pool'
          },
          {
            name: 'SPLUNK Logs Query 101',
            query: 'error OR failed OR severe OR ( sourcetype=access_* ( 404 OR 500 OR 503 ) )',
            serviceInstanceIdentifier: '_indextime'
          }
        ]
      }
    }
  ]
}
