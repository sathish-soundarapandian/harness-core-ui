/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const getConnectorResponse = (type: string) => {
  return {
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
          type: type,
          spec: {
            credential: {
              type: 'ManualConfig',
              spec: {
                masterUrl: 'master',
                auth: { type: 'UsernamePassword', spec: { username: 'usr', passwordRef: 'account.test' } }
              }
            }
          }
        }
      }
    }
  }
}

export const getConnectorsResponseMultiple = (type: string) => {
  return {
    loading: false,
    refetch: jest.fn(),
    error: null,
    data: {
      status: 'SUCCESS',
      data: {
        content: [
          {
            connector: {
              name: type,
              identifier: type,
              description: '',
              orgIdentifier: 'undefined',
              projectIdentifier: 'undefined',
              tags: {},
              type: type,
              spec: {
                credential: {
                  crossAccountAccess: null,
                  type: 'InheritFromDelegate',
                  spec: { delegateSelector: 'qwe' }
                }
              }
            },
            createdAt: 1608697269523,
            lastModifiedAt: 1608697269523,
            status: null,
            harnessManaged: false
          },
          {
            connector: {
              name: 'Git CTR',
              identifier: 'Git_CTR',
              description: 'To connect to Git',
              orgIdentifier: 'undefined',
              projectIdentifier: 'undefined',
              tags: { git: '' },
              type: 'Git',
              spec: {
                url: 'https://github.com',
                branchName: '',
                type: 'Http',
                connectionType: 'Repo',
                spec: { username: 'admin', passwordRef: 'account.sec1' },
                gitSync: { enabled: false, customCommitAttributes: null, syncEnabled: false }
              }
            },
            createdAt: 1608679004757,
            lastModifiedAt: 1608679004757,
            status: null,
            harnessManaged: false
          }
        ]
      }
    }
  }
}
