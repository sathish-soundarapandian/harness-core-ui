/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { findByText, getAllByText, render, waitFor, getByText, screen, fireEvent, within } from '@testing-library/react'
import * as routerMock from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { findDialogContainer, findPopoverContainer, TestWrapper } from '@common/utils/testUtils'
import * as FeatureFlag from '@common/hooks/useFeatureFlag'
import * as cdng from 'services/cd-ng'
import * as commonHooks from '@common/hooks'
import { accountPathProps, pipelineModuleParams, pipelinePathProps } from '@common/utils/routeUtils'
import routes from '@common/RouteDefinitions'
import pipelineList from '@pipeline/pages/execution-list/__tests__/mocks/pipeline-list.json'
import { sourceCodeManagers } from '@connectors/mocks/mock'
import {
  filterAPI,
  summaryAPI
} from '@cd/components/EnvironmentsV2/EnvironmentDetails/EnvironmentDetailSummary/__test__/EnvDetailSummary.mock'
import { useGetActiveServiceInstanceDetailsGroupedByPipelineExecution } from 'services/cd-ng'
import ServiceDetailsSummaryV2 from '../ServiceDetailsSummaryV2'
import {
  activeInstanceDetail,
  activeInstanceGroupByEnv,
  artifactInstanceDetailsMock,
  artifactTableMock,
  envInstanceDetailsMock,
  getCustomSequenceStatusMock,
  openTaskMock
} from './ServiceDetailsMocks'

const mockGetCallFunction = jest.fn()

jest.mock('react-timeago', () => () => 'dummy date')

// eslint-disable-next-line jest-no-mock
jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom') as any),
  useParams: jest.fn().mockReturnValue({ serviceId: 'serviceTest' })
}))

jest.mock('@common/hooks', () => ({
  ...(jest.requireActual('@common/hooks') as any),
  useMutateAsGet: jest.fn().mockImplementation(() => {
    return { data: envInstanceDetailsMock, refetch: jest.fn(), loading: false, error: false }
  })
}))

jest.mock('services/cd-ng', () => ({
  useListGitSync: jest.fn().mockImplementation(() => {
    return { data: null, refetch: jest.fn(), loading: false, error: false }
  }),
  useGetEnvironmentInstanceDetails: jest.fn().mockImplementation(() => {
    return { data: envInstanceDetailsMock, refetch: jest.fn(), loading: false, error: false }
  }),
  useGetArtifactInstanceDetails: jest.fn().mockImplementation(() => {
    return { data: artifactInstanceDetailsMock, refetch: jest.fn(), loading: false, error: false }
  }),
  useGetActiveInstanceGroupedByEnvironment: jest.fn().mockImplementation(() => {
    return { data: activeInstanceGroupByEnv, refetch: jest.fn(), loading: false, error: false }
  }),
  useGetActiveInstanceGroupedByArtifact: jest.fn().mockImplementation(() => {
    return { data: artifactTableMock, refetch: jest.fn(), loading: false, error: false }
  }),
  useGetActiveServiceInstanceDetailsGroupedByPipelineExecution: jest.fn().mockImplementation(() => {
    return { data: activeInstanceDetail, refetch: jest.fn(), loading: false, error: false }
  }),
  useGetGlobalFreezeWithBannerDetails: jest.fn().mockReturnValue({ data: null, loading: false }),
  useGetOpenTasks: jest.fn().mockImplementation(() => {
    return { data: openTaskMock, refetch: jest.fn(), loading: false, error: false }
  }),
  useGetCustomSequenceStatus: jest.fn().mockImplementation(() => {
    return { data: getCustomSequenceStatusMock, refetch: jest.fn(), loading: false, error: false }
  })
}))

jest.mock('services/cd-ng-rq', () => ({
  useGetSourceCodeManagersQuery: jest.fn().mockImplementation(() => {
    return { data: sourceCodeManagers, refetch: jest.fn() }
  })
}))

