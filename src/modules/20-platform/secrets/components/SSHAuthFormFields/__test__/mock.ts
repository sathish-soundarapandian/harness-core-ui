/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const initialValuesMock = {
  authScheme: 'SSH',
  credentialType: 'KeyReference',
  tgtGenerationMethod: 'None',
  userName: 'asdk',
  port: 22,
  key: {
    type: 'SecretText',
    name: 'asd',
    identifier: 'asd',
    orgIdentifier: 'default',
    projectIdentifier: 'test',
    tags: {},
    description: '',
    spec: {
      secretManagerIdentifier: 'harnessSecretManager',
      valueType: 'Inline',
      value: null
    },
    referenceString: 'asd'
  },
  encryptedPassphrase: {
    type: 'SecretText',
    name: 'asd',
    identifier: 'asd',
    orgIdentifier: 'default',
    projectIdentifier: 'test',
    tags: {},
    description: '',
    spec: {
      secretManagerIdentifier: 'harnessSecretManager',
      valueType: 'Inline',
      value: null
    },
    referenceString: 'asd'
  }
}

export const secretMock = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 1,
    pageItemCount: 1,
    pageSize: 100,
    content: [
      {
        secret: {
          type: 'SecretFile',
          name: 'nfile1',
          identifier: 'nfile1',
          tags: {},
          description: 'desc',
          spec: {
            secretManagerIdentifier: 'vault1'
          }
        },
        createdAt: 1602137372269,
        updatedAt: 1602137372269,
        draft: false
      }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: null,
  correlationId: 'eae05856-9cc0-450d-9d18-b459320311ff'
}
