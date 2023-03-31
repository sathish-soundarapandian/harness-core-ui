/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const mockData = {
  metadata: {},
  resource: {
    totalPages: 1,
    totalItems: 4,
    pageItemCount: 4,
    pageSize: 10,
    content: [
      {
        id: 'b9PIVuCSQJGd2pA2fE5YVA',
        accountId: 'kmpySmUISimoRrJL6NL73w',
        orgIdentifier: 'CVNG',
        projectIdentifier: 'DemoDataProject',
        serviceIdentifier: 'service1',
        serviceName: 'service12',
        envIdentifier: 'env1',
        environmentName: 'env11',
        name: 'Kubernetes Deployment event',
        changeSourceIdentifier: 'k8s',
        eventTime: 1634650547505,
        category: 'Infrastructure',
        type: 'K8sCluster'
      },
      {
        id: '0bt8b4CBTcugX-rORQp9SA',
        accountId: 'kmpySmUISimoRrJL6NL73w',
        orgIdentifier: 'CVNG',
        projectIdentifier: 'DemoDataProject',
        serviceIdentifier: 'AppDService101',
        serviceName: 'AppDService1012',
        envIdentifier: 'AppDTestEnv1',
        environmentName: 'AppDTestEnv1-1',
        name: 'Deployment of manager in prod HarnessCD',
        changeSourceIdentifier: 'CurGenCD',
        eventTime: 1634649907184,
        category: 'Deployment',
        type: 'HarnessCD'
      },
      {
        id: 'OYg1Rz6sQDigjpRUKaheqA',
        accountId: 'kmpySmUISimoRrJL6NL73w',
        orgIdentifier: 'CVNG',
        projectIdentifier: 'DemoDataProject',
        serviceIdentifier: 'service1',
        serviceName: 'service132',
        envIdentifier: 'env1',
        environmentName: 'environ',
        name: 'Deployment of manager in prod HarnessCDNextGen',
        changeSourceIdentifier: 'harness_cd_next_gen',
        eventTime: 1634648718481,
        category: 'Deployment',
        type: 'HarnessCDNextGen'
      },
      {
        id: 'Wz75tpRlTVeacqcEhTXqRA',
        accountId: 'kmpySmUISimoRrJL6NL73w',
        orgIdentifier: 'CVNG',
        projectIdentifier: 'DemoDataProject',
        serviceIdentifier: 'AppDService101',
        serviceName: 'AppDService1012',
        envIdentifier: 'AppDTestEnv1',
        environmentName: 'environ1',
        name: 'Demo Test PD',
        changeSourceIdentifier: 'PagerDuty',
        eventTime: 1634648078986,
        category: 'Alert',
        type: 'PagerDuty'
      }
    ],
    pageIndex: 0,
    empty: false
  },
  responseMessages: []
}

const content = []
for (let index = 0; index < 50; index++) {
  content.push({})
}

export const mockPaginatedData = {
  metadata: {},
  resource: {
    totalPages: 5,
    totalItems: 50,
    pageItemCount: 1,
    pageSize: 10,
    content,
    pageIndex: 0,
    empty: false
  },
  responseMessages: []
}

export const initialFilterPayload = {
  queryParamStringifyOptions: { arrayFormat: 'repeat' },
  queryParams: {
    changeCategories: ['Deployment', 'Infrastructure', 'Alert', 'FeatureFlag', 'ChaosExperiment'],
    changeSourceTypes: [
      'HarnessCDNextGen',
      'HarnessCD',
      'K8sCluster',
      'PagerDuty',
      'HarnessFF',
      'HarnessCE',
      'CustomDeploy',
      'CustomInfrastructure',
      'CustomIncident',
      'CustomFF'
    ],
    endTime: expect.any(Number),
    envIdentifiers: [],
    pageIndex: 0,
    pageSize: 25,
    serviceIdentifiers: [],
    startTime: expect.any(Number)
  }
}

export const filterPayloadWithENV = {
  queryParamStringifyOptions: { arrayFormat: 'repeat' },
  queryParams: {
    changeCategories: ['Deployment', 'Infrastructure', 'Alert', 'FeatureFlag', 'ChaosExperiment'],
    changeSourceTypes: [
      'HarnessCDNextGen',
      'HarnessCD',
      'K8sCluster',
      'PagerDuty',
      'HarnessFF',
      'HarnessCE',
      'CustomDeploy',
      'CustomInfrastructure',
      'CustomIncident',
      'CustomFF'
    ],
    endTime: expect.any(Number),
    envIdentifiers: ['env1'],
    pageIndex: 0,
    pageSize: 25,
    serviceIdentifiers: ['AppDService101'],
    startTime: expect.any(Number)
  }
}