jest.mock('services/pipeline-ng', () => ({
  useGetListOfExecutions: jest.fn(() => ({
    mutate: jest.fn(() => Promise.resolve(summaryAPI)),
    loading: false,
    cancel: jest.fn()
  })),
  useGetPipelineList: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return { mutate: jest.fn(() => Promise.resolve(pipelineList)), cancel: jest.fn(), loading: false }
  }),
  useHandleInterrupt: jest.fn(() => ({})),
  useGetExecutionData: jest.fn().mockImplementation(() => ({
    data: jest.fn(() => Promise.resolve({ executionYaml: 'testyaml' })),
    loading: false
  })),
  useHandleStageInterrupt: jest.fn(() => ({})),
  useGetFilterList: jest.fn().mockImplementation(() => {
    return { mutate: jest.fn(() => Promise.resolve(filterAPI)), loading: false }
  }),
  useGetInputsetYaml: jest.fn(() => ({ data: null })),
  useDebugPipelineExecuteWithInputSetYaml: jest.fn(() => ({
    loading: false,
    refetch: jest.fn(),
    mutate: jest.fn().mockResolvedValue({
      data: {
        correlationId: '',
        status: 'SUCCESS',
        metaData: null,
        data: {}
      }
    })
  }))
}))

const getModuleParams = (module = 'cd') => ({
  accountId: 'accountId',
  orgIdentifier: 'orgIdentifier',
  projectIdentifier: 'projectIdentifier',
  module
})

const TEST_PATH = routes.toDeployments({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams })

const configurations = (): void => {
  beforeEach(() => {
    jest.spyOn(FeatureFlag, 'useFeatureFlags').mockReturnValue({
      CDC_SERVICE_DASHBOARD_REVAMP_NG: true
    })
  })
  beforeAll(() => {
    jest.spyOn(global.Date, 'now').mockReturnValue(1603645966706)
  })
  afterAll(() => {
    jest.spyOn(global.Date, 'now').mockReset()
  })
}

const toggleToArtifact = (container: HTMLElement): void => {
  //toggle to artifact view
  const artifactTab = container.querySelector('[data-name="toggle-option-two"]')
  expect(artifactTab).toBeInTheDocument()
  userEvent.click(artifactTab!)
}

