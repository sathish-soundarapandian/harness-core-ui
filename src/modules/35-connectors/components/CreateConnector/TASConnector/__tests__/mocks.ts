/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { noop } from 'lodash-es'
import type { ConnectorInfoDTO, ResponseBoolean } from 'services/cd-ng'

export const commonProps = {
  accountId: 'dummy',
  orgIdentifier: '',
  projectIdentifier: '',
  setIsEditMode: noop,
  onClose: noop,
  onSuccess: noop
}

export const mockResponse: ResponseBoolean = {
  status: 'SUCCESS',
  data: true,
  metaData: {},
  correlationId: ''
}

export const connectorInfoMock: ConnectorInfoDTO = {
  name: 'tasConnector',
  identifier: 'tasConnector',
  description: 'test description',
  orgIdentifier: 'default',
  projectIdentifier: 'defaultproject',
  tags: { tag1: '', tag2: '', tag3: '' },
  type: 'Tas',
  spec: {
    credential: {
      type: 'ManualConfig',
      spec: {
        username: 'admin',
        endpointUrl: 'http://sample_url.com/',
        usernameRef: null,
        passwordRef: 'tasToken'
      }
    },
    delegateSelectors: ['account-delegate-1668077546'],

    executeOnDelegate: true
  }
}

export const mockSecretList = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 3,
    pageItemCount: 3,
    pageSize: 100,
    content: [
      {
        secret: {
          type: 'SecretText',
          name: 'TasToken',
          identifier: 'TasToken',
          tags: {},
          description: '',
          spec: {
            secretManagerIdentifier: 'harnessSecretManager',
            valueType: 'Inline',
            value: null
          }
        },
        createdAt: 1604055063891,
        updatedAt: 1604055063891,
        draft: false
      }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: null,
  correlationId: 'fcd0ef9b-bb1e-4ac2-987f-2f9563dc3ac3'
}

export const mockSecret = {
  status: 'SUCCESS',
  data: {
    secret: {
      type: 'SecretText',
      name: 'TasToken',
      identifier: 'TasToken',
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
