/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, screen, RenderResult, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import gitSyncListResponse from '@common/utils/__tests__/mocks/gitSyncRepoListMock.json'
import { findDialogContainer, findPopoverContainer, TestWrapper } from '@common/utils/testUtils'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import routes from '@common/RouteDefinitions'
import { projectPathProps, accountPathProps, pipelineModuleParams } from '@common/utils/routeUtils'
import { branchStatusMock, sourceCodeManagers } from '@connectors/mocks/mock'
import { useGetPipelineList } from 'services/pipeline-ng'
import { PipelineListPage } from '../PipelineListPage'
import filters from './mocks/filters.json'
import deploymentTypes from './mocks/deploymentTypes.json'
import services from './mocks/services.json'
import environments from './mocks/environments.json'
import pipelines from './mocks/pipelinesWithRecentExecutions.json'

jest.useFakeTimers()

const openRunPipelineModal = jest.fn()
const useGetPipelineListMutate = jest.fn().mockResolvedValue(pipelines)
const mockDeleteFunction = jest.fn()
const deletePipeline = (): Promise<{ status: string }> => {
  mockDeleteFunction()
  return Promise.resolve({ status: 'SUCCESS' })
}

jest.mock('@common/components/YAMLBuilder/YamlBuilder')
jest.mock('@common/utils/YamlUtils', () => ({}))
jest.mock('@common/utils/dateUtils', () => ({
  getReadableDateTime: (x: number) => x
}))

jest.mock('services/pipeline-ng', () => {
  const mockMutate = jest.fn().mockReturnValue({
    mutate: jest.fn(),
    loading: false,
    cancel: jest.fn()
  })

  return {
    useGetPipelineList: jest.fn(() => ({
      mutate: useGetPipelineListMutate,
      cancel: jest.fn(),
      loading: false
    })),
    useSoftDeletePipeline: jest.fn(() => ({ mutate: deletePipeline, loading: false })),
    useGetFilterList: jest.fn(() => ({ mutate: jest.fn().mockResolvedValue(filters), loading: false })),
    usePostFilter: mockMutate,
    useUpdateFilter: mockMutate,
    useDeleteFilter: mockMutate,
    useDeleteInputSetForPipeline: mockMutate,
    useGetInputsetYaml: mockMutate,
    useClonePipeline: mockMutate
  }
})

jest.mock('services/cd-ng', () => ({
  useGetOrganizationList: jest.fn().mockReturnValue({ data: null, loading: false }),
  useGetProjectAggregateDTOList: jest.fn().mockReturnValue({ data: null, loading: false }),
  useGetServiceDefinitionTypes: jest.fn(() => ({ loading: false, data: deploymentTypes, refetch: jest.fn() })),
  useGetServiceListForProject: jest.fn(() => ({ loading: false, data: services, refetch: jest.fn() })),
  useGetEnvironmentListForProject: jest.fn(() => ({ loading: false, data: environments, refetch: jest.fn() })),
  getListOfBranchesByGitConfigPromise: jest.fn().mockReturnValue({ loading: false, data: [], refetch: jest.fn() }),
  useGetListOfBranchesWithStatus: jest.fn(() => ({
    data: branchStatusMock,
    refetch: jest.fn().mockResolvedValue(branchStatusMock),
    loading: false
  })),
  useListGitSync: jest.fn(() => ({
    data: gitSyncListResponse,
    refetch: jest.fn().mockResolvedValue(gitSyncListResponse),
    loading: false
  })),
  useGetSourceCodeManagers: jest.fn(() => ({ data: sourceCodeManagers, refetch: jest.fn() }))
}))

jest.mock('@pipeline/components/RunPipelineModal/useRunPipelineModal', () => ({
  useRunPipelineModal: () => ({
    openRunPipelineModal,
    closeRunPipelineModal: jest.fn()
  })
}))

const getModuleParams = (module = 'cd') => ({
  accountId: 'accountId',
  orgIdentifier: 'orgIdentifier',
  projectIdentifier: 'projectIdentifier',
  pipelineIdentifier: 'pipelineIdentifier',
  module
})
const TEST_PATH = routes.toPipelines({ ...accountPathProps, ...projectPathProps, ...pipelineModuleParams })
const renderPipelinesListPage = (module = 'cd'): RenderResult =>
  render(
    <TestWrapper path={TEST_PATH} pathParams={getModuleParams(module)} defaultAppStoreValues={defaultAppStoreValues}>
      <PipelineListPage />
    </TestWrapper>
  )

