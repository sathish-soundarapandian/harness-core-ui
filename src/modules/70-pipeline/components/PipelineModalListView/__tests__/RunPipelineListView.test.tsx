/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { screen, render, RenderResult } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps, pipelineModuleParams, pipelinePathProps } from '@common/utils/routeUtils'
import { useGetPipelineList } from 'services/pipeline-ng'
import PipelineModalList from '../PipelineModalListView'
import { pipelines, pipelinesEmpty, pipelinesWithGitDetails } from './pipelinelistMocks'

const useGetPipelineListMutate = jest.fn().mockResolvedValue(pipelines)

const getModuleParams = (module = 'cd') => ({
  accountId: 'accountId',
  orgIdentifier: 'orgIdentifier',
  projectIdentifier: 'projectIdentifier',
  pipelineIdentifier: 'pipelineIdentifier',
  module
})

const TEST_PATH = routes.toDeployments({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams })

const renderRunPipelineListView = (module = 'cd'): RenderResult =>
  render(
    <TestWrapper
      path={TEST_PATH}
      pathParams={getModuleParams(module)}
      defaultAppStoreValues={{
        ...defaultAppStoreValues,
        isGitSyncEnabled: true,
        isGitSimplificationEnabled: true,
        supportingGitSimplification: true,
        gitSyncEnabledOnlyForFF: false
      }}
    >
      <PipelineModalList onClose={jest.fn()} />
    </TestWrapper>
  )

jest.mock('services/cd-ng', () => ({
  useGetListOfBranchesWithStatus: () => ({
    data: []
  }),
  useCreatePR: () => ({ data: [], mutate: jest.fn() }),
  useCreatePRV2: () => ({ data: [], mutate: jest.fn() }),
  useGetFileContent: () => ({
    data: [],
    mutate: jest.fn(),
    refetch: jest.fn()
  }),
  useGetFileByBranch: jest.fn().mockImplementation(() => ({ refetch: jest.fn() })),
  useListGitSync: jest.fn().mockImplementation(() => {
    return { data: [], refetch: jest.fn() }
  })
}))

jest.mock('services/cd-ng-rq', () => ({
  useGetSourceCodeManagersQuery: jest.fn().mockImplementation(() => {
    return { data: [], refetch: jest.fn() }
  })
}))

jest.mock('services/pipeline-ng', () => ({
  useGetPipelineList: jest.fn(() => ({
    mutate: useGetPipelineListMutate,
    cancel: jest.fn(),
    loading: false
  }))
}))

describe('PipelineModal List View', () => {
  test('render list view and search', async () => {
    const useGetPipelineListMock = useGetPipelineList as jest.MockedFunction<any>
    const mutateListOfPipelines = jest.fn().mockResolvedValue(pipelines)
    useGetPipelineListMock.mockReturnValue({
      mutate: mutateListOfPipelines,
      loading: false,
      cancel: jest.fn()
    })

    renderRunPipelineListView()
    expect(
      await screen.findByRole('link', {
        name: /Sonar Develop/i
      })
    ).toBeInTheDocument()

    await userEvent.type(screen.getByRole('searchbox'), 'searchTerm')
    expect(useGetPipelineListMock).toHaveBeenCalled()
  })

  test('CD - render empty data', async () => {
    const useGetPipelineListMock = useGetPipelineList as jest.MockedFunction<any>
    const mutateListOfPipelines = jest.fn().mockResolvedValue(pipelinesEmpty)
    useGetPipelineListMock.mockReturnValue({
      mutate: mutateListOfPipelines,
      loading: false,
      cancel: jest.fn()
    })
    renderRunPipelineListView()

    expect(await screen.findByText('pipeline.noPipelinesLabel')).toBeInTheDocument()
  })

  test('CI - render empty data', async () => {
    const useGetPipelineListMock = useGetPipelineList as jest.MockedFunction<any>
    const mutateListOfPipelines = jest.fn().mockResolvedValue(pipelinesEmpty)
    useGetPipelineListMock.mockReturnValue({
      mutate: mutateListOfPipelines,
      loading: false,
      cancel: jest.fn()
    })
    renderRunPipelineListView('ci')

    expect(await screen.findByText('pipeline.noPipelinesLabel')).toBeInTheDocument()
  })

  test('render data with git sync enabled', async () => {
    const useGetPipelineListMock = useGetPipelineList as jest.MockedFunction<any>
    const mutateListOfPipelines = jest.fn().mockResolvedValue(pipelinesWithGitDetails)
    useGetPipelineListMock.mockReturnValue({
      mutate: mutateListOfPipelines,
      loading: false,
      cancel: jest.fn()
    })

    renderRunPipelineListView()

    // Git filters are seen
    expect(await screen.findByDisplayValue('common.gitSync.defaultBranches')).toBeInTheDocument()
    expect(await screen.findByDisplayValue('common.gitSync.allRepositories')).toBeInTheDocument()
  })
})
