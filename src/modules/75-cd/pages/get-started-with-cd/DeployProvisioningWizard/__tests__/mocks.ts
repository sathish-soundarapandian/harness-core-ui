/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { TestStatus } from '@common/components/TestConnectionWidget/TestConnectionWidget'

export const contextValues = {
  state: {
    service: {
      name: 'sample_service',
      identifier: 'sample_service',
      data: {
        repoValues: {
          name: 'adithyaTestRepo',
          namespace: 'harness'
        },
        artifactType: '',
        workloadType: '',
        gitValues: {},
        gitConnectionStatus: TestStatus.SUCCESS
      }
    },
    environment: {
      name: 'sample_environment',
      identifier: 'sample_environment',
      type: 'PreProduction' as 'PreProduction' | 'Production'
    },
    infrastructure: {
      name: 'sample_infrastructure',
      identifier: 'sample_infrastructure',
      infrastructureDefinition: {}
    }
  },
  saveServiceData: jest.fn(),
  saveEnvironmentData: jest.fn(),
  saveInfrastructureData: jest.fn()
}

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

export const updateConnector = jest.fn()
export const createConnector = jest.fn(() =>
  Promise.resolve({
    status: 'SUCCESS',
    data: {
      connector: {
        name: 'test git connector',
        identifier: 'test_git_connector',
        type: 'Github',
        spec: {
          dockerRegistryUrl: 'https;//github.com',
          auth: {
            type: 'UsernamePassword',
            spec: { username: 'testpass', passwordRef: 'account.testpass' }
          }
        }
      },
      createdAt: 1607289652713,
      lastModifiedAt: 1607289652713
    }
  })
)

export const updateService = jest.fn(() =>
  Promise.resolve({
    status: 'SUCCESS',
    data: {
      service: {
        accountId: 'AQ8xhfNCRtGIUjq5bSM8Fg',
        identifier: 'sample_service_1658515110913',
        orgIdentifier: 'default',
        projectIdentifier: 'Jira',
        name: 'sample_service',
        description: '',
        deleted: false,
        tags: {},
        yaml: 'service:\n    name: sample_service\n    identifier: sample_service_1658515110913\n    description: ""\n    tags: {}\n    gitOpsEnabled: false\n    serviceDefinition:\n        type: Kubernetes\n        spec:\n            manifests:\n                - manifest:\n                      identifier: manifestName\n                      type: K8sManifest\n                      spec:\n                          store:\n                              spec:\n                                  gitFetchType: Branch\n                                  paths:\n                                      - test-path\n                                  branch: CDS-1234\n                                  repoName: wings-software/wingsui\n                                  connectorRef: account.Github\n                              type: Github\n                          valuesPaths: []\n                          skipResourceVersioning: false\n'
      },
      createdAt: 1658515110913,
      lastModifiedAt: 1624079631940
    }
  })
)

export const updatedInfra = jest.fn(() =>
  Promise.resolve({
    status: 'SUCCESS',
    data: {
      infrastructure: {
        accountId: 'px7xd_BFRCi-pfWPYXVjvw',
        identifier: 'sample_infrastructure_1658642798969',
        orgIdentifier: 'default',
        projectIdentifier: 'Jira',
        environmentRef: 'sample_environment_1658642798969',
        name: 'sample_infrastructure',
        description: '',
        tags: {},
        type: 'KubernetesDirect',
        yaml: 'infrastructureDefinition:\n  name: "sample_infrastructure"\n  identifier: "sample_infrastructure_1658642798969"\n  orgIdentifier: "default"\n  projectIdentifier: "Jira"\n  environmentRef: "sample_environment_1658642798969"\n  description: ""\n  tags: {}\n  allowSimultaneousDeployments: false\n  type: "KubernetesDirect"\n  spec:\n    connectorRef: "dfg_1658642333088"\n    namespace: "sample_namespace"\n    releaseName: "release-<+INFRA_KEY>"\n'
      },
      createdAt: 1658642799889,
      lastModifiedAt: 1658642799889
    },
    metaData: null
  })
)

export const connectionTestResult = jest.fn(() => {
  Promise.resolve({
    status: 'SUCCESS',
    data: {
      status: 'SUCCESS',
      errors: null,
      errorSummary: null,
      testedAt: 0,
      delegateId: 'i8hFE4vzRACt_xgXEvPJwg'
    },
    metaData: null,
    correlationId: '27c02970-0353-417d-87b3-e0c235f22591'
  })
})
