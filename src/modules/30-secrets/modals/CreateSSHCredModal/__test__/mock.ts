/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const getV2SecretMock = {
  status: 'SUCCESS',
  data: {
    secret: {
      type: 'SecretFile',
      name: 'secret-pem-aws-qasetup',
      identifier: 's1',
      orgIdentifier: 'default',
      projectIdentifier: 'SSH_t1',
      tags: {},
      description: '',
      spec: {
        secretManagerIdentifier: 'harnessSecretManager',
        additionalMetadata: null
      }
    },
    createdAt: 1666854782123,
    updatedAt: 1666854782123,
    draft: false,
    governanceMetadata: null
  },
  metaData: null,
  correlationId: 'a1'
}
