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
import filters from '@pipeline/pages/execution-list/__mocks__/filters.json'
import services from '../../pipelines/__tests__/mocks/services.json'
import environments from '../../pipelines/__tests__/mocks/environments.json'
import deploymentTypes from '../../pipelines/__tests__/mocks/deploymentTypes.json'
import { ExecutionListPage } from '../ExecutionListPage'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')
jest.mock('@common/utils/YamlUtils', () => ({}))
jest.mock('@pipeline/components/Dashboards/PipelineSummaryCards/PipelineSummaryCards', () => () => <div />)
jest.mock('@pipeline/components/Dashboards/BuildExecutionsChart/PipelineBuildExecutionsChart', () => () => <div />)

const mockGetCallFunction = jest.fn()

jest.mock('services/pipeline-ng', () => ({
  useGetListOfExecutions: jest.fn(() => ({
    mutate: jest.fn(() => Promise.resolve({})),
    loading: false,
    cancel: jest.fn()
  })),
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
  useListGitSync: jest.fn().mockImplementation(() => {
    return { data: gitConfigs, refetch: getListGitSync }
  }),
  useGetListOfBranchesWithStatus: jest.fn().mockImplementation(() => {
    return { data: branchStatusMock, refetch: getListOfBranchesWithStatus, loading: false }
  }),
  useGetSourceCodeManagers: jest.fn().mockImplementation(() => {
    return { data: sourceCodeManagers, refetch: jest.fn() }
  }),
  useGetServiceDefinitionTypes: jest
    .fn()
    .mockImplementation(() => ({ loading: false, data: deploymentTypes, refetch: jest.fn() }))
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
    await waitForElementToBeRemoved(() => screen.getByText('Loading, please wait...'))
    const noDeploymentText = await screen.findByText('pipeline.noDeploymentText')
    expect(noDeploymentText).toBeInTheDocument()
    expect(screen.getByText('noDeploymentText')).toBeInTheDocument()
  })

  test('CI module', async () => {
    render(
      <TestWrapper path={testPath} pathParams={{ ...testParams, module: 'ci' }}>
        <ExecutionListPage />
      </TestWrapper>
    )
    await waitForElementToBeRemoved(() => screen.getByText('Loading, please wait...'))
    const noBuildsText = await screen.findByText('pipeline.noBuildsText')
    expect(noBuildsText).toBeInTheDocument()
    expect(screen.getByText('noBuildsText')).toBeInTheDocument()
  })

  test('STO module', async () => {
    render(
      <TestWrapper path={testPath} pathParams={{ ...testParams, module: 'sto' }}>
        <ExecutionListPage />
      </TestWrapper>
    )
    await waitForElementToBeRemoved(() => screen.getByText('Loading, please wait...'))
    const noScansText = await screen.findByText('stoSteps.noScansText')
    expect(noScansText).toBeInTheDocument()
    expect(screen.getByText('stoSteps.noScansRunPipelineText')).toBeInTheDocument()
  })
})
