/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { ConnectorInfoDTO, ResponseBoolean } from 'services/cd-ng'

export const usernamePassword: ConnectorInfoDTO = {
  name: 'BitbucketWorking',
  identifier: 'BitbucketWorking',
  description: 'Bitbucket description',
  orgIdentifier: undefined,
  projectIdentifier: undefined,
  tags: {},
  type: 'Bitbucket',
  spec: {
    delegateSelectors: ['dummyDelegateSelector'],
    url: 'https://github.com/dev',
    authentication: {
      type: 'Http',
      spec: {
        type: 'UsernamePassword',
        spec: { username: 'dev', usernameRef: undefined, passwordRef: 'account.githubPassword' }
      }
    },
    type: 'Account',
    validationRepo: 'test',
    executeOnDelegate: true
  }
}

export const hostedMock: ConnectorInfoDTO = {
  name: 'BitbucketWorking',
  identifier: 'BitbucketWorking',
  description: 'Bitbucket description',
  orgIdentifier: undefined,
  projectIdentifier: undefined,
  tags: {},
  type: 'Bitbucket',
  spec: {
    url: 'https://github.com/dev',
    authentication: {
      type: 'Http',
      spec: {
        type: 'UsernamePassword',
        spec: { username: 'dev', usernameRef: undefined, passwordRef: 'account.githubPassword' }
      }
    },
    type: 'Account',
    validationRepo: 'test',
    executeOnDelegate: false
  }
}

export const backButtonMock: ConnectorInfoDTO = {
  name: 'dummy bitbucket name',
  identifier: 'dummyBitbucketIdentifier',
  description: 'dummy bitbucket description',
  orgIdentifier: '',
  projectIdentifier: '',
  tags: {},
  type: 'Bitbucket',
  spec: {
    url: 'https://github.com/dev',
    authentication: {
      type: 'Http',
      spec: {
        type: 'UsernamePassword',
        spec: { username: 'dev', usernameRef: null, passwordRef: 'account.githubPassword' }
      }
    },
    apiAccess: null,
    type: 'Account',
    validationRepo: 'test'
  }
}

export const usernameTokenWithAPIAccess: ConnectorInfoDTO = {
  name: 'BitbucketWorking',
  identifier: 'BitbucketWorking',
  description: 'Bitbucket description',
  orgIdentifier: undefined,
  projectIdentifier: undefined,
  tags: {},
  type: 'Bitbucket',
  spec: {
    delegateSelectors: ['dummyDelegateSelector'],
    url: 'https://github.com/dev',
    authentication: {
      type: 'Http',
      spec: {
        type: 'UsernamePassword',
        spec: { username: 'dev', usernameRef: undefined, passwordRef: 'account.githubPassword' }
      }
    },
    apiAccess: {
      type: 'UsernameToken',
      spec: { username: 'dev', usernameRef: undefined, tokenRef: 'account.githubPassword' }
    },
    type: 'Account',
    validationRepo: 'test',
    executeOnDelegate: true
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