describe('CD Pipeline List Page', () => {
  test('should render pipeline table and able to go to a pipeline', async () => {
    renderPipelinesListPage()
    const rows = await screen.findAllByRole('row')
    const pipelineRow = rows[1]
    expect(
      within(pipelineRow).getByRole('link', {
        name: /Sonar Develop/i
      })
    ).toHaveAttribute(
      'href',
      routes.toPipelineStudio({ ...getModuleParams(), pipelineIdentifier: 'Sonar_Develop', storeType: 'INLINE' } as any)
    )

    expect(
      within(pipelineRow).getByRole('link', {
        name: /execution uBrIkDHwTU2lv4o7ri7iCQ/i
      })
    ).toHaveAttribute(
      'href',
      routes.toExecutionPipelineView({
        ...getModuleParams(),
        pipelineIdentifier: 'Sonar_Develop',
        executionIdentifier: 'uBrIkDHwTU2lv4o7ri7iCQ',
        source: 'deployments'
      } as any)
    )
  })

  test('should be able to refresh pipelines', async () => {
    const useGetPipelineListMock = useGetPipelineList as jest.MockedFunction<any>
    const mutateListOfPipelines = jest.fn().mockResolvedValue(pipelines)
    useGetPipelineListMock.mockReturnValue({
      mutate: mutateListOfPipelines,
      loading: false,
      cancel: jest.fn()
    })

    renderPipelinesListPage()
    const refresh = await screen.findByRole('button', {
      name: /refresh/i
    })
    expect(mutateListOfPipelines).toHaveBeenCalledTimes(1)
    userEvent.click(refresh)
    expect(mutateListOfPipelines).toHaveBeenCalledTimes(2)
  })

  test('should be able to add a new pipeline with identifier as "-1"', async () => {
    renderPipelinesListPage()
    const addPipeline = await screen.findByTestId('add-pipeline')
    userEvent.click(addPipeline)
    const location = await screen.findByTestId('location')
    expect(
      location.innerHTML.endsWith(routes.toPipelineStudio({ ...getModuleParams(), pipelineIdentifier: '-1' } as any))
    ).toBeTruthy()
  })

  test('should be able to run pipeline from menu', async () => {
    renderPipelinesListPage()
    const row = await screen.findAllByRole('row')
    const moreOptions = within(row[1]).getByRole('button')
    userEvent.click(moreOptions)
    const menuContent = findPopoverContainer() as HTMLElement
    const runPipeline = await within(menuContent).findByText('runPipelineText')
    userEvent.click(runPipeline)
    expect(openRunPipelineModal).toHaveBeenCalled()
  })

  test('should be able to view pipeline from menu', async () => {
    renderPipelinesListPage()
    const row = await screen.findAllByRole('row')
    const moreOptions = within(row[1]).getByRole('button')
    userEvent.click(moreOptions)
    const menuContent = findPopoverContainer() as HTMLElement
    const viewPipeline = await within(menuContent).findByText('pipeline.viewPipeline')
    userEvent.click(viewPipeline)
    const location = await screen.findByTestId('location')
    expect(
      location.innerHTML.endsWith(
        routes.toPipelineStudio({
          ...(getModuleParams() as any),
          pipelineIdentifier: 'Sonar_Develop',
          storeType: 'INLINE'
        })
      )
    ).toBeTruthy()
  })

  test('should be able delete pipeline from the menu', async () => {
    renderPipelinesListPage()
    const row = await screen.findAllByRole('row')
    const moreOptions = within(row[1]).getByRole('button')
    userEvent.click(moreOptions)
    const menuContent = findPopoverContainer() as HTMLElement
    const deleteBtn = await within(menuContent).findByText('delete')
    userEvent.click(deleteBtn)
    await waitFor(() => screen.getByText('delete common.pipeline'))
    const form = findDialogContainer() as HTMLElement
    userEvent.click(
      within(form).getByRole('button', {
        name: /delete/i
      })
    )
    await screen.findByText('pipeline-list.pipelineDeleted')
    expect(mockDeleteFunction).toBeCalled()
  })

  test('should be able to search with a specific text', async () => {
    const useGetPipelineListMock = useGetPipelineList as jest.MockedFunction<any>
    const mutateListOfPipelines = jest.fn().mockResolvedValue(pipelines)
    useGetPipelineListMock.mockReturnValue({
      mutate: mutateListOfPipelines,
      loading: false,
      cancel: jest.fn()
    })

    renderPipelinesListPage()
    expect(await screen.findByText('NG Docker Image')).toBeInTheDocument()
    mutateListOfPipelines.mockReset()
    userEvent.type(screen.getByRole('searchbox'), 'asd')
    jest.runOnlyPendingTimers()
    expect(mutateListOfPipelines).toHaveBeenCalledWith(
      { filterType: 'PipelineSetup' },
      {
        queryParams: {
          accountIdentifier: 'accountId',
          orgIdentifier: 'orgIdentifier',
          page: 0,
          projectIdentifier: 'projectIdentifier',
          searchTerm: 'asd',
          size: 20,
          sort: ['lastUpdatedAt', 'DESC']
        }
      }
    )
  })
})

