/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { ResponseBoolean, ConnectorInfoDTO } from 'services/cd-ng'

export const usernamePassword: ConnectorInfoDTO = {
  name: 'k87',
  identifier: 'k8',
  description: 'k8 description',
  orgIdentifier: undefined,
  projectIdentifier: undefined,
  tags: { k8: '' },
  type: 'K8sCluster',
  spec: {
    delegateSelectors: ['dummyDelegateSelector'],
    credential: {
      type: 'ManualConfig',
      spec: {
        masterUrl: 'https://url.com',
        auth: {
          type: 'UsernamePassword',
          spec: {
            username: 'dev',
            usernameRef: undefined,
            passwordRef: 'account.k8serviceToken'
          }
        }
      }
    }
  }
}

export const serviceAccount: ConnectorInfoDTO = {
  name: 'k8Connector',
  identifier: 'k8',
  description: 'k8 description',
  orgIdentifier: undefined,
  projectIdentifier: undefined,
  tags: { k8: '' },
  type: 'K8sCluster',
  spec: {
    delegateSelectors: ['dummyDelegateSelector'],
    credential: {
      type: 'ManualConfig',
      spec: {
        masterUrl: 'https://url.com',
        auth: { type: 'ServiceAccount', spec: { serviceAccountTokenRef: 'account.k8serviceToken' } }
      }
    }
  }
}

export const oidcMock: ConnectorInfoDTO = {
  name: 'k8Connector',
  identifier: 'k8Connector',
  description: 'k8 description',
  orgIdentifier: undefined,
  projectIdentifier: undefined,
  tags: { k8: '' },
  type: 'K8sCluster',
  spec: {
    delegateSelectors: ['dummyDelegateSelector'],
    credential: {
      type: 'ManualConfig',
      spec: {
        masterUrl: 'https://url.com',
        auth: {
          type: 'OpenIdConnect',
          spec: {
            oidcIssuerUrl: 'issueUrl',
            oidcUsername: 'OIDC username ',
            oidcClientIdRef: 'account.clientKey',
            oidcPasswordRef: 'clientPassphrase',
            oidcSecretRef: 'org.k8certificate',
            oidcScopes: 'account'
          }
        }
      }
    }
  }
}

export const clientKeyMock: ConnectorInfoDTO = {
  name: 'k8Connector',
  identifier: 'k8',
  description: 'k8 description',
  orgIdentifier: undefined,
  projectIdentifier: undefined,
  tags: { k8: '' },
  type: 'K8sCluster',
  spec: {
    delegateSelectors: ['dummyDelegateSelector'],
    credential: {
      type: 'ManualConfig',
      spec: {
        masterUrl: 'https://url.com',
        auth: {
          type: 'ClientKeyCert',
          spec: {
            caCertRef: 'account.b12',
            clientCertRef: 'account.b13',
            clientKeyRef: 'account.k8serviceToken',
            clientKeyPassphraseRef: 'account.k8serviceToken',
            clientKeyAlgo: 'somevalue'
          }
        }
      }
    }
  }
}

export const backButtonMock: ConnectorInfoDTO = {
  name: 'dummy k8 name',
  identifier: 'dummyK8Identifier',
  description: 'dummy k8 description',
  orgIdentifier: undefined,
  projectIdentifier: undefined,
  tags: { k8: '' },
  type: 'K8sCluster',
  spec: {
    credential: {
      type: 'ManualConfig',
      spec: {
        masterUrl: 'https://url.com',
        auth: { type: 'UsernamePassword', spec: { username: 'dev', passwordRef: 'account.k8serviceToken' } }
      }
    }
  }
}

export const mockSecret = {
  status: 'SUCCESS',
  data: {
    secret: {
      type: 'SecretText',
      name: 'k8serviceToken',
      identifier: 'k8serviceToken',
      tags: {},
      description: '',
      spec: { secretManagerIdentifier: 'harnessSecretManager', valueType: 'Inline', value: null }
    },
    createdAt: 1606279738238,
    updatedAt: 1606279738238,
    draft: false
  },
  metaData: null,
  correlationId: 'testCorrelationId'
}

export const projectMockSecret = {
  status: 'SUCCESS',
  data: {
    secret: {
      type: 'SecretText',
      name: 'projectlevel',
      identifier: 'projectlevel',
      orgIdentifier: 'OrgOneTwo',
      projectIdentifier: 'hello',
      tags: {},
      description: '',
      spec: { secretManagerIdentifier: 'harnessSecretManager', valueType: 'Inline', value: null }
    },
    createdAt: 1608744768482,
    updatedAt: 1608744768482,
    draft: false
  },
  metaData: null,
  correlationId: 'd8ceee4f-5bae-4c17-8dff-09e954dbbe46'
}
export const orgtMockSecret = {
  status: 'SUCCESS',
  data: {
    secret: {
      type: 'SecretText',
      name: 'projectlevel',
      identifier: 'projectlevel',
      orgIdentifier: 'OrgOneTwo',
      tags: {},
      description: '',
      spec: { secretManagerIdentifier: 'harnessSecretManager', valueType: 'Inline', value: null }
    },
    createdAt: 1608744768482,
    updatedAt: 1608744768482,
    draft: false
  },
  metaData: null,
  correlationId: 'd8ceee4f-5bae-4c17-8dff-09e954dbbe46'
}

export const mockResponse: ResponseBoolean = {
  status: 'SUCCESS',
  data: true,
  metaData: {},
  correlationId: ''
}
