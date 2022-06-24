/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, fireEvent, act, screen, RenderResult, findByText, getByRole } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GitSyncTestWrapper } from '@common/utils/gitSyncTestUtils'
import gitSyncListResponse from '@common/utils/__tests__/mocks/gitSyncRepoListMock.json'
import { findDialogContainer, findPopoverContainer, TestWrapper } from '@common/utils/testUtils'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import routes from '@common/RouteDefinitions'
import { projectPathProps, accountPathProps, pipelineModuleParams } from '@common/utils/routeUtils'
import { branchStatusMock, sourceCodeManagers } from '@connectors/mocks/mock'
import CDPipelinesPage from '../PipelinesPage'
import filters from './mocks/filters.json'
import deploymentTypes from './mocks/deploymentTypes.json'
import services from './mocks/services.json'
import environments from './mocks/environments.json'
import pipelines from './mocks/pipelines.json'

const getListOfBranchesWithStatus = jest.fn(() => Promise.resolve(branchStatusMock))
const getListGitSync = jest.fn(() => Promise.resolve(gitSyncListResponse))

jest.mock('@common/components/YAMLBuilder/YamlBuilder')
jest.mock('@common/utils/YamlUtils', () => ({}))

jest.mock('services/cd-ng', () => ({
  useGetOrganizationList: jest.fn().mockReturnValue({ data: null, loading: false }),
  useGetProjectAggregateDTOList: jest.fn().mockReturnValue({ data: null, loading: false }),
  useGetServiceDefinitionTypes: jest
    .fn()
    .mockImplementation(() => ({ loading: false, data: deploymentTypes, refetch: jest.fn() })),
  useGetServiceListForProject: jest
    .fn()
    .mockImplementation(() => ({ loading: false, data: services, refetch: jest.fn() })),
  useGetEnvironmentListForProject: jest
    .fn()
    .mockImplementation(() => ({ loading: false, data: environments, refetch: jest.fn() })),
  getListOfBranchesByGitConfigPromise: jest
    .fn()
    .mockImplementation(() => ({ loading: false, data: [], refetch: jest.fn() })),
  useGetListOfBranchesWithStatus: jest.fn().mockImplementation(() => {
    return { data: branchStatusMock, refetch: getListOfBranchesWithStatus, loading: false }
  }),
  useListGitSync: jest.fn().mockImplementation(() => {
    return { data: gitSyncListResponse, refetch: getListGitSync, loading: false }
  }),
  useGetSourceCodeManagers: jest.fn().mockImplementation(() => {
    return { data: sourceCodeManagers, refetch: jest.fn() }
  })
}))

jest.mock('@common/utils/dateUtils', () => ({
  formatDatetoLocale: (x: number) => x
}))

const params = {
  accountId: 'testAcc',
  orgIdentifier: 'testOrg',
  projectIdentifier: 'test',
  pipelineIdentifier: 'pipeline1',
  module: 'cd'
}
const openRunPipelineModal = jest.fn()
const mockGetCallFunction = jest.fn()
jest.useFakeTimers()

const mockDeleteFunction = jest.fn()
const deletePipeline = (): Promise<{ status: string }> => {
  mockDeleteFunction()
  return Promise.resolve({ status: 'SUCCESS' })
}

jest.mock('services/pipeline-ng', () => ({
  useGetPipelineList: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return { mutate: jest.fn(() => Promise.resolve(pipelines)), cancel: jest.fn(), loading: false }
  }),
  useSoftDeletePipeline: jest.fn().mockImplementation(() => ({ mutate: deletePipeline, loading: false })),
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
  useDeleteInputSetForPipeline: jest.fn(() => ({ mutate: jest.fn() })),
  useGetInputsetYaml: jest.fn(() => ({ data: null, loading: false })),
  useClonePipeline: jest.fn().mockReturnValue({ mutate: jest.fn(), loading: false })
}))

jest.mock('@pipeline/components/RunPipelineModal/useRunPipelineModal', () => ({
  useRunPipelineModal: () => ({
    openRunPipelineModal,
    closeRunPipelineModal: jest.fn()
  })
}))

const TEST_PATH = routes.toPipelines({ ...accountPathProps, ...projectPathProps, ...pipelineModuleParams })

const renderCDPipelinesPage = (): RenderResult =>
  render(
    <TestWrapper path={TEST_PATH} pathParams={params} defaultAppStoreValues={defaultAppStoreValues}>
      <CDPipelinesPage />
    </TestWrapper>
  )

