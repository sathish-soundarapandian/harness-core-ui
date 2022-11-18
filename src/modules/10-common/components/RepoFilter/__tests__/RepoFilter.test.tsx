/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { findByText, fireEvent, getByTestId, render, RenderResult, waitFor } from '@testing-library/react'
import routes from '@common/RouteDefinitions'
import { accountPathProps, pipelineModuleParams, projectPathProps } from '@common/utils/routeUtils'
import { TestWrapper } from '@common/utils/testUtils'
import {
  useGetExecutionBranchesList,
  useGetExecutionRepositoriesList,
  useGetRepositoryList
} from 'services/pipeline-ng'
import * as pipelineNg from 'services/pipeline-ng'
import { useGetRepositoryList as getRepoListForTemplate } from 'services/template-ng'
import RepoFilter from '../RepoFilter'

const getModuleParams = (module = 'cd') => ({
  accountId: 'accountId',
  orgIdentifier: 'orgIdentifier',
  projectIdentifier: 'projectIdentifier',
  pipelineIdentifier: 'pipelineIdentifier',
  module
})
const TEST_PATH = routes.toPipelines({ ...accountPathProps, ...projectPathProps, ...pipelineModuleParams })

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
  data: {
    branches: [{ name: 'branch1' }, { name: 'branch2' }, { name: 'branch3' }, { name: 'branch4' }]
  },
  metaData: null,
  correlationId: 'correlationId'
}
const fetchBranches = jest.fn(() => Promise.resolve(mockBranches))

jest.mock('services/pipeline-ng', () => {
  return {
    useGetRepositoryList: jest.fn().mockImplementation(() => {
      return { data: mockRepositories, refetch: fetchRepositories, error: null, loading: false }
    }),
    useGetExecutionBranchesList: jest.fn().mockImplementation(() => {
      return { data: mockBranches, refetch: fetchBranches, error: null, loading: false }
    }),
    useGetExecutionRepositoriesList: jest.fn().mockImplementation(() => {
      return { data: mockRepositories, refetch: fetchRepositories, error: null, loading: false }
    })
  }
})
jest.mock('services/template-ng', () => {
  return {
    useGetRepositoryList: jest.fn().mockImplementation(() => {
      return { data: mockRepositories, refetch: fetchRepositories, error: null, loading: false }
    })
  }
})
const renderPipelinesListPage = (module = 'cd'): RenderResult =>
  render(
    <TestWrapper path={TEST_PATH} pathParams={getModuleParams(module)}>
      <RepoFilter isPipelinePage={true} />
    </TestWrapper>
  )

