/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { AppStoreContextProps } from 'framework/AppStore/AppStoreContext'
import type { ResponseBoolean, ResponseListSourceCodeManagerDTO } from 'services/cd-ng'
import { loginSettings } from '@auth-settings/pages/Configuration/__test__/mock'
import { AuthenticationMechanisms } from '@rbac/utils/utils'

export const userMockData = {
  status: 'SUCCESS',
  data: { uuid: 'abc', name: 'dummy', email: 'dummy@harness.io', admin: false },
  metaData: undefined,
  correlationId: ''
}
export const mockSecretList = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 1,
    pageItemCount: 1,
    pageSize: 100,
    content: [
      {
        secret: {
          type: 'SecretText',
          name: 'selected_secret',
          identifier: 'selected_secret',
          tags: {},
          description: '',
          spec: { secretManagerIdentifier: 'New_Vault_Read_only', valueType: 'Inline', value: null }
        },
        createdAt: 1611917313699,
        updatedAt: 1611917313699,
        draft: false
      }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: null,
  correlationId: 'abb45801-d524-44ab-824c-aa532c367f39'
}
export const mockMyProfiles = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 1,
    pageItemCount: 1,
    pageSize: 100,
    content: [
      {
        orgIdentifier: 'O1',
        identifier: 'P3',
        name: 'P3',
        color: '#0063f7',
        modules: ['CD'],
        description: '',
        tags: {}
      },
      {
        orgIdentifier: 'O2',
        identifier: 'P1',
        name: 'P1',
        color: '#0063f7',
        modules: ['CD'],
        description: '',
        tags: {}
      }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: null,
  correlationId: 'abb45801-d524-44ab-824c-aa532c367f39'
}

export const mockResponse: ResponseBoolean = {
  status: 'SUCCESS',
  data: true,
  metaData: {},
  correlationId: ''
}

export const createBitBucket = {
  status: 'SUCCESS',
  data: {
    userIdentifier: 'userId',
    name: 'BB UP',
    type: 'BITBUCKET',
    authentication: {
      type: 'Http',
      spec: {
        type: 'UsernamePassword',
        spec: { username: 'Uname', usernameRef: null, passwordRef: 'account.selected_secret' }
      }
    }
  },
  metaData: null,
  correlationId: ''
}

export const sourceCodeManagers: ResponseListSourceCodeManagerDTO = {
  status: 'SUCCESS',
  data: [
    {
      userIdentifier: 'userId',
      name: 'BB UP',
      createdAt: 1617868887547,
      lastModifiedAt: 1617868887547,
      type: 'BITBUCKET',
      authentication: {
        type: 'Http',
        spec: {
          type: 'UsernamePassword',
          spec: { username: 'Uname', usernameRef: null, passwordRef: 'account.selected_secret' }
        }
      }
    },
    {
      userIdentifier: 'userId',
      name: 'New Git lab',
      createdAt: 1617868975336,
      lastModifiedAt: 1617868975336,
      authentication: {
        type: 'Http',
        spec: {
          type: 'UsernamePassword',
          spec: { username: 'hcbhdbchbvf', usernameRef: null, passwordRef: 'account.selected_secret' }
        }
      },
      type: 'GITLAB'
    },
    {
      userIdentifier: 'userId',
      name: 'jnvjgnjngjbn',
      createdAt: 1617868814533,
      lastModifiedAt: 1617868814533,
      type: 'GITHUB',
      authentication: {
        type: 'Http',
        spec: {
          type: 'UsernamePassword',
          spec: { username: 'ngjnbjgnbjngb', usernameRef: null, passwordRef: 'account.selected_secret' }
        }
      }
    },
    {
      userIdentifier: 'userId',
      name: 'aws',
      createdAt: 1618233694345,
      lastModifiedAt: 1618233694345,
      authentication: {
        type: 'HTTPS',
        spec: {
          type: 'AWSCredentials',
          spec: { accessKey: 'aws', accessKeyRef: null, secretKeyRef: 'account.bxshbxhsbxhs' }
        }
      },
      type: 'AWS_CODE_COMMIT'
    }
  ],
  metaData: undefined,
  correlationId: ''
}

export const emptySourceCodeManagers: ResponseListSourceCodeManagerDTO = {
  status: 'SUCCESS',
  data: [],
  metaData: undefined,
  correlationId: ''
}

export const connectorMockData = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 2,
    pageItemCount: 2,
    pageSize: 100,
    content: [
      {
        connector: {
          name: 'Harness Vault',
          identifier: 'harnessSecretManager',
          description: null,
          orgIdentifier: null,
          projectIdentifier: null,
          tags: {},
          type: 'Local',
          spec: { default: false }
        },
        createdAt: 1611554426106,
        lastModifiedAt: 1611554426104,
        status: {
          status: 'FAILURE',
          errorSummary: null,
          errors: null,
          testedAt: 1611901202067,
          lastTestedAt: 0,
          lastConnectedAt: 0
        },
        activityDetails: { lastActivityTime: 1611554426104 },
        harnessManaged: true
      }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: undefined,
  correlationId: ''
}

export const twoFactorAuthSettings = {
  status: 'SUCCESS',
  data: {
    userId: 'abc',
    email: 'abc@harness.io',
    twoFactorAuthenticationEnabled: true,
    mechanism: 'TOTP',
    totpSecretKey: '123',
    totpqrurl: 'abc.io'
  },
  metaData: null,
  correlationId: 'a65457f2-be0c-4040-a78f-760f09b726c2'
}

export const enabledTwoFactorAuth: Pick<AppStoreContextProps, 'featureFlags' | 'currentUserInfo'> = {
  featureFlags: {
    CDNG_ENABLED: true,
    CVNG_ENABLED: true,
    CING_ENABLED: true,
    CENG_ENABLED: true,
    CFNG_ENABLED: true
  },
  currentUserInfo: {
    uuid: 'dummyId',
    name: 'dummyname',
    email: 'dummy@harness.io',
    admin: false,
    twoFactorAuthenticationEnabled: true
  }
}

export const passwordStrengthPolicy = {
  resource: {
    ngAuthSettings: [
      {
        loginSettings: {
          passwordStrengthPolicy: loginSettings.passwordStrengthPolicy
        },
        settingsType: AuthenticationMechanisms.USER_PASSWORD
      }
    ]
  }
}
