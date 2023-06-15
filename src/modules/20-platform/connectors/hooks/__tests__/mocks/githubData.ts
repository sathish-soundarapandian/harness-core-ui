/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const githubFormData = {
  name: 'NG - P024',
  identifier: 'NG_P024',
  description: '',
  tags: {},
  type: 'Github',
  urlType: 'Account',
  url: 'https://github.com/wings-software',
  validationRepo: 'https://github.com/wings-software/nextgenui',
  connectionType: 'Http',
  authType: 'UsernameToken',
  username: {
    value: 'username',
    type: 'TEXT'
  },
  accessToken: {
    identifier: 'secretdevxDDUx',
    name: 'secretdevxDDUx',
    referenceString: 'account.secretdevxDDUx',
    accountIdentifier: 'accountId'
  },
  apiAccessToken: {
    identifier: 'secretdevxDDUx',
    name: 'secretdevxDDUx',
    referenceString: 'account.secretdevxDDUx',
    accountIdentifier: 'accountId'
  },
  enableAPIAccess: true,
  apiAuthType: 'Token',
  usernamefieldType: 'TEXT',
  usernametextField: 'username',
  delegateSelectors: []
}

export const gitHubPayload = {
  name: 'NG - P024',
  description: '',
  projectIdentifier: undefined,
  orgIdentifier: undefined,
  identifier: 'NG_P024',
  tags: {},
  type: 'Github',
  spec: {
    delegateSelectors: [],
    executeOnDelegate: true,
    type: 'Account',
    url: 'https://github.com/wings-software',
    validationRepo: 'https://github.com/wings-software/nextgenui',
    authentication: {
      type: 'Http',
      spec: {
        type: 'UsernameToken',
        spec: {
          username: 'username',
          tokenRef: 'account.secretdevxDDUx',
          usernameRef: undefined
        }
      }
    },
    apiAccess: {
      type: 'Token',
      spec: {
        tokenRef: 'account.secretdevxDDUx'
      }
    }
  }
}
