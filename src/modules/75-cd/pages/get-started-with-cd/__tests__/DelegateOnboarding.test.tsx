/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'

import { render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import GetStartedWithCD from '../GetStartedWithCD'
import {
  delegateSizeResponse,
  delegateTokensResponse,
  dockerYamlResponse,
  heartbeatWaitingResponse,
  onGenYamlResponse,
  validateKubernetesYamlResponse
} from './mocks'

const mockGetCallFunction = jest.fn()
jest.mock('services/cd-ng', () => ({
  getDelegateTokensPromise: jest.fn(() => delegateTokensResponse)
}))
jest.mock('services/portal', () => ({
  useGetDelegateSizes: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return { data: delegateSizeResponse, refetch: jest.fn(), error: null, loading: false }
  }),
  validateKubernetesYamlPromise: jest.fn(() =>
    Promise.resolve({
      responseMessages: [],
      resource: validateKubernetesYamlResponse
    })
  ),
  generateKubernetesYamlPromise: jest.fn(() => onGenYamlResponse),
  useGetDelegatesHeartbeatDetailsV2: jest.fn(() => heartbeatWaitingResponse),
  validateDockerDelegatePromise: jest.fn().mockImplementation(() => Promise.resolve({ responseMessages: [] })),
  generateDockerDelegateYAMLPromise: jest.fn(() => dockerYamlResponse)
}))
global.URL.createObjectURL = jest.fn()
jest.mock('@common/components/YAMLBuilder/YamlBuilder')
describe('Test the initial flow for kubernetes delegate Creation', () => {
  test('initial render', async () => {
    const { getByText } = render(
      <TestWrapper
        path="/account/:accountId/cd/orgs/:orgId/projects/:projectId/get-started"
        pathParams={{ accountId: 'test_account_id', orgId: 'orgId', projectId: 'projId' }}
        queryParams={{ experience: 'TRIAL' }}
      >
        <GetStartedWithCD />
      </TestWrapper>
    )
    const createPipelineBtn = getByText('cd.delegateInstallBtnText')
    expect(createPipelineBtn).toBeInTheDocument()
    createPipelineBtn.click()
    const kubernetesBtn = getByText('kubernetesText') as HTMLElement
    expect(kubernetesBtn).toBeInTheDocument()
    kubernetesBtn.click()
    await waitFor(() => expect(getByText('cd.instructionsDelegate')).toBeInTheDocument())
    const previewYAMLBtn = getByText('cd.previewYAML') as HTMLElement
    previewYAMLBtn.click()
    const downloadYAMLBtn = getByText('delegates.downloadYAMLFile') as HTMLElement
    downloadYAMLBtn.click()
    expect(global.URL.createObjectURL).toBeCalled()
  })
})
describe('Test the initial flow for docker delegate Creation', () => {
  test('initial render', async () => {
    const { getByText } = render(
      <TestWrapper
        path="/account/:accountId/cd/orgs/:orgId/projects/:projectId/get-started"
        pathParams={{ accountId: 'test_account_id', orgId: 'orgId', projectId: 'projId' }}
        queryParams={{ experience: 'TRIAL' }}
      >
        <GetStartedWithCD />
      </TestWrapper>
    )
    const createPipelineBtn = getByText('cd.delegateInstallBtnText')
    expect(createPipelineBtn).toBeInTheDocument()
    createPipelineBtn.click()
    const dockerBtn = getByText('delegate.cardData.docker.name') as HTMLElement
    expect(dockerBtn).toBeInTheDocument()
    dockerBtn.click()
    await waitFor(() => expect(getByText('cd.instructionsDelegate')).toBeInTheDocument())
    const previewYAMLBtn = getByText('cd.previewYAML') as HTMLElement
    previewYAMLBtn.click()
    const downloadYAMLBtn = getByText('delegates.downloadYAMLFile') as HTMLElement
    downloadYAMLBtn.click()
    expect(global.URL.createObjectURL).toBeCalled()
  })
})
