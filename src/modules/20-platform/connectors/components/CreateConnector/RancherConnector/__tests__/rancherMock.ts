import type { ResponseBoolean } from 'services/cd-ng'

export const mockSecret = {
  status: 'SUCCESS',
  data: {
    secret: {
      type: 'SecretText',
      name: 'rancherServiceToken',
      identifier: 'rancherServiceToken',
      tags: {},
      description: '',
      spec: { secretManagerIdentifier: 'harnessSecretManager', valueType: 'Inline', value: null }
    },
    createdAt: 1606279700000,
    updatedAt: 1606279700000,
    draft: false
  },
  metaData: null,
  correlationId: 'testCorrelationId'
}

export const mockResponse: ResponseBoolean = {
  status: 'SUCCESS',
  data: true,
  metaData: {},
  correlationId: ''
}

export const usernamePassword = {
  name: 'rancher',
  identifier: 'rancher',
  description: 'rancher description',
  orgIdentifier: undefined,
  projectIdentifier: undefined,
  tags: { rancher: '' },
  type: 'Rancher',
  spec: {
    delegateSelectors: ['dummyDelegateSelector'],
    credential: {
      type: 'ManualConfig',
      spec: {
        rancherUrl: 'https://urlrancher.com',
        auth: {
          type: 'Bearer Token',
          spec: {
            passwordRef: 'account.rancehrServiceToken'
          }
        }
      }
    }
  }
}

export const serviceAccount = {
  name: 'rancher',
  identifier: 'rancher',
  description: 'rancher description',
  orgIdentifier: undefined,
  projectIdentifier: undefined,
  tags: { k8: '' },
  type: 'Rancher',
  spec: {
    delegateSelectors: ['dummyDelegateSelector'],
    credential: {
      type: 'ManualConfig',
      spec: {
        rancherUrl: 'https://url.com',
        auth: { type: 'ServiceAccount', spec: { serviceAccountTokenRef: 'account.rancehrServiceToken' } }
      }
    }
  }
}

export const backButtonMock = {
  name: 'rancher',
  identifier: 'rancherId',
  description: 'rancher description',
  orgIdentifier: undefined,
  projectIdentifier: undefined,
  tags: { rancher: '' },
  type: 'Rancher',
  spec: {
    credential: {
      type: 'ManualConfig',
      spec: {
        rancherUrl: 'https://urlrancher.com',
        auth: { type: 'Bearer Token', spec: { passwordRef: 'account.rancherServiceToken' } }
      }
    }
  }
}
