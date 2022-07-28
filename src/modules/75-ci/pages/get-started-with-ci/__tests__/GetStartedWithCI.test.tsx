/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'

import { render, fireEvent, act } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import GetStartedWithCI from '../GetStartedWithCI'
import * as hostedBuilds from '../../../hooks/useProvisionDelegateForHostedBuilds'
import { ProvisioningStatus } from '../InfraProvisioningWizard/Constants'
import { repos } from '../InfraProvisioningWizard/mocks/repositories'

jest.useFakeTimers()

const updateConnector = jest.fn()
const createConnector = jest.fn()
jest.mock('services/cd-ng', () => ({
  useGetConnectorListV2: jest.fn().mockImplementation(() => ({
    mutate: async () => {
      return {
        status: 'SUCCESS',
        data: {
          pageItemCount: 0,
          content: [
            {
              connector: {
                name: 'Github',
                identifier: 'Github',
                type: 'Github',
                spec: {
                  url: 'https://github.com',
                  validationRepo: 'harness/buildah',
                  authentication: {
                    type: 'Http',
                    spec: {
                      type: 'UsernameToken',
                      spec: {
                        username: 'oauth2',
                        usernameRef: null,
                        tokenRef: 'account.Github_Access_Token'
                      }
                    }
                  },
                  apiAccess: {
                    type: 'Token',
                    spec: {
                      tokenRef: 'account.Github_Access_Token'
                    }
                  }
                }
              },
              status: {
                status: 'SUCCESS',
                lastConnectedAt: 1658839003741
              }
            }
          ]
        }
      }
    }
  })),
  getSecretV2Promise: jest.fn().mockImplementation(() =>
    Promise.resolve({
      status: 'SUCCESS',
      data: {
        secret: {
          type: 'SecretText',
          name: 'k8serviceToken',
          identifier: 'k8serviceToken',
          tags: {},
          description: '',
          spec: { secretManagerIdentifier: 'harnessSecretManager', valueType: 'Inline' }
        }
      }
    })
  ),
  useCreateDefaultScmConnector: jest.fn().mockImplementation(() => {
    return {
      mutate: () =>
        Promise.resolve({
          status: 'SUCCESS',
          data: {
            connectorResponseDTO: { connector: { identifier: 'identifier' } },
            connectorValidationResult: { status: 'SUCCESS' },
            secretResponseWrapper: { secret: { identifier: 'identifier' } }
          }
        })
    }
  }),
  useUpdateConnector: jest.fn().mockImplementation(() => ({ mutate: updateConnector })),
  useCreateConnector: jest.fn().mockImplementation(() => ({ mutate: createConnector })),
  useGetListOfAllReposByRefConnector: jest.fn().mockImplementation(() => {
    return {
      data: { data: repos, status: 'SUCCESS' },
      refetch: jest.fn(),
      error: null,
      loading: false,
      cancel: jest.fn()
    }
  })
}))

jest.spyOn(hostedBuilds, 'useProvisionDelegateForHostedBuilds').mockReturnValue({
  initiateProvisioning: jest.fn(),
  delegateProvisioningStatus: ProvisioningStatus.SUCCESS
})

describe('Test Get Started With CI', () => {
  test('initial render', async () => {
    const { getByText } = render(
      <TestWrapper
        path="/account/:accountId/ci/orgs/:orgId/projects/:projectId/get-started"
        pathParams={{ accountId: 'test_account_id', orgId: 'orgId', projectId: 'projId' }}
        queryParams={{ experience: 'TRIAL' }}
      >
        <GetStartedWithCI />
      </TestWrapper>
    )
    expect(getByText('ci.getStartedWithCI.firstPipeline')).toBeTruthy()
    const createPipelineBtn = getByText('getStarted')
    expect(createPipelineBtn).toBeInTheDocument()
  })

  test('User clicks on Get Started button', async () => {
    const { getByText } = render(
      <TestWrapper
        path="/account/:accountId/ci/orgs/:orgId/projects/:projectId/get-started"
        pathParams={{ accountId: 'test_account_id', orgId: 'orgId', projectId: 'projId' }}
        queryParams={{ experience: 'TRIAL' }}
      >
        <GetStartedWithCI />
      </TestWrapper>
    )
    expect(getByText('ci.getStartedWithCI.firstPipeline')).toBeInTheDocument()
    const createPipelineBtn = getByText('getStarted')
    expect(createPipelineBtn).toBeInTheDocument()
    await act(async () => {
      fireEvent.click(createPipelineBtn!)
    })
    expect(getByText('ci.getStartedWithCI.selectYourRepo')).toBeInTheDocument()
  })

  test('Clicking on Learn more scrolls the page', async () => {
    const scrollIntoViewMock = jest.fn()
    window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock
    const { getByText } = render(
      <TestWrapper
        path="/account/:accountId/ci/orgs/:orgId/projects/:projectId/get-started"
        pathParams={{ accountId: 'test_account_id', orgId: 'orgId', projectId: 'projId' }}
        queryParams={{ experience: 'TRIAL' }}
      >
        <GetStartedWithCI />
      </TestWrapper>
    )
    await act(async () => {
      fireEvent.click(getByText('ci.getStartedWithCI.learnMoreAboutCI'))
    })
    jest.runAllTimers()
    expect(scrollIntoViewMock).toBeCalled()
    expect(getByText('ci.getStartedWithCI.takeToTheNextLevel')).toBeInTheDocument()
  })
})
