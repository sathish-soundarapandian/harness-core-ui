/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import type { ConnectorInfoDTO, ResponseBoolean } from 'services/cd-ng'

export const connectorInfo: ConnectorInfoDTO = {
  name: 'swarafdsfd',
  identifier: 'swarafdsfd',
  description: '',
  tags: {},
  type: 'GcpSecretManager',
  spec: { credentialsRef: 'account.playground_gcr_read', delegateSelectors: [], default: false }
}

export const mockResponse: ResponseBoolean = {
  status: 'SUCCESS',
  data: true,
  metaData: {},
  correlationId: ''
}

export const mockSecret = {
  status: 'SUCCESS',
  data: {
    secret: {
      type: 'SecretFile',
      name: 'swaraj file',
      identifier: 'swaraj_file',
      tags: {},
      description: '',
      spec: { secretManagerIdentifier: 'harnessSecretManager' }
    },
    createdAt: 1664452169213,
    updatedAt: 1664452169213,
    draft: false,
    governanceMetadata: null
  },
  metaData: null,
  correlationId: '32e6c006-26d3-b847-bf88e416ebe8'
}
