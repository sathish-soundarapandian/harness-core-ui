/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'

import { render, waitFor, fireEvent } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { delegateSizeResponse, delegateTokensResponse } from './mocks'
import GetStartedWithCD from '../GetStartedWithCD'

jest.mock('services/cd-ng', () => ({
  useGetDelegateTokens: jest.fn().mockImplementation(() => ({
    data: delegateTokensResponse,
    refetch: jest.fn(() => delegateTokensResponse),
    error: null,
    loading: false
  }))
}))
jest.mock('@common/components/YAMLBuilder/YamlBuilder')

const generateYamlMock = jest.fn()
const mockGetCallFunction = jest.fn()
global.URL.createObjectURL = jest.fn()

jest.mock('services/portal', () => ({
  useGenerateKubernetesYaml: jest.fn().mockImplementation(() => {
    generateYamlMock()
    return {
      mutate: () => {
        return new Promise(resolve => {
          resolve('value')
        })
      }
    }
  }),
  useGetDelegateSizes: jest.fn().mockImplementation(() => ({
    data: delegateSizeResponse,
    refetch: jest.fn(() => delegateSizeResponse),
    error: null,
    loading: false
  })),
  useValidateKubernetesYaml: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return {
      mutate: jest.fn().mockImplementation(() =>
        Promise.resolve({
          responseMessages: [],
          resource: 'yaml value'
        })
      )
    }
  }),
  useGetDelegatesHeartbeatDetailsV2: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return { data: { resource: { numberOfConnectedDelegates: 1 } }, refetch: jest.fn(), error: null, loading: false }
  }),
  useGenerateDockerDelegateYAML: jest.fn().mockImplementation(() => {
    return {
      mutate: jest.fn().mockImplementation(() => 'value')
    }
  }),
  validateDockerDelegatePromise: jest.fn().mockImplementation(() => Promise.resolve({ responseMessages: [] }))
}))

describe('Test Get Started With CD', () => {
  test('initial render', async () => {
    const { container, getByText } = render(
      <TestWrapper
        path="/account/:accountId/cd/orgs/:orgId/projects/:projectId/get-started"
        pathParams={{ accountId: 'test_account_id', orgId: 'orgId', projectId: 'projId' }}
        queryParams={{ experience: 'TRIAL' }}
      >
        <GetStartedWithCD />
      </TestWrapper>
    )
    const createPipelineBtn = getByText('cd.delegateInstallBtnText') as HTMLElement
    expect(createPipelineBtn).toBeInTheDocument()
    createPipelineBtn.click()
    expect(container).toMatchSnapshot()
    const KubernetesLabel = getByText('kubernetesText') as HTMLElement
    expect(KubernetesLabel).toBeInTheDocument()
    fireEvent.click(KubernetesLabel)
    expect(container).toMatchSnapshot()
    await waitFor(() => expect(getByText('delegates.downloadYAMLFile') as HTMLElement).toBeInTheDocument())
    expect(container).toMatchSnapshot()
  })
  test('initial docker', async () => {
    const { container, getByText } = render(
      <TestWrapper
        path="/account/:accountId/cd/orgs/:orgId/projects/:projectId/get-started"
        pathParams={{ accountId: 'test_account_id', orgId: 'orgId', projectId: 'projId' }}
        queryParams={{ experience: 'TRIAL' }}
      >
        <GetStartedWithCD />
      </TestWrapper>
    )
    const createPipelineBtn = getByText('cd.delegateInstallBtnText') as HTMLElement
    expect(createPipelineBtn).toBeInTheDocument()
    createPipelineBtn.click()
    expect(container).toMatchSnapshot()
    const dockerLabel = getByText('delegate.cardData.docker.name') as HTMLElement
    expect(dockerLabel).toBeInTheDocument()
    fireEvent.click(dockerLabel)
    expect(container).toMatchSnapshot()
    await waitFor(() => expect(getByText('delegates.downloadYAMLFile') as HTMLElement).toBeInTheDocument())
    expect(container).toMatchSnapshot()
  })
})