describe('Service Detail Summary - ', () => {
  configurations()
  test('Initial render - basic snapshot', () => {
    const { container } = render(
      <TestWrapper path={TEST_PATH} pathParams={getModuleParams()}>
        <ServiceDetailsSummaryV2 />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('Test ServiceDetailsDialog', async () => {
    window.open = jest.fn()
    const { container } = render(
      <TestWrapper path={TEST_PATH} pathParams={getModuleParams()}>
        <ServiceDetailsSummaryV2 />
      </TestWrapper>
    )

    const viewInTableBtn = container.querySelector(
      'button[aria-label="cd.environmentDetailPage.viewInTable"]'
    ) as HTMLButtonElement
    userEvent.click(viewInTableBtn)
    const fullTableDialog = findDialogContainer()
    expect(fullTableDialog).toBeTruthy()

    //assert - ServiceEnvTable
    expect(getByText(fullTableDialog!, 'demo-env-Test-pdc')).toBeInTheDocument()
    expect(getByText(fullTableDialog!, 'win-pdc-demo')).toBeInTheDocument()
    expect(getAllByText(fullTableDialog!, '/test-artifact')[0]).toBeInTheDocument()
    expect(getAllByText(fullTableDialog!, 'cd.preProductionType')[0]).toBeInTheDocument()

    //assert - ServiceInstanceView
    const pipelineId = getAllByText(fullTableDialog!, 'testPipelineId')
    userEvent.click(pipelineId[0])
    const instanceRow = getByText(fullTableDialog!, 'Instance - 1')
    userEvent.click(instanceRow)

    //instance details
    expect(getByText(fullTableDialog!, 'testHostName')).toBeInTheDocument()

    //open execution
    const openExecBtn = fullTableDialog?.querySelector('button[aria-label="cd.openExecution"]') as HTMLButtonElement
    userEvent.click(openExecBtn)

    await waitFor(() => expect(window.open).toHaveBeenCalledTimes(1))
    expect(window.open).toBeCalledWith(
      expect.stringContaining(
        `/account/undefined/home/orgs/undefined/projects/undefined/pipelines/testPipelineId/deployments/testPipelineExecId/pipeline`
      )
    )
  })

  test('Test ServiceDetailsEnvTable', async () => {
    const { container } = render(
      <TestWrapper path={TEST_PATH} pathParams={getModuleParams()}>
        <ServiceDetailsSummaryV2 />
      </TestWrapper>
    )

    const viewInTableBtn = container.querySelector(
      'button[aria-label="cd.environmentDetailPage.viewInTable"]'
    ) as HTMLButtonElement
    userEvent.click(viewInTableBtn)
    const fullTableDialog = findDialogContainer()
    expect(fullTableDialog).toBeTruthy()

    //row click and check if the instanceview is updated
    const envName = getByText(fullTableDialog!, 'demo-env-Test-pdc')
    expect(envName).toBeInTheDocument()
    userEvent.click(envName)

    await waitFor(() => expect(useGetActiveServiceInstanceDetailsGroupedByPipelineExecution).toHaveBeenCalled())
  })

  test('Test ServiceDetail Cards and Env Filter', async () => {
    const { container } = render(
      <TestWrapper path={TEST_PATH} pathParams={getModuleParams()}>
        <ServiceDetailsSummaryV2 />
      </TestWrapper>
    )

    // card click
    const envName = getByText(container, 'demo-env-Test-pdc')
    expect(envName).toBeInTheDocument()

    const envTitle = envName.parentElement
    expect(envTitle?.parentElement).not.toHaveClass('Card--selected')
    userEvent.click(envTitle?.parentElement!)
    expect(envTitle?.parentElement).toHaveClass('Card--selected')
    userEvent.click(envTitle?.parentElement!)
    expect(envTitle?.parentElement).not.toHaveClass('Card--selected')

    //open table with env filter
    const viewTableEnvFilter = getByText(container, '4 Pipeline.execution.instances')
    expect(viewTableEnvFilter).toBeInTheDocument()
    userEvent.click(viewTableEnvFilter)

    const fullTableDialog = findDialogContainer()
    expect(fullTableDialog).toBeTruthy()

    const closeBtn = fullTableDialog?.querySelector('.Dialog--close')
    userEvent.click(closeBtn!)
    await waitFor(() => expect(findDialogContainer()).toBeNull())
  })

  test('Test ServiceDetail Artifact Cards and Artifact Filter', async () => {
    const { container } = render(
      <TestWrapper path={TEST_PATH} pathParams={getModuleParams()}>
        <ServiceDetailsSummaryV2 />
      </TestWrapper>
    )

    //toggle to artifact view
    toggleToArtifact(container)

    // artifact card click
    const artifactName = getByText(container, 'testArtifactDisplayName')
    expect(artifactName).toBeInTheDocument()
    expect(artifactName.parentElement).not.toHaveClass('Card--selected')
    userEvent.click(artifactName.parentElement!)
    expect(artifactName.parentElement).toHaveClass('Card--selected')

    userEvent.click(artifactName.parentElement!)
    expect(artifactName.parentElement).not.toHaveClass('Card--selected')
  })

  test('Test ServiceDetailsArtifactTable', async () => {
    const { container } = render(
      <TestWrapper path={TEST_PATH} pathParams={getModuleParams()}>
        <ServiceDetailsSummaryV2 />
      </TestWrapper>
    )

    toggleToArtifact(container)

    const viewInTableBtn = container.querySelector(
      'button[aria-label="cd.environmentDetailPage.viewInTable"]'
    ) as HTMLButtonElement
    userEvent.click(viewInTableBtn)
    const fullTableDialog = findDialogContainer()
    expect(fullTableDialog).toBeTruthy()

    //row click and check if the instanceview is updated
    const artifactName = getByText(fullTableDialog!, 'testArtifactName2')
    expect(artifactName).toBeInTheDocument()
    userEvent.click(artifactName)

    await waitFor(() => expect(useGetActiveServiceInstanceDetailsGroupedByPipelineExecution).toHaveBeenCalled())
  })

  test('Test OpenTasks', async () => {
    render(
      <TestWrapper path={TEST_PATH} pathParams={getModuleParams()}>
        <ServiceDetailsSummaryV2 />
      </TestWrapper>
    )

    //banner visible
    expect(screen.getByText('cd.openTask.seeOpenTask')).toBeInTheDocument()
  })

  test('Test ServiceDetail Env Cards and drift test', async () => {
    window.open = jest.fn()
    const { container } = render(
      <TestWrapper path={TEST_PATH} pathParams={getModuleParams()}>
        <ServiceDetailsSummaryV2 />
      </TestWrapper>
    )

    const envName = getByText(container, 'demo-env-Test-pdc')
    expect(envName).toBeInTheDocument()

    const driftedArtifact = getByText(container, 'test-artifact:1.0')
    expect(driftedArtifact).toBeInTheDocument()
    fireEvent.mouseOver(driftedArtifact)
    await waitFor(() => expect(screen.getByText('cd.serviceDashboard.driftDetection')).toBeInTheDocument())
    const popover = findPopoverContainer()

    expect(popover).not.toBeNull()
    userEvent.click(within(popover!).getByText('sampleEnv31'))
    expect(window.open).toBeCalledWith(expect.stringContaining('/account/undefined/environments/sampleEnv31/details'))
  })

  test('Test ServiceDetail Artifact Cards and drift test', async () => {
    window.open = jest.fn()
    const { container } = render(
      <TestWrapper path={TEST_PATH} pathParams={getModuleParams()}>
        <ServiceDetailsSummaryV2 />
      </TestWrapper>
    )

    //toggle to artifact view
    toggleToArtifact(container)

    // artifact card click
    const artifactName = getByText(container, 'testArtifactDisplayName')
    expect(artifactName).toBeInTheDocument()

    const driftedEnvGroup = getByText(container, 'demodriftgroup')
    expect(driftedEnvGroup).toBeInTheDocument()
    fireEvent.mouseOver(driftedEnvGroup)
    await waitFor(() => expect(screen.getByText('cd.serviceDashboard.driftDetection')).toBeInTheDocument())
    const popover = findPopoverContainer()

    expect(popover).not.toBeNull()
    expect(within(popover!).getByText('demodrift:1.0')).toBeInTheDocument()
    userEvent.click(within(popover!).getAllByText('dummy date')[0])
    expect(window.open).toBeCalledWith(
      expect.stringContaining(
        '/account/undefined/home/orgs/undefined/projects/undefined/pipelines/waitpipetest/deployments/exectestplan/pipeline'
      )
    )
  })
})

describe('Service Detail Summary - other states (empty, loading, error)', () => {
  configurations()
  test('Test ServiceDetailsDialog - empty states', () => {
    jest.spyOn(cdng, 'useGetActiveInstanceGroupedByEnvironment').mockImplementation(() => {
      return {
        data: null,
        loading: false,
        error: false,
        refetch: jest.fn()
      } as any
    })
    jest.spyOn(cdng, 'useGetActiveServiceInstanceDetailsGroupedByPipelineExecution').mockImplementation(() => {
      return {
        data: null,
        loading: false,
        error: false,
        refetch: jest.fn()
      } as any
    })
    const { container } = render(
      <TestWrapper path={TEST_PATH} pathParams={getModuleParams()}>
        <ServiceDetailsSummaryV2 />
      </TestWrapper>
    )

    const viewInTableBtn = container.querySelector(
      'button[aria-label="cd.environmentDetailPage.viewInTable"]'
    ) as HTMLButtonElement
    userEvent.click(viewInTableBtn)
    const fullTableDialog = findDialogContainer()

    expect(findByText(fullTableDialog!, 'cd.environmentDetailPage.noServiceArtifactMsg')).toBeTruthy()
    expect(findByText(fullTableDialog!, 'cd.environmentDetailPage.noInstancesToShow')).toBeTruthy()
  })

  test('Test ServiceDetailsDialog - error states', () => {
    jest.spyOn(cdng, 'useGetActiveInstanceGroupedByEnvironment').mockImplementation(() => {
      return {
        data: null,
        loading: false,
        error: true,
        refetch: jest.fn()
      } as any
    })
    jest.spyOn(cdng, 'useGetActiveServiceInstanceDetailsGroupedByPipelineExecution').mockImplementation(() => {
      return {
        data: null,
        loading: false,
        error: true,
        refetch: jest.fn()
      } as any
    })
    const { container } = render(
      <TestWrapper path={TEST_PATH} pathParams={getModuleParams()}>
        <ServiceDetailsSummaryV2 />
      </TestWrapper>
    )

    const viewInTableBtn = container.querySelector(
      'button[aria-label="cd.environmentDetailPage.viewInTable"]'
    ) as HTMLButtonElement
    userEvent.click(viewInTableBtn)
    const fullTableDialog = findDialogContainer()

    const retry = fullTableDialog!.querySelectorAll('button[aria-label="Retry"]')
    userEvent.click(retry[0])
    userEvent.click(retry[1])
    expect(fullTableDialog!.querySelector('[data-test="ServiceEnvTableError"]')).toBeTruthy()
    expect(fullTableDialog!.querySelector('[data-test="ServiceInstancesError"]')).toBeTruthy()
  })

  test('Test ServiceDetailsDialog - loading states', () => {
    jest.spyOn(cdng, 'useGetActiveInstanceGroupedByEnvironment').mockImplementation(() => {
      return {
        data: null,
        loading: true,
        error: false,
        refetch: jest.fn()
      } as any
    })
    jest.spyOn(cdng, 'useGetActiveServiceInstanceDetailsGroupedByPipelineExecution').mockImplementation(() => {
      return {
        data: null,
        loading: true,
        error: false,
        refetch: jest.fn()
      } as any
    })
    const { container } = render(
      <TestWrapper path={TEST_PATH} pathParams={getModuleParams()}>
        <ServiceDetailsSummaryV2 />
      </TestWrapper>
    )

    const viewInTableBtn = container.querySelector(
      'button[aria-label="cd.environmentDetailPage.viewInTable"]'
    ) as HTMLButtonElement
    userEvent.click(viewInTableBtn)
    const fullTableDialog = findDialogContainer()

    expect(fullTableDialog!.querySelector('[data-test="ServiceInstancesLoading"]')).toBeTruthy()
    expect(fullTableDialog!.querySelector('[data-test="ServiceEnvTableLoading"]')).toBeTruthy()
  })

  test('Test ServiceDetailsCardView - error states', () => {
    jest.spyOn(commonHooks, 'useMutateAsGet').mockImplementation(() => {
      return { loading: false, error: 'Some error occurred', data: undefined, refetch: jest.fn() } as any
    })
    const { container } = render(
      <TestWrapper path={TEST_PATH} pathParams={getModuleParams()}>
        <ServiceDetailsSummaryV2 />
      </TestWrapper>
    )

    const retry = container.querySelector('button[aria-label="Retry"]')
    userEvent.click(retry!)
    expect(container.querySelector('[data-test="ServiceDetailsEnvCardError"]')).toBeTruthy()
  })

  test('Test ServiceDetailsCardView - loading states', () => {
    jest.spyOn(commonHooks, 'useMutateAsGet').mockImplementation(() => {
      return { loading: true, error: false, data: undefined, refetch: jest.fn() } as any
    })
    const { container } = render(
      <TestWrapper path={TEST_PATH} pathParams={getModuleParams()}>
        <ServiceDetailsSummaryV2 />
      </TestWrapper>
    )

    expect(container.querySelector('[data-test="ServiceDetailsEnvCardLoading"]')).toBeTruthy()
  })

  test('Test ServiceDetailsCardView - empty states', () => {
    jest.spyOn(commonHooks, 'useMutateAsGet').mockImplementation(() => {
      return { loading: false, error: false, data: undefined, refetch: jest.fn() } as any
    })
    jest.spyOn(routerMock, 'useParams').mockReturnValue({ serviceId: undefined })
    const { container } = render(
      <TestWrapper path={TEST_PATH} pathParams={getModuleParams()}>
        <ServiceDetailsSummaryV2 />
      </TestWrapper>
    )

    expect(getByText(container, 'pipeline.ServiceDetail.envCardEmptyStateMsg')).toBeTruthy()
  })

  test('Test ServiceArtifactTable - empty states', () => {
    jest.spyOn(cdng, 'useGetActiveInstanceGroupedByArtifact').mockImplementation(() => {
      return {
        data: null,
        loading: false,
        error: false,
        refetch: jest.fn()
      } as any
    })
    jest.spyOn(cdng, 'useGetActiveServiceInstanceDetailsGroupedByPipelineExecution').mockImplementation(() => {
      return {
        data: null,
        loading: false,
        error: false,
        refetch: jest.fn()
      } as any
    })
    const { container } = render(
      <TestWrapper path={TEST_PATH} pathParams={getModuleParams()}>
        <ServiceDetailsSummaryV2 />
      </TestWrapper>
    )

    toggleToArtifact(container)

    const viewInTableBtn = container.querySelector(
      'button[aria-label="cd.environmentDetailPage.viewInTable"]'
    ) as HTMLButtonElement
    userEvent.click(viewInTableBtn)
    const fullTableDialog = findDialogContainer()

    expect(findByText(fullTableDialog!, 'cd.environmentDetailPage.noServiceArtifactMsg')).toBeTruthy()
    expect(findByText(fullTableDialog!, 'cd.environmentDetailPage.selectArtifactMsg')).toBeTruthy()
  })

  test('Test ServiceArtifactTable - error states', () => {
    jest.spyOn(cdng, 'useGetActiveInstanceGroupedByArtifact').mockImplementation(() => {
      return {
        data: null,
        loading: false,
        error: true,
        refetch: jest.fn()
      } as any
    })
    jest.spyOn(cdng, 'useGetActiveServiceInstanceDetailsGroupedByPipelineExecution').mockImplementation(() => {
      return {
        data: null,
        loading: false,
        error: true,
        refetch: jest.fn()
      } as any
    })
    const { container } = render(
      <TestWrapper path={TEST_PATH} pathParams={getModuleParams()}>
        <ServiceDetailsSummaryV2 />
      </TestWrapper>
    )

    toggleToArtifact(container)

    const viewInTableBtn = container.querySelector(
      'button[aria-label="cd.environmentDetailPage.viewInTable"]'
    ) as HTMLButtonElement
    userEvent.click(viewInTableBtn)
    const fullTableDialog = findDialogContainer()

    const retry = fullTableDialog!.querySelectorAll('button[aria-label="Retry"]')
    userEvent.click(retry[0])
    userEvent.click(retry[1])
    expect(fullTableDialog!.querySelector('[data-test="ServiceArtifactTableError"]')).toBeTruthy()
    expect(fullTableDialog!.querySelector('[data-test="ServiceInstancesError"]')).toBeTruthy()
  })

  test('Test ServiceArtifactTable - loading states', () => {
    jest.spyOn(cdng, 'useGetActiveInstanceGroupedByArtifact').mockImplementation(() => {
      return {
        data: null,
        loading: true,
        error: false,
        refetch: jest.fn()
      } as any
    })
    jest.spyOn(cdng, 'useGetActiveServiceInstanceDetailsGroupedByPipelineExecution').mockImplementation(() => {
      return {
        data: null,
        loading: true,
        error: false,
        refetch: jest.fn()
      } as any
    })
    const { container } = render(
      <TestWrapper path={TEST_PATH} pathParams={getModuleParams()}>
        <ServiceDetailsSummaryV2 />
      </TestWrapper>
    )

    toggleToArtifact(container)

    const viewInTableBtn = container.querySelector(
      'button[aria-label="cd.environmentDetailPage.viewInTable"]'
    ) as HTMLButtonElement
    userEvent.click(viewInTableBtn)
    const fullTableDialog = findDialogContainer()

    expect(fullTableDialog!.querySelector('[data-test="ServiceInstancesLoading"]')).toBeTruthy()
    expect(fullTableDialog!.querySelector('[data-test="ServiceArtifactTableLoading"]')).toBeTruthy()
  })
})