describe('CI Pipeline List Page', () => {
  test('should render pipeline table with sort', async () => {
    const useGetPipelineListMock = useGetPipelineList as jest.MockedFunction<any>
    const mutateListOfPipelines = jest.fn().mockResolvedValue(pipelines)
    useGetPipelineListMock.mockReturnValue({
      mutate: mutateListOfPipelines,
      loading: false,
      cancel: jest.fn()
    })

    renderPipelinesListPage('ci')
    const rows = await screen.findAllByRole('row')
    const pipelineRow = rows[1]
    expect(
      within(pipelineRow).getByRole('link', {
        name: /Sonar Develop/i
      })
    ).toHaveAttribute(
      'href',
      routes.toPipelineStudio({
        ...getModuleParams('ci'),
        pipelineIdentifier: 'Sonar_Develop',
        storeType: 'INLINE'
      } as any)
    )

    // test sorting
    mutateListOfPipelines.mockReset()
    userEvent.click(screen.getByText('pipeline.lastExecution'))
    expect(mutateListOfPipelines).toHaveBeenCalledWith(
      { filterType: 'PipelineSetup' },
      {
        queryParams: {
          accountIdentifier: 'accountId',
          orgIdentifier: 'orgIdentifier',
          page: 0,
          projectIdentifier: 'projectIdentifier',
          searchTerm: undefined,
          size: 20,
          sort: ['executionSummaryInfo.lastExecutionTs', 'ASC']
        }
      }
    )
  })

  test('should show trigger icons with appropriate links to navigate to triggers', async () => {
    const useGetPipelineListMock = useGetPipelineList as jest.MockedFunction<any>
    const mutateListOfPipelines = jest.fn().mockResolvedValue(pipelines)
    useGetPipelineListMock.mockReturnValue({
      mutate: mutateListOfPipelines,
      loading: false,
      cancel: jest.fn()
    })

    renderPipelinesListPage('ci')
    const rows = await screen.findAllByRole('row')
    const webhookPipeline = rows[7]
    const cronPipeline = rows[8]

    expect(
      within(webhookPipeline).getByRole('link', {
        name: /trigger/i
      })
    ).toHaveAttribute(
      'href',
      routes.toTriggersDetailPage({
        ...getModuleParams('ci'),
        pipelineIdentifier: 'Prod3NGSanity',
        storeType: 'INLINE',
        triggerIdentifier: 'CDPNGProd3_Sanity'
      } as any)
    )

    expect(
      within(cronPipeline).getByRole('link', {
        name: /trigger/i
      })
    ).toHaveAttribute(
      'href',
      routes.toTriggersDetailPage({
        ...getModuleParams('ci'),
        pipelineIdentifier: 'DBAlertingPreQA',
        storeType: 'INLINE',
        triggerIdentifier: 'preqaeverymonday'
      } as any)
    )
  })
})

describe('Pipeline List Page with git details', () => {
  test('url contains git info', async () => {
    const useGetPipelineListMock = useGetPipelineList as jest.MockedFunction<any>
    const mutateListOfPipelines = jest.fn().mockResolvedValue(pipelines)
    useGetPipelineListMock.mockReturnValue({
      mutate: mutateListOfPipelines,
      loading: false,
      cancel: jest.fn()
    })

    renderPipelinesListPage('ci')
    const rows = await screen.findAllByRole('row')
    const remotePipeline = rows[6]
    expect(
      within(remotePipeline).getByRole('link', {
        name: /mb-gh-work-abcd/i
      })
    ).toHaveAttribute(
      'href',
      routes.toPipelineStudio({
        ...getModuleParams('ci'),
        pipelineIdentifier: 'mbghworkabcd',
        repoName: 'Repo1',
        connectorRef: 'Connector1',
        storeType: 'REMOTE'
      } as any)
    )
  })
})
