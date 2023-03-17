/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const monitoredServiceMockData = {
  status: 'SUCCESS',
  data: {
    createdAt: 1669357987964,
    lastModifiedAt: 1677221797740,
    monitoredService: {
      orgIdentifier: 'cvng',
      projectIdentifier: 'templatetesting',
      identifier: 'AppD_monsoon1',
      name: 'AppD_monsoon1',
      type: 'Application',
      description: '',
      serviceRef: 'AppD',
      environmentRef: 'monsoon1',
      environmentRefList: ['monsoon1'],
      tags: {},
      sources: {
        healthSources: [
          {
            name: 'AppD for SLO 2 metric',
            identifier: 'AppD_for_SLO_2_metric',
            type: 'AppDynamics',
            spec: {
              connectorRef: 'account.appdtest',
              metricPacks: [{ identifier: 'Performance' }, { identifier: 'Errors' }],
              feature: 'Application Monitoring',
              applicationName: 'Harness-Dev',
              tierName: 'manager',
              metricDefinitions: [
                {
                  identifier: 'appdMetric_2',
                  metricName: 'appdMetric 2',
                  riskProfile: { category: 'Errors', thresholdTypes: [] },
                  analysis: {
                    liveMonitoring: { enabled: false },
                    deploymentVerification: { enabled: false },
                    riskProfile: { category: 'Errors', thresholdTypes: [] }
                  },
                  sli: { enabled: true },
                  groupName: 'Group 2',
                  completeMetricPath: 'Overall Application Performance|manager|Calls per Minute'
                },
                {
                  identifier: 'appdMetric_1',
                  metricName: 'appdMetric 1',
                  riskProfile: { category: 'Errors', thresholdTypes: [] },
                  analysis: {
                    liveMonitoring: { enabled: false },
                    deploymentVerification: { enabled: false },
                    riskProfile: { category: 'Errors', thresholdTypes: [] }
                  },
                  sli: { enabled: true },
                  groupName: 'Group 1',
                  completeMetricPath: 'Overall Application Performance|manager|Error Page Redirects per Minute'
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
      dependencies: [],
      notificationRuleRefs: [],
      enabled: true
    }
  },
  correlationId: 'f3c4494c-0577-493d-b450-4de6a9f560c3'
}

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
