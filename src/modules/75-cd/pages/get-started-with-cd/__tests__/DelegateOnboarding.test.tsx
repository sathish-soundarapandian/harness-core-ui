/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'

import { render, waitFor, getByText as getByTextBody, fireEvent } from '@testing-library/react'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import * as servicePortal from 'services/portal'
import * as serviceCDNG from 'services/cd-ng'
import GetStartedWithCD from '../GetStartedWithCD'
import {
  delegateSizeResponse,
  delegateTokensFailedResponse,
  delegateTokensResponse,
  dockerYamlResponse,
  heartbeatWaitingResponse,
  onGenYamlResponse,
  validateKubernetesYamlResponse
} from './mocks'

jest.useFakeTimers()
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
  useGetDelegatesHeartbeatDetailsV2: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return { data: heartbeatWaitingResponse, refetch: jest.fn(), error: null, loading: false }
  }),
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
    const createPipelineBtn = getByText('cd.installDelegate')
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
    const helpBtn = getByText('cd.checkCluster') as HTMLElement
    helpBtn.click()
    await waitFor(() => expect(getByText('cd.gCloud')).toBeInTheDocument())
    const azureBtn = getByText('cd.azureK8sService')
    await waitFor(() => expect(azureBtn).toBeInTheDocument())
    azureBtn.click()
    await waitFor(() => expect(getByText('cd.azureCli')).toBeInTheDocument())
    const amazonBtn = getByText('cd.amazonElasticK8sService')
    await waitFor(() => expect(amazonBtn).toBeInTheDocument())
    amazonBtn.click()
    await waitFor(() => expect(getByText('cd.awsCli')).toBeInTheDocument())
    const miniBtn = getByText('cd.minikube')
    await waitFor(() => expect(miniBtn).toBeInTheDocument())
    miniBtn.click()
    await waitFor(() => expect(getByText('cd.miniKube')).toBeInTheDocument())
    const backBtn = getByText('back') as HTMLElement
    backBtn.click()
    const mainScreenBtn = getByText('cd.installDelegate')
    await waitFor(() => expect(mainScreenBtn).toBeInTheDocument())
  })
  test('go to create pipeline flow', async () => {
    const { getByText } = render(
      <TestWrapper
        path="/account/:accountId/cd/orgs/:orgId/projects/:projectId/get-started"
        pathParams={{ accountId: 'test_account_id', orgId: 'orgId', projectId: 'projId' }}
        queryParams={{ experience: 'TRIAL' }}
      >
        <GetStartedWithCD />
      </TestWrapper>
    )
    const createPipelineBtn = getByText('cd.installDelegate')
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
    const createPipeline = getByText('ci.getStartedWithCI.createPipeline') as HTMLElement
    createPipeline.click()
    const dialog = findDialogContainer() as HTMLElement
    await waitFor(() => getByTextBody(dialog, 'Create Pipeline'))
    await waitFor(() => getByTextBody(dialog, 'cd.getStartedWithCD.delegateRequiredWarning'))
    const continueBtn = getByTextBody(dialog, 'continue')
    fireEvent.click(continueBtn)
    await waitFor(() => expect(getByText('cd.delegateWarning')).toBeInTheDocument())
  })
  test('failure API call', async () => {
    jest
      .spyOn(servicePortal, 'validateKubernetesYamlPromise')
      .mockImplementation(() => Promise.resolve({ responseMessages: [{ message: 'Something Went Wrong' }] }))
    const { getByText } = render(
      <TestWrapper
        path="/account/:accountId/cd/orgs/:orgId/projects/:projectId/get-started"
        pathParams={{ accountId: 'test_account_id', orgId: 'orgId', projectId: 'projId' }}
        queryParams={{ experience: 'TRIAL' }}
      >
        <GetStartedWithCD />
      </TestWrapper>
    )
    const createPipelineBtn = getByText('cd.installDelegate')
    expect(createPipelineBtn).toBeInTheDocument()
    createPipelineBtn.click()
    const kubernetesBtn = getByText('kubernetesText') as HTMLElement
    expect(kubernetesBtn).toBeInTheDocument()
    kubernetesBtn.click()
    await waitFor(() => expect(getByText('somethingWentWrong')).toBeInTheDocument())
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
    const createPipelineBtn = getByText('cd.installDelegate')
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
    jest.runAllTimers()
    await waitFor(() => expect(getByText('cd.delegateFailText1')).toBeInTheDocument())
    const troubleShootBtn = getByText('delegates.delegateNotInstalled.tabs.commonProblems.troubleshoot') as HTMLElement
    troubleShootBtn.click()
    await waitFor(() =>
      expect(getByText('delegates.delegateNotInstalled.tabs.commonProblems.title')).toBeInTheDocument()
    )
  })
  test('failure response for unique name delegate call ', async () => {
    jest
      .spyOn(servicePortal, 'validateDockerDelegatePromise')
      .mockImplementation(() => Promise.resolve({ responseMessages: [{ message: 'Something Went Wrong' }] }))
    const { getByText } = render(
      <TestWrapper
        path="/account/:accountId/cd/orgs/:orgId/projects/:projectId/get-started"
        pathParams={{ accountId: 'test_account_id', orgId: 'orgId', projectId: 'projId' }}
        queryParams={{ experience: 'TRIAL' }}
      >
        <GetStartedWithCD />
      </TestWrapper>
    )
    const createPipelineBtn = getByText('cd.installDelegate')
    expect(createPipelineBtn).toBeInTheDocument()
    createPipelineBtn.click()
    const dockerBtn = getByText('delegate.cardData.docker.name') as HTMLElement
    expect(dockerBtn).toBeInTheDocument()
    dockerBtn.click()
    await waitFor(() => expect(getByText('somethingWentWrong')).toBeInTheDocument())
  })
  test('failure response for tokens call ', async () => {
    jest
      .spyOn(serviceCDNG, 'getDelegateTokensPromise')
      .mockImplementation(() => Promise.resolve({ ...delegateTokensFailedResponse }))

    const { getByText } = render(
      <TestWrapper
        path="/account/:accountId/cd/orgs/:orgId/projects/:projectId/get-started"
        pathParams={{ accountId: 'test_account_id', orgId: 'orgId', projectId: 'projId' }}
        queryParams={{ experience: 'TRIAL' }}
      >
        <GetStartedWithCD />
      </TestWrapper>
    )
    const createPipelineBtn = getByText('cd.installDelegate')
    expect(createPipelineBtn).toBeInTheDocument()
    createPipelineBtn.click()
    const dockerBtn = getByText('delegate.cardData.docker.name') as HTMLElement
    expect(dockerBtn).toBeInTheDocument()
    dockerBtn.click()
    await waitFor(() => expect(getByText('somethingWentWrong')).toBeInTheDocument())
  })
})