describe('Repo Filter test', () => {
  test('should render filter dropdown', async () => {
    const { getByText, container } = renderPipelinesListPage()
    expect(useGetRepositoryList).toHaveBeenLastCalledWith(
      expect.objectContaining({
        queryParams: {
          accountIdentifier: 'accountId',
          orgIdentifier: 'orgIdentifier',
          projectIdentifier: 'projectIdentifier'
        }
      })
    )
    expect(getByText('common.selectRepository')).toBeInTheDocument()
    const dropdown = container.querySelector('[data-icon="main-chevron-down"]') as HTMLInputElement

    fireEvent.click(dropdown)
    await waitFor(() => {
      expect(getByText('main')).toBeInTheDocument()
    })

    render(
      <TestWrapper path={TEST_PATH} pathParams={getModuleParams('cd')}>
        <RepoFilter isExecutionsPage />
      </TestWrapper>
    )
    expect(useGetExecutionRepositoriesList).toBeCalled()
    const dropdown1 = container.querySelector('[data-icon="main-chevron-down"]') as HTMLInputElement

    fireEvent.click(dropdown1)
    await waitFor(() => {
      expect(getByText('main-patch')).toBeInTheDocument()
    })
    render(
      <TestWrapper path={TEST_PATH} pathParams={getModuleParams('cd')}>
        <RepoFilter isTemplatesPage />
      </TestWrapper>
    )
    expect(getRepoListForTemplate).toBeCalled()
    const dropdown2 = container.querySelector('[data-icon="main-chevron-down"]') as HTMLInputElement

    fireEvent.click(dropdown2)
    await waitFor(() => {
      expect(getByText('main-patch1')).toBeInTheDocument()
    })
  })

  test('default rendering RepoFilter - loading true', async () => {
    jest.spyOn(pipelineNg, 'useGetRepositoryList').mockReturnValue({
      loading: true,
      error: null,
      data: null,
      refetch: jest.fn()
    } as any)
    const { container } = render(
      <TestWrapper path={TEST_PATH} pathParams={getModuleParams('cd')}>
        <RepoFilter isPipelinePage />
      </TestWrapper>
    )
    const dropdown = getByTestId(container, 'repo-filter')?.closest('.DropDown--main')
    expect(dropdown).toHaveClass('DropDown--disabled')
  })

  test('Show refetch button if repo list api failed', async () => {
    const refetchCall = jest.fn()
    jest.spyOn(pipelineNg, 'useGetRepositoryList').mockReturnValue({
      loading: false,
      error: {
        data: {
          responseMessages: ['error']
        }
      },
      data: mockRepositories,
      refetch: refetchCall
    } as any)

    const { container } = render(
      <TestWrapper path={TEST_PATH} pathParams={getModuleParams('cd')}>
        <RepoFilter isPipelinePage />
      </TestWrapper>
    )

    const icon = container.querySelector('[data-icon="refresh"]')
    expect(icon).toBeInTheDocument()
    fireEvent.click(icon as HTMLElement)
    expect(refetchCall).toBeCalledTimes(1)
  })

  test('changing repo will call onChange handler with the selected value', async () => {
    const repoChangeHandler = jest.fn()
    const { container, getByText } = render(
      <TestWrapper path={TEST_PATH} pathParams={getModuleParams('cd')}>
        <RepoFilter onChange={repoChangeHandler} isPipelinePage />
      </TestWrapper>
    )

    const dropdown = container.querySelector('[data-icon="main-chevron-down"]') as HTMLInputElement
    expect(repoChangeHandler).not.toBeCalled()
    fireEvent.click(dropdown)
    await waitFor(() => {
      expect(getByText('main')).toBeInTheDocument()
      expect(getByText('main-patch')).toBeInTheDocument()
      expect(getByText('main-patch1')).toBeInTheDocument()
      expect(getByText('main-patch2')).toBeInTheDocument()
    })
    const item = await findByText(document.body, 'main')

    fireEvent.click(item)
    await waitFor(() => {
      expect(repoChangeHandler).toHaveBeenLastCalledWith('main')
    })
  })

  test('Branch Filter render test in deplyments page', async () => {
    const { container, getByText } = render(
      <TestWrapper path={TEST_PATH} pathParams={getModuleParams('cd')}>
        <RepoFilter showBranchFilter={true} isExecutionsPage />
      </TestWrapper>
    )

    expect(getByText('common.gitSync.selectBranch')).toBeInTheDocument()
    await waitFor(() => expect(fetchBranches).not.toBeCalled())
    const dropdown = getByTestId(container, 'branch-filter')?.closest('.DropDown--main')
    expect(dropdown).toHaveClass('DropDown--disabled')
  })

  test('Branch Filter handler test on branch change', async () => {
    const branchChangeHandler = jest.fn()
    render(
      <TestWrapper path={TEST_PATH} pathParams={getModuleParams('cd')}>
        <RepoFilter value={'main'} showBranchFilter={true} onBranchChange={branchChangeHandler} isExecutionsPage />
      </TestWrapper>
    )
    expect(useGetExecutionBranchesList).toBeCalled()
    await waitFor(() => expect(fetchBranches).toBeCalledTimes(1))
    expect(branchChangeHandler).not.toBeCalled()
  })

  test('Show refetch button if branch list api failed', async () => {
    const refetchCall = jest.fn()
    jest.spyOn(pipelineNg, 'useGetExecutionBranchesList').mockReturnValue({
      loading: false,
      error: {
        data: {
          responseMessages: ['error']
        }
      },
      data: mockBranches,
      refetch: refetchCall
    } as any)

    const { container } = render(
      <TestWrapper path={TEST_PATH} pathParams={getModuleParams('cd')}>
        <RepoFilter value={'main'} showBranchFilter={true} />
      </TestWrapper>
    )

    const icon = container.querySelector('[data-icon="refresh"]')
    expect(icon).toBeInTheDocument()
    fireEvent.click(icon as HTMLElement)
    expect(refetchCall).toBeCalled()
  })
})
