/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { UseGetReturnData } from '@common/utils/testUtils'
import type { ResponseGcpResponseDTO } from 'services/cd-ng'

export const ClusterNamesResponse: UseGetReturnData<ResponseGcpResponseDTO> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      clusterNames: ['us-west2/a1', 'us-west1-b/q1']
    },
    correlationId: 'test-correlation-id'
  }
}
export const ConnectorsResponse = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      content: [
        {
          conenctor: {
            name: 'rancherconnector',
            identifier: 'rancher1',
            description: null,
            orgIdentifier: null,
            projectIdentifier: null,
            tags: {},
            type: 'Rancher',
            spec: {
              delegateSelectors: ['test-delegate'],
              credential: {
                type: 'ManualConfig',
                spec: {
                  rancherUrl: 'https://rancher.test16.sslip.io/',
                  auth: {
                    type: 'BearerToken',
                    spec: {
                      passwordRef: 'account.ranchertoken'
                    }
                  }
                }
              }
            }
          },
          createdAt: 1685977077772,
          lastModifiedAt: 1686227448090,
          status: null,
          harnessManaged: false
        }
      ]
    }
  }
}

export const ConnectorResponse = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      conenctor: {
        name: 'rancherconnector',
        identifier: 'rancher1',
        description: null,
        orgIdentifier: null,
        projectIdentifier: null,
        tags: {},
        type: 'Rancher',
        spec: {
          delegateSelectors: ['test-delegate'],
          credential: {
            type: 'ManualConfig',
            spec: {
              rancherUrl: 'https://rancher.test16.sslip.io/',
              auth: {
                type: 'BearerToken',
                spec: {
                  passwordRef: 'account.ranchertoken'
                }
              }
            }
          }
        }
      }
    }
  }
}
