/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { ConnectorInfoDTO, ResponseBoolean } from 'services/cd-ng'

export const usernamePassword: ConnectorInfoDTO = {
  name: 'dumyGit',
  identifier: 'dumyGit',
  description: '',
  orgIdentifier: undefined,
  projectIdentifier: undefined,
  tags: {},
  type: 'Git',
  spec: {
    delegateSelectors: ['dummyDelegateSelector'],
    url: 'http://www.github.com/',
    type: 'Http',
    connectionType: 'Account',
    validationRepo: 'test',
    spec: { username: 'dev', usernameRef: undefined, passwordRef: 'account.connectorPass' },
    executeOnDelegate: true
  }
}

export const backButtonMock: ConnectorInfoDTO = {
  name: 'dummy git name',
  identifier: 'dummyGitIdentifier',
  description: 'dummy git description',
  orgIdentifier: '',
  projectIdentifier: '',
  tags: {},
  type: 'Git',
  spec: {
    url: 'dumyGitUrl',
    branchName: 'master',
    type: 'Http',
    connectionType: 'Account',
    validationRepo: 'test',
    spec: { username: 'dev', passwordRef: 'account.connectorPass' },
    gitSync: { enabled: false, customCommitAttributes: null, syncEnabled: false }
  }
}

export const mockSecret = {
  status: 'SUCCESS',
  data: {
    secret: {
      type: 'SecretText',
      name: 'ConnectorPass',
      identifier: 'connectorPass',
      tags: {},
      description: 'for git connector',
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
