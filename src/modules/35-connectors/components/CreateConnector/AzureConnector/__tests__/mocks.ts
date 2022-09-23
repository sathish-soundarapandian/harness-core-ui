/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { ResponseBoolean } from 'services/cd-ng'

export const mockConnectorSecretKey = {
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

export const mockConnectorSecretFile = {
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
              type: 'Certificate',
              spec: {
                certificateRef: 'account.mnfbjfjsecretKey'
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

export const mockConnectorUserManagedIdentity = {
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
          type: 'InheritFromDelegate',
          spec: {
            auth: {
              type: 'UserAssignedManagedIdentity',
              spec: {
                clientId: 'clientId'
              }
            }
          }
        },
        azureEnvironmentType: 'AZURE'
      }
    },
    status: null,
    harnessManaged: false
  }
}

export const mockConnectorSystemManagedIdentity = {
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
          type: 'InheritFromDelegate',
          spec: {
            auth: {
              type: 'SystemAssignedManagedIdentity'
            }
          }
        },
        azureEnvironmentType: 'AZURE'
      }
    },
    status: null,
    harnessManaged: false
  }
}

export const hostedMock = {
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
        azureEnvironmentType: 'AZURE',
        executeOnDelegate: false
      }
    },
    status: null,
    harnessManaged: false
  }
}

export const delegateMock = {
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
        azureEnvironmentType: 'AZURE',
        executeOnDelegate: true
      }
    },
    status: null,
    harnessManaged: false
  }
}

export const mockSecret = {
  status: 'SUCCESS',
  data: {
    secret: {
      type: 'SecretText',
      name: 'connectorPass',
      identifier: 'connectorPass',
      tags: {},
      description: '',
      spec: { secretManagerIdentifier: 'harnessSecretManager' }
    },
    createdAt: 1606373702954,
    updatedAt: 1606373702954,
    draft: false
  },
  metaData: null,
  correlationId: '0346aa2b-290e-4892-a7f0-4ad2128c9829'
}

export const mockResponse: ResponseBoolean = {
  status: 'SUCCESS',
  data: true,
  metaData: {},
  correlationId: ''
}
