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
    totalItems: 5,
    pageItemCount: 5,
    pageSize: 10,
    content: [
      {
        id: 'b9PIVuCSQJGd2pA2fE5YVA',
        accountId: 'kmpySmUISimoRrJL6NL73w',
        orgIdentifier: 'CVNG',
        projectIdentifier: 'DemoDataProject',
        serviceIdentifier: 'k8smanager',
        serviceName: 'k8s-manager',
        envIdentifier: 'prod',
        environmentName: 'prod',
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
        serviceIdentifier: 'manager',
        serviceName: 'manager',
        envIdentifier: 'prod',
        environmentName: 'prod',
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
        serviceIdentifier: 'manager',
        serviceName: 'manager',
        envIdentifier: 'prod',
        environmentName: 'prod',
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
        serviceIdentifier: 'manager',
        serviceName: 'manager',
        envIdentifier: 'prod',
        environmentName: 'prod',
        name: 'Demo Test PD',
        changeSourceIdentifier: 'pageduty',
        eventTime: 1634648078986,
        category: 'Alert',
        type: 'PagerDuty'
      },
      {
        id: 'Wz75tpRlTVeacqcEhTXqRA',
        accountId: 'kmpySmUISimoRrJL6NL73w',
        orgIdentifier: 'default',
        projectIdentifier: 'demokaran',
        serviceIdentifier: 'demoservice',
        serviceName: 'demo-service',
        envIdentifier: 'demoenv',
        environmentName: 'demo-env',
        name: 'CV Trial Limit',
        changeSourceIdentifier: 'featureFlag',
        eventTime: 1633961702460,
        category: 'FeatureFlag',
        type: 'HARNESS_FF'
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
