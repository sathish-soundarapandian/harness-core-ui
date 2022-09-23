/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const mockedMonitoredServiceData = {
  status: 'SUCCESS',
  data: [
    {
      identifier: 'Service_101_QA',
      name: 'Service_101_QA',
      healthSources: [
        { name: 'Test AppD 102', identifier: 'Test_AppD' },
        { name: 'dasdasdas', identifier: 'dasdasdas' },
        { name: 'Promethus', identifier: 'dasdsadsa' }
      ]
    },
    {
      identifier: 'Service_102_QA',
      name: 'Service_102_QA',
      healthSources: [{ name: 'Test AppD', identifier: 'Test_AppD' }]
    }
  ],
  metaData: {},
  correlationId: '6ad5972a-c382-46dc-a0d4-263ba5806db8'
}

export const mockedMonitoredServiceDataWithNullData = {
  status: 'SUCCESS',
  data: [
    {
      identifier: 'Service_101_QA',
      name: 'Service_101_QA',
      healthSources: [
        { name: 'Test AppD 102', identifier: 'Test_AppD' },
        { name: 'dasdasdas', identifier: 'dasdasdas' },
        { name: 'Promethus', identifier: 'dasdsadsa' }
      ]
    },
    {
      identifier: 'Service_102_QA',
      name: 'Service_102_QA',
      healthSources: [{ name: 'Test AppD', identifier: 'Test_AppD' }]
    },
    {
      identifier: 'Service_102_QA',
      name: null,
      healthSources: [{ name: 'Test AppD', identifier: 'Test_AppD' }]
    }
  ],
  metaData: {},
  correlationId: '6ad5972a-c382-46dc-a0d4-263ba5806db8'
}

export const mockedMonitoredService = {
  orgIdentifier: 'CVNG',
  projectIdentifier: 'chidemo',
  identifier: 'checkout_ddscsdcdsc',
  name: 'checkout_ddscsdcdsc',
  type: 'Application',
  description: '',
  serviceRef: 'checkout',
  environmentRef: 'ddscsdcdsc',
  environmentRefList: ['ddscsdcdsc'],
  tags: {},
  sources: {
    healthSources: [
      {
        name: 'NR-1',
        identifier: 'NR1',
        type: 'NewRelic',
        spec: {
          connectorRef: 'account.NewRelic123Test',
          applicationName: 'My Application',
          applicationId: '107019083',
          feature: 'apm',
          metricPacks: [
            {
              identifier: 'Performance'
            }
          ],
          newRelicMetricDefinitions: [
            {
              identifier: 'New_Relic_Metric',
              metricName: 'New Relic Metric',
              riskProfile: {
                category: 'Errors',
                metricType: null,
                thresholdTypes: []
              },
              analysis: {
                liveMonitoring: {
                  enabled: false
                },
                deploymentVerification: {
                  enabled: false,
                  serviceInstanceFieldName: null,
                  serviceInstanceMetricPath: null
                },
                riskProfile: {
                  category: 'Errors',
                  metricType: null,
                  thresholdTypes: []
                }
              },
              sli: {
                enabled: true
              },
              groupName: 'group-1',
              nrql: "SELECT average(`apm.service.transaction.duration`) FROM Metric WHERE appName = 'My Application' TIMESERIES",
              responseMapping: {
                metricValueJsonPath: '$.timeSeries.[*].results.[*].average',
                timestampJsonPath: '$.timeSeries.[*].endTimeSeconds',
                serviceInstanceJsonPath: null,
                timestampFormat: null
              }
            }
          ],
          metricDefinitions: [
            {
              identifier: 'New_Relic_Metric',
              metricName: 'New Relic Metric',
              riskProfile: {
                category: 'Errors',
                metricType: null,
                thresholdTypes: []
              },
              analysis: {
                liveMonitoring: {
                  enabled: false
                },
                deploymentVerification: {
                  enabled: false,
                  serviceInstanceFieldName: null,
                  serviceInstanceMetricPath: null
                },
                riskProfile: {
                  category: 'Errors',
                  metricType: null,
                  thresholdTypes: []
                }
              },
              sli: {
                enabled: true
              },
              groupName: 'group-1',
              nrql: "SELECT average(`apm.service.transaction.duration`) FROM Metric WHERE appName = 'My Application' TIMESERIES",
              responseMapping: {
                metricValueJsonPath: '$.timeSeries.[*].results.[*].average',
                timestampJsonPath: '$.timeSeries.[*].endTimeSeconds',
                serviceInstanceJsonPath: null,
                timestampFormat: null
              }
            }
          ]
        }
      }
    ],
    changeSources: [
      {
        name: 'Harness CD Next Gen',
        identifier: 'harness_cd_next_gen',
        type: 'HarnessCDNextGen',
        enabled: true,
        spec: {},
        category: 'Deployment'
      }
    ]
  },
  dependencies: []
}

export const expectedMonitoredServiceOptions = [
  {
    label: 'Service_101_QA',
    value: 'Service_101_QA'
  },
  {
    label: 'Service_102_QA',
    value: 'Service_102_QA'
  }
]

export const expectedHealthSourcesOptions = [{ label: 'Test AppD', value: 'Test_AppD' }]
