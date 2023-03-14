/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { ResponsePageSecretResponseWrapper } from 'services/cd-ng'

export const projectSecretsResponse = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 2,
    pageItemCount: 2,
    pageSize: 10,
    content: [
      {
        secret: {
          type: 'SecretText',
          name: 'secret_test_1',
          identifier: 'secret_test_1',
          tags: {},
          description: '',
          spec: {
            secretManagerIdentifier: 'harnessSecretManager',
            valueType: 'Inline',
            value: null,
            additionalMetadata: null
          }
        },
        createdAt: 1678283390378,
        updatedAt: 1678284562747,
        draft: false,
        governanceMetadata: null
      },
      {
        secret: {
          type: 'SecretText',
          name: 'secret_test_2',
          identifier: 'secret_test_2',
          tags: {},
          description: '',
          spec: {
            secretManagerIdentifier: 'harnessSecretManager',
            valueType: 'Inline',
            value: null,
            additionalMetadata: null
          }
        },
        createdAt: 1678276199535,
        updatedAt: 1678276199535,
        draft: false,
        governanceMetadata: null
      }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: null,
  correlationId: 'correlationId'
} as unknown as ResponsePageSecretResponseWrapper
