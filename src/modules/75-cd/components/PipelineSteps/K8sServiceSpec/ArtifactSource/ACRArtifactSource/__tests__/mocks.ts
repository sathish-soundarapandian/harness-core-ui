/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const artifacts = {
  sidecars: [
    {
      sidecar: {
        identifier: 'Sidecar',
        type: 'Acr',
        spec: {
          connectorRef: '<+input>',
          subscriptionId: '<+input>',
          registry: '<+input>',
          repository: '<+input>',
          tag: '<+input>'
        }
      }
    }
  ],
  primary: {
    spec: {
      connectorRef: '<+input>',
      subscriptionId: '<+input>',
      registry: '<+input>',
      repository: '<+input>',
      tag: '<+input>'
    },
    type: 'Acr'
  }
}

export const template = {
  artifacts: {
    sidecars: [
      {
        sidecar: {
          identifier: 'Sidecar',
          type: 'Acr',
          spec: {
            connectorRef: '<+input>',
            subscriptionId: '<+input>',
            registry: '<+input>',
            repository: '<+input>',
            tag: '<+input>'
          }
        }
      }
    ],
    primary: {
      spec: {
        connectorRef: '<+input>',
        subscriptionId: '<+input>',
        registry: '<+input>',
        repository: '<+input>',
        tag: '<+input>'
      },
      type: 'Acr'
    }
  }
}

export const artifactsTagRegex = {
  sidecars: [
    {
      sidecar: {
        identifier: 'Sidecar',
        type: 'Acr',
        spec: {
          connectorRef: '<+input>',
          subscriptionId: '<+input>',
          registry: '<+input>',
          repository: '<+input>',
          tagRegex: '<+input>'
        }
      }
    }
  ]
}

export const templateTagRegex = {
  artifacts: {
    sidecars: [
      {
        sidecar: {
          identifier: 'Sidecar',
          type: 'Acr',
          spec: {
            connectorRef: '<+input>',
            subscriptionId: '<+input>',
            registry: '<+input>',
            repository: '<+input>',
            tagRegex: '<+input>'
          }
        }
      }
    ]
  }
}

export const artifactsWithValues = {
  sidecars: [
    {
      sidecar: {
        identifier: 'Sidecar',
        type: 'Acr',
        spec: {
          connectorRef: 'connectorRef',
          subscriptionId: 'subscription',
          registry: 'registry',
          repository: 'repository',
          tag: '<+input>'
        }
      }
    }
  ],
  primary: {
    spec: {
      connectorRef: 'connectorRef',
      subscriptionId: 'subscription',
      registry: 'registry',
      repository: 'repository',
      tag: '<+input>'
    },
    type: 'Acr'
  }
}

export const templateWithValues = {
  artifacts: {
    sidecars: [
      {
        sidecar: {
          identifier: 'Sidecar',
          type: 'Acr',
          spec: {
            connectorRef: 'connectorRef',
            subscriptionId: 'subscription',
            registry: 'registry',
            repository: 'repository',
            tag: '<+input>'
          }
        }
      }
    ],
    primary: {
      spec: {
        connectorRef: 'connectorRef',
        subscriptionId: 'subscription',
        registry: 'registry',
        repository: 'repository',
        tag: '<+input>'
      },
      type: 'Acr'
    }
  }
}

export const mockSubscriptions = {
  data: {
    subscriptions: [
      { subscriptionId: 'sub1', subscriptionName: 'subscription1' },
      { subscriptionId: 'sub2', subscriptionName: 'subscription2' }
    ]
  }
}

export const mockRegistries = {
  data: { registries: [{ registry: 'reg1' }] }
}

export const mockRepositories = {
  data: { repositories: [{ repository: 'rep1' }] }
}

export const path = 'stages[0].stage.spec.serviceConfig.serviceDefinition.spec'

export const mockConnector = {
  status: 'SUCCESS',
  data: {
    connector: {
      name: 'Azure conn test',
      identifier: 'Azure_conn_test',
      description: 'Azure connector test',
      orgIdentifier: undefined,
      projectIdentifier: undefined,
      tags: {},
      type: 'Azure',
      spec: {
        delegateSelectors: ['dummyDelegateSelector'],
        credential: {
          type: 'ManualConfig',
          spec: {
            auth: {
              type: 'Secret',
              spec: {
                secretRef: 'account.mnfbjfjsecretKey'
              }
            },
            applicationId: 'clientId',
            tenantId: 'tenantId'
          }
        },
        azureEnvironmentType: 'AZURE'
      }
    },
    status: null,
    harnessManaged: false
  }
}
