/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const services = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 1,
    pageItemCount: 1,
    pageSize: 100,
    content: [
      {
        service: {
          accountId: 'AQ8xhfNCRtGIUjq5bSM8Fg',
          identifier: 'sample_service_1658515110913',
          orgIdentifier: 'default',
          projectIdentifier: 'asdsaff',
          name: 'sample_service',
          description: null,
          deleted: false,
          tags: {},
          version: 0
        },
        createdAt: 1658515110913,
        lastModifiedAt: 1624079631940
      }
    ]
  }
}

export const environments = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 1,
    pageItemCount: 1,
    pageSize: 100,
    content: [
      {
        environment: {
          accountId: 'AQ8xhfNCRtGIUjq5bSM8Fg',
          orgIdentifier: 'default',
          projectIdentifier: 'asdasd',
          identifier: 'gjhjghjhg',
          name: 'gjhjghjhg',
          description: null,
          color: '#0063F7',
          type: 'PreProduction',
          deleted: false,
          tags: {},
          version: 1
        },
        createdAt: 1624020290070,
        lastModifiedAt: 1624020290070
      }
    ]
  }
}

export const infrastructures = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 1,
    pageItemCount: 1,
    pageSize: 100,
    content: [
      {
        infrastructure: {
          accountId: 'AQ8xhfNCRtGIUjq5bSM8Fg',
          identifier: 'sample_infrastructure_1658585840666',
          orgIdentifier: 'default',
          projectIdentifier: 'asdasd',
          environmentRef: 'sample_environment_1658585840666',
          name: 'sample_infrastructure',
          description: '',
          tags: {},
          type: 'KubernetesDirect'
        },
        createdAt: 1658585841657,
        lastModifiedAt: 1658585841657
      }
    ]
  }
}

export const repos = [
  {
    namespace: 'harness',
    name: 'aaGit'
  },
  {
    namespace: 'harness',
    name: 'adithyaTestRepo'
  },
  {
    namespace: 'harness',
    name: 'agent-gateway'
  }
]

export const mockSecretList = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 3,
    pageItemCount: 3,
    pageSize: 100,
    content: [
      {
        secret: {
          type: 'SecretText',
          name: 'mockSecret',
          identifier: 'mockSecret',
          tags: {},
          description: '',
          spec: {
            secretManagerIdentifier: 'harnessSecretManager',
            valueType: 'Inline',
            value: null
          }
        },
        createdAt: 1604055063891,
        updatedAt: 1604055063891
      }
    ]
  }
}

export const mockData = { metaData: {}, resource: ['delegate-selector-sample', 'primary'], responseMessages: [] }

export const mockedDelegates = {
  metaData: {},
  resource: {
    delegateGroupDetails: [
      {
        groupId: 'nhJQFrnqRsibPbQR1Erl8g',
        delegateType: 'KUBERNETES',
        groupName: 'delegate-sample-name-1',
        groupHostName: 'delegate-sample-name-1-{n}',
        delegateConfigurationId: 'o7ObEntuSuWdnOOrY8Cy1Q',
        groupImplicitSelectors: {
          'primary configuration': 'PROFILE_NAME',
          'delegate-sample-name-1': 'DELEGATE_NAME'
        },
        delegateInsightsDetails: { insights: [] },
        lastHeartBeat: 1623575011349,
        activelyConnected: false,
        delegateInstanceDetails: []
      },
      {
        groupId: 'nhJQFrnqRsibPbQR1Erl8g',
        delegateType: 'KUBERNETES',
        groupName: 'delegate-sample-name-2',
        groupHostName: 'delegate-sample-name-2-{n}',
        delegateConfigurationId: 'o7ObEntuSuWdnOOrY8Cy1Q',
        groupImplicitSelectors: {
          'primary configuration': 'PROFILE_NAME',
          'delegate-sample-name-2': 'DELEGATE_NAME'
        },
        delegateInsightsDetails: { insights: [] },
        lastHeartBeat: 1623575011349,
        activelyConnected: false,
        delegateInstanceDetails: []
      }
    ]
  },
  responseMessages: []
}

// export const usernamePassword: ConnectorInfoDTO = {
//   name: 'connector2',
//   identifier: 'connector2',
//   description: 'k8 description',
//   orgIdentifier: undefined,
//   projectIdentifier: undefined,
//   tags: { k8: '' },
//   type: 'K8sCluster',
//   spec: {
//     delegateSelectors: ['dummyDelegateSelector'],
//     credential: {
//       type: 'ManualConfig',
//       spec: {
//         masterUrl: 'dummyMasterUrl',
//         auth: {
//           type: 'UsernamePassword',
//           spec: {
//             username: 'dummyusername',
//             usernameRef: undefined,
//             passwordRef: 'account.k8serviceToken'
//           }
//         }
//       }
//     }
//   }
// }
