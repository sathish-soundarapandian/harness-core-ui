/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { ConnectorInfoDTO, ResponseBoolean } from 'services/cd-ng'

const tokenRef = 'account.githubPassword'

export const backButtonMock: ConnectorInfoDTO = {
  name: 'dummy github name',
  identifier: 'dummyGithubIdentifier',
  description: 'dummy github description',
  orgIdentifier: '',
  projectIdentifier: '',
  tags: {},
  type: 'Github',
  spec: {
    url: 'https://github.com/dev',
    authentication: {
      type: 'Http',
      spec: {
        type: 'UsernameToken',
        spec: { username: 'dev', usernameRef: undefined, tokenRef }
      }
    },
    apiAccess: null,
    type: 'Account',
    validationRepo: 'test'
  }
}

export const usernameTokenWithAPIAccessGithubApp: ConnectorInfoDTO = {
  name: 'GithubWorking1',
  identifier: 'asasas',
  description: 'connector before demo',
  orgIdentifier: undefined,
  projectIdentifier: undefined,
  tags: {},
  type: 'Github',
  spec: {
    delegateSelectors: ['dummyDelegateSelector'],
    executeOnDelegate: true,
    url: 'https://github.com/dev',
    authentication: {
      type: 'Http',
      spec: {
        type: 'UsernameToken',
        spec: { username: 'dev', usernameRef: undefined, tokenRef }
      }
    },
    apiAccess: {
      type: 'GithubApp',
      spec: { installationId: '1234', applicationId: '1234', privateKeyRef: tokenRef }
    },
    type: 'Account',
    validationRepo: 'test'
  }
}

export const usernameTokenWithAPIAccessGithubAppManager: ConnectorInfoDTO = {
  name: 'GithubWorking1',
  identifier: 'asasas',
  description: 'connector before demo',
  orgIdentifier: undefined,
  projectIdentifier: undefined,
  tags: {},
  type: 'Github',
  spec: {
    executeOnDelegate: false,
    url: 'https://github.com/dev',
    authentication: {
      type: 'Http',
      spec: {
        type: 'UsernameToken',
        spec: { username: 'dev', usernameRef: undefined, tokenRef }
      }
    },
    apiAccess: {
      type: 'GithubApp',
      spec: { installationId: '1234', applicationId: '1234', privateKeyRef: tokenRef }
    },
    type: 'Account',
    validationRepo: 'test'
  }
}

export const usernameTokenWithAPIAccessToken: ConnectorInfoDTO = {
  name: 'GithubWorking1',
  identifier: 'asasas',
  description: 'connector before demo',
  orgIdentifier: undefined,
  projectIdentifier: undefined,
  tags: {},
  type: 'Github',
  spec: {
    delegateSelectors: ['dummyDelegateSelector'],
    executeOnDelegate: true,
    url: 'https://github.com/dev',
    authentication: {
      type: 'Http',
      spec: {
        type: 'UsernameToken',
        spec: { username: 'dev', usernameRef: undefined, tokenRef }
      }
    },
    apiAccess: {
      type: 'Token',
      spec: { tokenRef }
    },
    type: 'Account',
    validationRepo: 'test'
  }
}

export const mockSecret = {
  status: 'SUCCESS',
  data: {
    secret: {
      type: 'SecretText',
      name: 'githubPassword',
      identifier: 'githubPassword',
      tags: {},
      description: 'for github connector',
      spec: { secretManagerIdentifier: 'harnessSecretManager', valueType: 'Inline', value: null }
    },
    createdAt: 1608671838510,
    updatedAt: 1608671838510,
    draft: false
  },
  metaData: null,
  correlationId: '349437d7-c6f8-4e14-9b62-64d9acec688d'
}

export const mockResponse: ResponseBoolean = {
  status: 'SUCCESS',
  data: true,
  metaData: {},
  correlationId: ''
}

export const oAuthConnector: ConnectorInfoDTO = {
  name: 'Github OAuth',
  identifier: 'Github_OAuth',
  type: 'Github',
  spec: {
    url: 'https://github.com',
    validationRepo: 'harness/harness-core',
    authentication: {
      type: 'Http',
      spec: {
        type: 'OAuth',
        spec: {
          tokenRef: 'account.harnessoauthaccesstoken_github'
        }
      }
    },
    apiAccess: {
      type: 'OAuth',
      spec: {
        tokenRef: 'account.harnessoauthaccesstoken_github'
      }
    },
    executeOnDelegate: false,
    type: 'Account'
  }
}
