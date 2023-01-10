/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type {
  ConnectorInfoDTO,
  ResponseListSourceCodeManagerDTO,
  ResponseGitBranchListDTO,
  GitSyncConfig
} from 'services/cd-ng'

export const defaultProps = {
  name: 'Set Up Delegates',
  isEditMode: true,
  connectorInfo: undefined
}

export const connectorInfo = {
  name: 'safdsafasfasfasdf',
  identifier: 'safdsafasfasfasdf',
  description: '',
  orgIdentifier: undefined,
  projectIdentifier: undefined,
  tags: {},
  type: 'Aws' as ConnectorInfoDTO['type'],
  spec: {
    credential: { crossAccountAccess: null, type: 'InheritFromDelegate', spec: null },
    delegateSelectors: ['primary configuration']
  },
  delegateType: 'InheritFromDelegate',
  crossAccountAccess: false
}

export const connectorInfoCredentials = {
  name: 'sdfgdfsgsdfg',
  identifier: 'sdfgdfsgsdfg',
  description: '',
  orgIdentifier: 'default',
  projectIdentifier: 'newProject',
  tags: {},
  type: 'Aws' as ConnectorInfoDTO['type'],
  spec: {
    credential: {
      crossAccountAccess: null,
      type: 'ManualConfig',
      spec: { accessKey: 'sdfgsfdg', accessKeyRef: null, secretKeyRef: 'HARNESS_IMAGE_PASSWORD' }
    },
    delegateSelectors: ['delegate-selector-sample']
  },
  delegateType: 'ManualConfig',
  accessKey: { value: 'sdfgsfdg', type: 'TEXT' },
  secretKeyRef: {
    identifier: 'HARNESS_IMAGE_PASSWORD',
    name: 'HARNESS_IMAGE_PASSWORD',
    referenceString: 'HARNESS_IMAGE_PASSWORD',
    accountIdentifier: 'kmpySmUISimoRrJL6NL73w',
    projectIdentifier: 'newProject',
    orgIdentifier: 'default'
  },
  crossAccountAccess: false,
  accessKeyfieldType: 'TEXT',
  accessKeytextField: 'sdfgsfdg'
}

export const mockedDelegates = {
  metaData: {},
  resource: {
    delegateGroupDetails: [
      {
        groupId: 'nhJQFrnqRsibPbQR1Erl8g',
        delegateType: 'KUBERNETES',
        groupName: 'delegate-sample-name-1',
        groupHostName: 'delegate-sample-name-1-{n}',
        delegateConfigurationId: 'o7ObEntuSuWdnOOrY8Cy1Q',
        groupImplicitSelectors: {
          'primary configuration': 'PROFILE_NAME',
          'delegate-sample-name-1': 'DELEGATE_NAME'
        },
        delegateInsightsDetails: { insights: [] },
        lastHeartBeat: 1623575011349,
        activelyConnected: false,
        delegateInstanceDetails: [],
        connectivityStatus: 'connected'
      },
      {
        groupId: 'nhJQFrnqRsibPbQR1Erl8g',
        delegateType: 'KUBERNETES',
        groupName: 'delegate-sample-name-2',
        groupHostName: 'delegate-sample-name-2-{n}',
        delegateConfigurationId: 'o7ObEntuSuWdnOOrY8Cy1Q',
        groupImplicitSelectors: {
          'primary configuration': 'PROFILE_NAME',
          'delegate-sample-name-2': 'DELEGATE_NAME'
        },
        delegateInsightsDetails: { insights: [] },
        lastHeartBeat: 1623575011349,
        activelyConnected: false,
        delegateInstanceDetails: [],
        connectivityStatus: 'connected'
      }
    ]
  },
  responseMessages: []
}

export const requestBody = {
  connector: {
    name: 'doker',
    description: '',
    projectIdentifier: 'projId',
    identifier: 'docker',
    orgIdentifier: 'orgId',
    tags: {},
    type: 'DockerRegistry',
    spec: {
      delegateSelectors: [],
      dockerRegistryUrl: 'https://registry.hub.docker.com/v2/',
      providerType: 'DockerHub',
      auth: { type: 'Anonymous' }
    }
  }
}

export const gitConfigs: GitSyncConfig[] = [
  {
    identifier: 'identifier',
    name: 'name',
    projectIdentifier: 'projectIdentifier',
    orgIdentifier: 'orgIdentifier',
    gitConnectorRef: 'gitConnectorRef',
    repo: 'repo',
    branch: 'branch',
    gitConnectorType: 'Github'
  }
]

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
    }
  ]
}

export const branchStatusMock: ResponseGitBranchListDTO = {
  status: 'SUCCESS',
  data: {
    defaultBranch: { branchName: 'master', branchSyncStatus: 'SYNCED' },
    branches: {
      totalPages: 1,
      totalItems: 2,
      pageItemCount: 2,
      pageSize: 10,
      content: [
        { branchName: 'gitSync', branchSyncStatus: 'SYNCED' },
        { branchName: 'master', branchSyncStatus: 'SYNCED' },
        { branchName: 'feature', branchSyncStatus: 'SYNCED' },
        { branchName: 'branch1', branchSyncStatus: 'SYNCING' },
        { branchName: 'branch2', branchSyncStatus: 'UNSYNCED' }
      ],
      pageIndex: 0,
      empty: false
    }
  },
  metaData: undefined,
  correlationId: '23659f77-9c8a-4338-8163-06a65a7e5823'
}