describe('CD Pipeline Page List', () => {
  test('render list view', async () => {
    const { container } = renderCDPipelinesPage()
    await screen.findByTestId('pipeline-item-0')
    expect(container).toMatchSnapshot()
  })

  test('test run pipeline on list view', async () => {
    openRunPipelineModal.mockReset()
    render(
      <TestWrapper path={TEST_PATH} pathParams={params} defaultAppStoreValues={defaultAppStoreValues}>
        <CDPipelinesPage />
      </TestWrapper>
    )
    const firstPipeline = await screen.findByTestId('pipeline-item-0')
    userEvent.click(firstPipeline)
    expect(openRunPipelineModal).toHaveBeenCalled()
    expect(screen.getByTestId('location').innerHTML.endsWith(routes.toPipelineStudio(params as any))).toBeTruthy()
  })

  test('test Add Pipeline on list view', async () => {
    renderCDPipelinesPage()
    userEvent.click(await screen.findByTestId('add-pipeline'))
    await waitFor(() => screen.getByTestId('location'))
    expect(
      screen
        .getByTestId('location')
        .innerHTML.endsWith(routes.toPipelineStudio({ ...params, pipelineIdentifier: '-1' } as any))
    ).toBeTruthy()
  })

  test('Search Pipeline', async () => {
    const { container } = renderCDPipelinesPage()
    await screen.findByTestId('pipeline-item-0')
    mockGetCallFunction.mockReset()
    const searchInput = container?.querySelector('[placeholder="search"]') as HTMLInputElement
    act(() => {
      fireEvent.change(searchInput, { target: { value: 'asd' } })
      jest.runOnlyPendingTimers()
    })
    expect(mockGetCallFunction).toBeCalledWith({
      mock: undefined,
      queryParamStringifyOptions: {
        arrayFormat: 'comma'
      },
      queryParams: {
        accountIdentifier: 'testAcc',
        module: 'cd',
        page: 0,
        orgIdentifier: 'testOrg',
        projectIdentifier: 'test',
        searchTerm: 'asd',
        size: 20,
        sort: ['lastUpdatedAt', 'DESC']
      }
    })
  })

  test('should be able to open menu and run pipeline', async () => {
    renderCDPipelinesPage()
    const moreOptions = await screen.findAllByRole('button', {
      name: /more/i
    })
    userEvent.click(moreOptions[0])
    const menuContent = findPopoverContainer() as HTMLElement
    const runPipeline = await findByText(menuContent, 'runPipelineText')
    userEvent.click(runPipeline)
    expect(openRunPipelineModal).toHaveBeenCalled()
  })

  test('should be able to open menu and open pipeline studio', async () => {
    renderCDPipelinesPage()
    const moreOptions = await screen.findAllByRole('button', {
      name: /more/i
    })
    userEvent.click(moreOptions[0])
    const menuContent = findPopoverContainer() as HTMLElement
    const launchStudio = await findByText(menuContent, 'launchStudio')
    userEvent.click(launchStudio)
    const location = await screen.findByTestId('location')
    expect(location.innerHTML.endsWith(routes.toPipelineStudio({ ...(params as any) }))).toBeTruthy()
  })

  test('should be able to open menu and delete pipeline', async () => {
    renderCDPipelinesPage()
    const moreOptions = await screen.findAllByRole('button', {
      name: /more/i
    })
    userEvent.click(moreOptions[0])
    const menuContent = findPopoverContainer() as HTMLElement
    const deleteBtn = await findByText(menuContent, 'delete')
    userEvent.click(deleteBtn)
    await waitFor(() => screen.getByText('delete common.pipeline'))
    const form = findDialogContainer() as HTMLElement
    userEvent.click(
      getByRole(form, 'button', {
        name: /delete/i
      })
    )
    await screen.findByText('pipeline-list.pipelineDeleted')
    expect(mockDeleteFunction).toBeCalled()
  })
})

describe('When Git Sync is enabled', () => {
  test('should render fine', async () => {
    const { getByTestId, container } = render(
      <GitSyncTestWrapper path={TEST_PATH} pathParams={params} defaultAppStoreValues={{ isGitSyncEnabled: true }}>
        <CDPipelinesPage />
      </GitSyncTestWrapper>
    )
    await waitFor(() => getByTestId(params.pipelineIdentifier))
    const repoSelector = container.querySelector('input[name="repo"]') as HTMLInputElement
    expect(repoSelector).toBeInTheDocument()
    expect(repoSelector.value).toEqual('common.gitSync.allRepositories')
    const branchSelector = container.querySelector('input[name="branch"]') as HTMLInputElement
    expect(branchSelector).toBeInTheDocument()
    expect(branchSelector.value).toEqual('master')
  })
})
