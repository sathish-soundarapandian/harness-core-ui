/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SourceCodeManagerDTO } from 'services/cd-ng'

export const accountIdentifier = 'dummyAccount'

export const mockSecretResponse = {
  status: 'SUCCESS',
  data: {
    secret: {
      type: 'SecretText',
      name: 'dummySecret',
      identifier: 'dummySecret',
      tags: {},
      description: '',
      spec: { secretManagerIdentifier: 'harnessSecretManager', valueType: 'Inline', value: null }
    },
    createdAt: 1645529075591,
    updatedAt: 1645529075591,
    draft: false
  },
  metaData: null,
  correlationId: 'bcad5224-ca67-42f5-a70a-27be3e3f5547'
}

export const mockUsernameTokenAuthFormdata = {
  accessToken: {
    identifier: 'dummySecret',
    name: 'dummySecret',
    referenceString: 'account.dummySecret',
    accountIdentifier
  },
  authType: 'UsernameToken',
  name: 'scmOne',
  username: { value: 'dev', type: 'TEXT' },
  usernamefieldType: 'TEXT',
  usernametextField: 'dev'
}

export const mockUsernamePasswordAuthFormdata = {
  password: {
    identifier: 'dummySecret',
    name: 'dummySecret',
    orgIdentifier: undefined,
    projectIdentifier: undefined,
    referenceString: 'account.dummySecret'
  },
  authType: 'UsernamePassword',
  name: 'scmOne',
  username: { value: 'dev', type: 'TEXT' },
  usernamefieldType: 'TEXT',
  usernametextField: 'dev'
}

export const mockGithubSCM = {
  accountIdentifier,
  authentication: {
    type: 'Http',
    spec: { type: 'UsernameToken', spec: { username: 'dev', usernameRef: null, tokenRef: 'account.dummySecret' } }
  },
  createdAt: 1645529087665,
  id: 'id',
  lastModifiedAt: 1645529087665,
  name: 'scmOne',
  type: 'GITHUB' as SourceCodeManagerDTO['type'],
  userIdentifier: 'userIdentifier'
}

export const mockBitBucketSCM = {
  accountIdentifier,
  authentication: {
    type: 'Http',
    spec: { type: 'UsernamePassword', spec: { username: 'dev', usernameRef: null, passwordRef: 'account.dummySecret' } }
  },
  createdAt: 1645529087665,
  id: 'id',
  lastModifiedAt: 1645529087665,
  name: 'scmTwo',
  type: 'BITBUCKET' as SourceCodeManagerDTO['type'],
  userIdentifier: 'userIdentifier'
}
