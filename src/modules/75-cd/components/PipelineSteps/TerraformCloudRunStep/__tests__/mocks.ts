/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { UseGetReturnData } from '@common/utils/testUtils'
import type { ResponseOrganizationsDTO, ResponseWorkspacesDTO } from 'services/cd-ng'

export const connectorResponse = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      connector: {
        name: 'TerraformCloud_Connector_Test',
        identifier: 'TerraformCloud_Connector_Test',
        description: '',
        orgIdentifier: 'default',
        projectIdentifier: 'defaultproject',
        tags: {},
        type: 'TerraformCloudRun',
        spec: {
          credential: {
            type: 'ManualConfig',
            spec: {
              username: 'admin',
              endpointUrl: 'https://api.system.pcf-harness.com',
              usernameRef: null,
              passwordRef: 'TFCloudToken'
            }
          },
          delegateSelectors: [],
          executeOnDelegate: false
        }
      }
    }
  }
}

export const connectorsResponse = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      content: [
        {
          connector: {
            name: 'TerraformCloud_Connector_Test',
            identifier: 'TerraformCloud_Connector_Test',
            description: '',
            orgIdentifier: 'default',
            projectIdentifier: 'defaultproject',
            tags: {},
            type: 'TerraformCloudRun',
            spec: {
              credential: {
                type: 'ManualConfig',
                spec: {
                  username: 'admin',
                  endpointUrl: 'https://api.system.pcf-harness.com',
                  usernameRef: null,
                  passwordRef: 'TFCloudToken'
                }
              },
              delegateSelectors: [],
              executeOnDelegate: false
            }
          },
          createdAt: 1669228583075,
          lastModifiedAt: 1669228582989,
          status: {
            status: 'SUCCESS',
            errorSummary: null,
            errors: null,
            testedAt: 1669228588053,
            lastTestedAt: 0,
            lastConnectedAt: 1669228588053
          },
          activityDetails: {
            lastActivityTime: 1669228583324
          },
          harnessManaged: false,
          gitDetails: {
            objectId: null,
            branch: null,
            repoIdentifier: null,
            rootFolder: null,
            filePath: null,
            repoName: null,
            commitId: null,
            fileUrl: null,
            repoUrl: null
          },
          entityValidityDetails: {
            valid: true,
            invalidYaml: null
          },
          governanceMetadata: null
        }
      ]
    }
  }
}

export const spacesResponse: UseGetReturnData<ResponseWorkspacesDTO> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      workspaces: [
        {
          workspaceName: 'automation6',
          workspaceId: 'ws-eKfDJpJde3VzvGU8'
        },
        {
          workspaceName: 'automation-terraform-cli-remote-workspace',
          workspaceId: 'ws-PGW5MvUkanK8heuH'
        }
      ]
    },
    correlationId: 'aa0b58a9-6d75-45d6-a2e4-30d8b1289d36'
  }
}

export const organizationsResponse: UseGetReturnData<ResponseOrganizationsDTO> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      organizations: [
        {
          organizationName: 'harness-automation',
          organizationId: 'harness-automation'
        },
        {
          organizationName: 'harness-dev',
          organizationId: 'harness-dev'
        }
      ]
    },
    correlationId: 'f85b3aa2-5a3a-42e8-847d-95e4090789a3'
  }
}
