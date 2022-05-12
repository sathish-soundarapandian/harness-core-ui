/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { UseGetReturnData } from '@common/utils/testUtils'
import type { ResponseConnectorResponse } from 'services/cd-ng'

export const mockConnectorResponse: UseGetReturnData<ResponseConnectorResponse> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      connector: {
        name: 'connectorRef',
        identifier: 'connectorRef',
        description: '',
        tags: {},
        type: 'K8sCluster',
        spec: {
          credential: {
            type: 'ManualConfig',
            spec: {
              masterUrl: 'asd',
              auth: { type: 'UsernamePassword', spec: { username: 'asd', passwordRef: 'account.test1111' } }
            }
          }
        }
      },
      createdAt: 1602062958274,
      lastModifiedAt: 1602062958274
    },
    correlationId: 'e1841cfc-9ed5-4f7c-a87b-c9be1eeaae34'
  }
}

export const mockConnectorsListResponse = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 2,
    pageItemCount: 2,
    pageSize: 100,
    content: [
      {
        connector: {
          name: 'dockerAleks',
          identifier: 'dockerAleks',
          description: '',
          orgIdentifier: null,
          projectIdentifier: null,
          tags: [],
          type: 'DockerRegistry',
          spec: {
            dockerRegistryUrl: 'https://index.docker.io/v2/',
            auth: {
              type: 'UsernamePassword',
              spec: { username: 'aradisavljevic', passwordRef: 'account.dockerAlekspasswordRef' }
            }
          }
        },
        createdAt: 1604593248928,
        lastModifiedAt: 1604593253377,
        status: {
          status: 'SUCCESS',
          errorMessage: '',
          lastTestedAt: 1604593253375,
          lastConnectedAt: 1604593253375
        }
      },
      {
        connector: {
          name: 'harnessimage',
          identifier: 'harnessimage',
          description: 'harnessimage',
          orgIdentifier: null,
          projectIdentifier: null,
          tags: [],
          type: 'DockerRegistry',
          spec: {
            dockerRegistryUrl: 'https://index.docker.io/v2/',
            auth: {
              type: 'UsernamePassword',
              spec: { username: 'harnessdev', passwordRef: 'account.harnessdevdockerpassword' }
            }
          }
        },
        createdAt: 1604415523887,
        lastModifiedAt: 1604415527763,
        status: {
          status: 'SUCCESS',
          errorMessage: '',
          lastTestedAt: 1604415527762,
          lastConnectedAt: 1604415527762
        }
      }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: null,
  correlationId: 'b4a0e6b7-30d7-4688-94ec-9130a3e1b229'
}

export const mockCreateConnectorResponse = {
  status: 'SUCCESS',
  data: {
    connector: {
      name: 'artifact',
      identifier: 'artifact',
      description: '',
      orgIdentifier: 'default',
      projectIdentifier: 'dummy',
      tags: [],
      type: 'DockerRegistry',
      spec: {
        dockerRegistryUrl: 'https;//hub.docker.com',
        auth: {
          type: 'UsernamePassword',
          spec: { username: 'testpass', passwordRef: 'account.testpass' }
        }
      }
    },
    createdAt: 1607289652713,
    lastModifiedAt: 1607289652713,
    status: null
  },
  metaData: null,
  correlationId: '0d20f7b7-6f3f-41c2-bd10-4c896bfd76fd'
}

export const mockUpdateConnectorResponse = {
  status: 'SUCCESS',
  data: {
    connector: {
      name: 'artifact',
      identifier: 'artifact',
      description: '',
      orgIdentifier: 'default',
      projectIdentifier: 'dummy',
      tags: [],
      type: 'DockerRegistry',
      spec: {
        dockerRegistryUrl: 'https;//hub.docker.com',
        auth: {
          type: 'UsernamePassword',
          spec: { username: 'testpass', passwordRef: 'account.testpass' }
        }
      }
    },
    createdAt: 1607289652713,
    lastModifiedAt: 1607289652713,
    status: null
  },
  metaData: null,
  correlationId: '0d20f7b7-6f3f-41c2-bd10-4c896bfd76fd'
}
