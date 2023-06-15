/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import type { ResponseBoolean } from 'services/cd-ng'
import { Connectors } from '@connectors/constants'
import { HashiCorpVaultAccessTypes } from '@connectors/interfaces/ConnectorInterface'

export const mockResponse: ResponseBoolean = {
  status: 'SUCCESS',
  data: true,
  metaData: {},
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

export const mockSecret = {
  status: 'SUCCESS',
  data: {
    secret: {
      type: 'SecretText',
      name: 'selected_secret',
      identifier: 'selected_secret',
      tags: {},
      description: '',
      spec: { secretManagerIdentifier: 'harnessSecretManager' }
    },
    createdAt: 1611917313699,
    updatedAt: 1611917313699,
    draft: false
  },
  metaData: null,
  correlationId: 'abb45801-d524-44ab-824c-aa532c367f39'
}

export const secretManagerInfo = {
  name: 'Vault P024 6',
  identifier: 'Vault_P024_6',
  description: '',
  type: Connectors.VAULT,
  spec: {
    accessType: HashiCorpVaultAccessTypes.APP_ROLE,
    appRoleId: '123',
    basePath: '/harness',
    vaultUrl: 'https://vaultqa.harness.io',
    renewalIntervalMinutes: 10,
    secretEngineManuallyConfigured: true,
    secretEngineName: 'harness',
    secretEngineVersion: 2,
    default: false,
    secretId: 'account.selected_secret',
    readOnly: false
  }
}

export const mockRegions = {
  resource: [{ name: 'region1', value: 'region1' }]
}
