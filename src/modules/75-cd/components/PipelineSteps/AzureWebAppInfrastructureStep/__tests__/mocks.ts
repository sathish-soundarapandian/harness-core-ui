/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { UseGetReturnData } from '@common/utils/testUtils'
import type { ResponseAzureResourceGroupsDTO, ResponseAzureSubscriptionsDTO } from 'services/cd-ng'

export const connectorResponse = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      connector: {
        name: 'azure-test-connector',
        identifier: 'azuretestconnector',
        description: '',
        orgIdentifier: 'default',
        projectIdentifier: 'azuretestwebapp',
        tags: {},
        type: 'Azure',
        spec: {
          credential: {
            type: 'ManualConfig',
            spec: {
              applicationId: 'baca1841-c593-407b-8793-98d3781f4fbf',
              tenantId: 'b229b2bb-5f33-4d22-bce0-730f6474e906',
              auth: {
                type: 'Secret',
                spec: {
                  secretRef: 'azuretestconnectorkey'
                }
              }
            }
          },
          delegateSelectors: [],
          azureEnvironmentType: 'AZURE'
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
            name: 'azure-test-connector',
            identifier: 'azuretestconnector',
            description: '',
            orgIdentifier: 'default',
            projectIdentifier: 'azuretestwebapp',
            tags: {},
            type: 'Azure',
            spec: {
              credential: {
                type: 'ManualConfig',
                spec: {
                  applicationId: 'baca1841-c593-407b-8793-98d3781f4fbf',
                  tenantId: 'b229b2bb-5f33-4d22-bce0-730f6474e906',
                  auth: {
                    type: 'Secret',
                    spec: {
                      secretRef: 'azuretestconnectorkey'
                    }
                  }
                }
              },
              delegateSelectors: [],
              azureEnvironmentType: 'AZURE'
            }
          },
          createdAt: 1655299737168,
          lastModifiedAt: 1656402026870,
          status: {
            status: 'SUCCESS',
            errorSummary: null,
            errors: null,
            testedAt: 1657536187809,
            lastTestedAt: 0,
            lastConnectedAt: 1657536187809
          },
          activityDetails: {
            lastActivityTime: 1656402027042
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
            fileUrl: null
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

export const resourceGroupsResponse: UseGetReturnData<ResponseAzureResourceGroupsDTO> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      resourceGroups: [
        {
          resourceGroup: 'NetworkWatcherRG'
        },

        {
          resourceGroup: 'vaibhav-test'
        }
      ]
    },
    correlationId: 'a176a69b-7c3a-472c-a204-80e87be9ff7e'
  }
}

export const subscriptionsResponse: UseGetReturnData<ResponseAzureSubscriptionsDTO> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      subscriptions: [
        {
          subscriptionName: 'Harness-Test',
          subscriptionId: '12d2db62-5aa9-471d-84bb-faa489b3e319'
        },
        {
          subscriptionName: 'Harness-QA',
          subscriptionId: '20d6a917-99fa-4b1b-9b2e-a3d624e9dcf0'
        }
      ]
    },
    correlationId: 'f7a15e4f-d8a3-4bea-a617-c8e21630c3d6'
  }
}
