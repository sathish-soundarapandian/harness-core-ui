/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const SourceDataMock = {
  isEdit: true,
  healthSourceList: [
    {
      name: 'Test  AppD  101',
      identifier: 'Test_AppD_101',
      type: 'AppDynamics',
      spec: {
        connectorRef: 'AppD_Connector_102',
        feature: 'Application Monitoring',
        appdApplicationName: 'Harness-CI-Manager',
        appdTierName: 'manager',
        metricPacks: [{ identifier: 'Errors' }]
      },
      service: 'AppDService',
      environment: 'AppDTestEnv'
    }
  ],
  environmentName: 'AppDTestEnv',
  environmentIdentifier: 'AppDTestEnv',
  serviceName: 'AppDService',
  serviceIdentifier: 'AppDService',
  monitoringSourceName: 'Test Monitored service ',
  monitoredServiceIdentifier: 'Test_Monitored_service',
  product: 'Application Monitoring',
  appdApplicationName: 'Harness-CI-Manager',
  appdTierName: 'manager',
  metricPacks: [{ identifier: 'Errors' }],
  healthSourceName: 'Test  AppD  101',
  healthSourceIdentifier: 'Test_AppD_101',
  sourceType: 'AppDynamics',
  connectorRef: 'AppD_Connector_102'
}

export const expectedResponse = {}

export const workspaceMock = {
  data: [
    {
      name: 'Workspace 1',
      workspaceId: 'sjksm43455n-34x53c45vdssd-fgdfd232sdfad'
    }
  ]
}

export const workspaceIdqueryParamsExpected = {
  queryParams: {
    accountId: '1234_accountId',
    connectorIdentifier: 'abc',
    orgIdentifier: '1234_org',
    projectIdentifier: 'abc',
    region: 'region 1',
    tracingId: expect.any(String)
  }
}
