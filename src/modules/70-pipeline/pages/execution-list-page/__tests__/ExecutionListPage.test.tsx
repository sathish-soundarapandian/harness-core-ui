/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen, waitForElementToBeRemoved } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { branchStatusMock, gitConfigs, sourceCodeManagers } from '@connectors/mocks/mock'
import { useGetExecutionRepositoriesList, useGetListOfExecutions } from 'services/pipeline-ng'
import filters from '@pipeline/pages/execution-list/__tests__/mocks/filters.json'
import services from '@pipeline/pages/pipeline-list/__tests__/mocks/services.json'
import environments from '@pipeline/pages/pipeline-list/__tests__/mocks/environments.json'
import deploymentTypes from '@pipeline/pages/pipeline-list/__tests__/mocks/deploymentTypes.json'
import { ExecutionListPage } from '../ExecutionListPage'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')
jest.mock('@common/utils/YamlUtils', () => ({}))
jest.mock('@pipeline/components/Dashboards/PipelineSummaryCards/PipelineSummaryCards', () => () => <div />)
jest.mock('@pipeline/components/Dashboards/BuildExecutionsChart/PipelineBuildExecutionsChart', () => () => <div />)

const mockGetCallFunction = jest.fn()

const mockRepositories = {
  status: 'SUCCESS',
  data: {
    repositories: ['main', 'main-patch', 'main-patch1', 'main-patch2']
  },
  metaData: null,
  correlationId: 'cc779876-d3af-44e5-8991-916dfecb4548'
}

const fetchRepositories = jest.fn(() => {
  return Object.create(mockRepositories)
})

const mockBranches = {
  status: 'SUCCESS',
  data: { branches: ['15sept', 'main', 'main-patch-8nov'] },
  metaData: null,
  correlationId: 'a48d56f0-2d6f-4b4b-8b13-d8eba153005f'
}
const fetchBranches = jest.fn(() => {
  return Object.create(mockBranches)
})

jest.mock('services/pipeline-ng', () => ({
  useGetListOfExecutions: jest.fn(() => ({
    mutate: jest.fn(() => Promise.resolve({})),
    loading: false,
    cancel: jest.fn()
  })),
  useGetExecutionRepositoriesList: jest.fn().mockImplementation(() => {
    return { data: mockRepositories, refetch: fetchRepositories, error: null, loading: false }
  }),
  useGetExecutionBranchesList: jest.fn().mockImplementation(() => {
    return { data: mockBranches, refetch: fetchBranches, error: null, loading: false }
  }),
  useGetPipelineList: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return { mutate: jest.fn(() => Promise.resolve({})), cancel: jest.fn(), loading: false }
  }),
  useHandleInterrupt: jest.fn(() => ({})),
  useHandleStageInterrupt: jest.fn(() => ({})),
  useGetExecutionData: jest.fn().mockReturnValue({}),
  useGetFilterList: jest.fn().mockImplementation(() => {
    return { mutate: jest.fn(() => Promise.resolve(filters)), loading: false }
  }),
  usePostFilter: jest.fn(() => ({
    mutate: jest.fn(),
    loading: false,
    cancel: jest.fn()
  })),
  useUpdateFilter: jest.fn(() => ({
    mutate: jest.fn(),
    loading: false,
    cancel: jest.fn()
  })),
  useDeleteFilter: jest.fn(() => ({
    mutate: jest.fn(),
    loading: false,
    cancel: jest.fn()
  })),
  useGetInputsetYaml: jest.fn(() => ({ data: null }))
}))

const getListOfBranchesWithStatus = jest.fn(() => Promise.resolve(branchStatusMock))
const getListGitSync = jest.fn(() => Promise.resolve(gitConfigs))

jest.mock('services/cd-ng', () => ({
  useGetServiceListForProject: jest
    .fn()
    .mockImplementation(() => ({ loading: false, data: services, refetch: jest.fn() })),
  useGetEnvironmentListForProject: jest
    .fn()
    .mockImplementation(() => ({ loading: false, data: environments, refetch: jest.fn() })),
  useGetListOfBranchesWithStatus: jest.fn().mockImplementation(() => {
    return { data: branchStatusMock, refetch: getListOfBranchesWithStatus, loading: false }
  }),
  useGetServiceDefinitionTypes: jest
    .fn()
    .mockImplementation(() => ({ loading: false, data: deploymentTypes, refetch: jest.fn() })),
  useGetGlobalFreezeWithBannerDetails: jest.fn().mockReturnValue({ data: null, loading: false }),
  useListGitSync: jest.fn().mockImplementation(() => {
    return { data: gitConfigs, refetch: getListGitSync }
  })
}))

jest.mock('services/cd-ng-rq', () => ({
  useGetSourceCodeManagersQuery: jest.fn().mockImplementation(() => {
    return { data: sourceCodeManagers, refetch: jest.fn() }
  })
}))

const testPath = routes.toDeployments({
  accountId: ':accountId',
  orgIdentifier: ':orgIdentifier',
  projectIdentifier: ':projectIdentifier',
  module: ':module'
})
const testParams = {
  accountId: 'accountId',
  orgIdentifier: 'orgIdentifier',
  projectIdentifier: 'projectIdentifier',
  module: 'cd'
}

describe('ExecutionListPage', () => {
  test('CD module', async () => {
    render(
      <TestWrapper path={testPath} pathParams={testParams}>
        <ExecutionListPage />
      </TestWrapper>
    )
    expect(useGetExecutionRepositoriesList).toBeCalled()

    await waitForElementToBeRemoved(() => screen.getByText('Loading, please wait...'))
    const noRunsLabel = await screen.findByText('pipeline.noRunsText')
    expect(noRunsLabel).toBeInTheDocument()
    expect(useGetListOfExecutions).toHaveBeenLastCalledWith(
      expect.objectContaining({ queryParams: expect.objectContaining({ module: 'cd' }) })
    )
  })

  test('CI module', async () => {
    render(
      <TestWrapper path={testPath} pathParams={{ ...testParams, module: 'ci' }}>
        <ExecutionListPage />
      </TestWrapper>
    )
    expect(useGetExecutionRepositoriesList).toBeCalled()

    await waitForElementToBeRemoved(() => screen.getByText('Loading, please wait...'))
    const noRunsText = await screen.findByText('pipeline.noRunsText')
    expect(noRunsText).toBeInTheDocument()
    expect(useGetListOfExecutions).toHaveBeenLastCalledWith(
      expect.objectContaining({ queryParams: expect.objectContaining({ module: 'ci' }) })
    )
  })

  test('STO module', async () => {
    render(
      <TestWrapper path={testPath} pathParams={{ ...testParams, module: 'sto' }}>
        <ExecutionListPage />
      </TestWrapper>
    )
    expect(useGetExecutionRepositoriesList).toBeCalled()

    await waitForElementToBeRemoved(() => screen.getByText('Loading, please wait...'))
    const noScansText = await screen.findByText('pipeline.noRunsText')
    expect(noScansText).toBeInTheDocument()
    expect(useGetListOfExecutions).toHaveBeenLastCalledWith(
      expect.objectContaining({ queryParams: expect.objectContaining({ module: 'sto' }) })
    )
  })
})
