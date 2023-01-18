import React from 'react'
import { findAllByText, findByText, fireEvent, getAllByText, render, waitFor, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import pipelineList from '@pipeline/pages/execution-list/__tests__/mocks/pipeline-list.json'
import * as FeatureFlag from '@common/hooks/useFeatureFlag'
import * as pipelineNg from 'services/pipeline-ng'
import * as cdng from 'services/cd-ng'
import { sourceCodeManagers } from '@connectors/mocks/mock'
import routes from '@common/RouteDefinitions'
import { accountPathProps, pipelineModuleParams, pipelinePathProps } from '@common/utils/routeUtils'
import EnvironmentDetailSummary from '../EnvironmentDetailSummary'
import {
  activeInstanceAPI,
  emptyActiveInstanceCall,
  envAPI,
  filterAPI,
  mockInstancePopoverResponse,
  noResultFoundResponse,
  summaryAPI
} from './EnvDetailSummary.mock'

const mockGetCallFunction = jest.fn()

const environmentIdentifier = 'Env_Test'
jest.mock('react-timeago', () => () => 'dummy date')

// eslint-disable-next-line jest-no-mock
jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom') as any),
  useParams: jest.fn().mockReturnValue({ environmentIdentifier: 'Env_Test' })
}))

jest.mock('services/cd-ng', () => ({
  useListGitSync: jest.fn().mockImplementation(() => {
    return { data: null, refetch: jest.fn(), loading: false, error: false }
  }),
  useGetActiveServiceInstancesForEnvironment: jest.fn().mockImplementation(() => {
    return { data: activeInstanceAPI, refetch: jest.fn(), loading: false, error: false }
  }),
  useGetEnvironmentV2: jest.fn().mockImplementation(() => {
    return {
      data: envAPI,
      refetch: jest.fn(),
      loading: false,
      error: false
    }
  }),
  useGetInstancesDetails: jest.fn().mockImplementation(() => {
    return {
      data: mockInstancePopoverResponse,
      refetch: jest.fn(),
      loading: false,
      error: false
    }
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

describe('Environment Detail Summary', () => {
  beforeEach(() => {
    jest.spyOn(FeatureFlag, 'useFeatureFlags').mockReturnValue({
      CDC_ENVIRONMENT_DASHBOARD_NG: true
    })
  })
  beforeAll(() => {
    jest.spyOn(global.Date, 'now').mockReturnValue(1603645966706)
  })
  afterAll(() => {
    jest.spyOn(global.Date, 'now').mockReset()
  })
  test('Initial render - basic snapshot', async () => {
    const { container } = render(
      <TestWrapper path={TEST_PATH} pathParams={getModuleParams()}>
        <EnvironmentDetailSummary environmentIdentifiers={environmentIdentifier} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('Render data in table', async () => {
    const { getByText } = render(
      <TestWrapper path={TEST_PATH} pathParams={getModuleParams()}>
        <EnvironmentDetailSummary environmentIdentifiers={environmentIdentifier} />
      </TestWrapper>
    )

    //see data in table
    const viewInTableBtn = getByText('cd.environmentDetailPage.viewInTable')
    expect(viewInTableBtn).toBeTruthy()
    userEvent.click(viewInTableBtn)

    const fullTableDialog = findDialogContainer()
    expect(findAllByText(fullTableDialog!, 'cd.serviceDashboard.artifact')).toBeTruthy()
    expect(findAllByText(fullTableDialog!, 'cd.environmentDetailPage.infraSlashCluster')).toBeTruthy()
    expect(findAllByText(fullTableDialog!, 'svc1')).toBeTruthy()
    userEvent.click(await findByText(fullTableDialog!, 'svc2'))
    userEvent.click(await findByText(fullTableDialog!, 'svc1'))

    //instance table
    const infraText = getAllByText(fullTableDialog!, 'infraStructure4')
    fireEvent.click(infraText[0])
    await waitFor(() => expect(getByText('pipelineLink2')))

    const closeBtn = fullTableDialog?.querySelector('.Dialog--close')
    fireEvent.click(closeBtn!)
  })

  test('test execution list search', async () => {
    jest.spyOn(pipelineNg, 'useGetListOfExecutions').mockImplementation(() => {
      return {
        mutate: jest.fn(() => Promise.resolve(noResultFoundResponse)),
        loading: false,
        cancel: jest.fn(),
        error: false
      } as any
    })
    const { container, getByText } = render(
      <TestWrapper path={TEST_PATH} pathParams={getModuleParams()}>
        <EnvironmentDetailSummary environmentIdentifiers={environmentIdentifier} />
      </TestWrapper>
    )
    const searchField = container.querySelector('[class*="ExpandingSearchInput"]')
    expect(searchField).toBeTruthy()
    userEvent.type(screen.getByPlaceholderText('Search'), 'my search term')
    jest.runOnlyPendingTimers()

    await waitFor(() => expect(getByText('cd.environmentDetailPage.emptyExecutionListMsg')).toBeTruthy())
  })

  test('test active instance empty state', () => {
    jest.spyOn(cdng, 'useGetActiveServiceInstancesForEnvironment').mockImplementation(() => {
      return {
        data: emptyActiveInstanceCall,
        loading: false,
        error: false,
        refetch: jest.fn()
      } as any
    })
    const { getByText } = render(
      <TestWrapper path={TEST_PATH} pathParams={getModuleParams()}>
        <EnvironmentDetailSummary environmentIdentifiers={environmentIdentifier} />
      </TestWrapper>
    )
    expect(getByText('cd.environmentDetailPage.emptyServiceDetailMsg')).toBeTruthy()
  })

  test('test active instance loading state', () => {
    jest.spyOn(cdng, 'useGetActiveServiceInstancesForEnvironment').mockImplementation(() => {
      return {
        data: emptyActiveInstanceCall,
        loading: true,
        error: false,
        refetch: jest.fn()
      } as any
    })
    const { container } = render(
      <TestWrapper path={TEST_PATH} pathParams={getModuleParams()}>
        <EnvironmentDetailSummary environmentIdentifiers={environmentIdentifier} />
      </TestWrapper>
    )
    expect(container.querySelectorAll('span[data-icon="spinner"]')[0]).toBeTruthy()
  })
  test('test active instance error state', () => {
    jest.spyOn(cdng, 'useGetActiveServiceInstancesForEnvironment').mockImplementation(() => {
      return {
        data: emptyActiveInstanceCall,
        loading: false,
        error: {
          data: {
            responseMessages: ['error']
          }
        },
        refetch: jest.fn()
      } as any
    })
    const { container, getByText } = render(
      <TestWrapper path={TEST_PATH} pathParams={getModuleParams()}>
        <EnvironmentDetailSummary environmentIdentifiers={environmentIdentifier} />
      </TestWrapper>
    )
    fireEvent.click(container.querySelector('button[aria-label="Retry"]')!)
    expect(getByText('We cannot perform your request at the moment. Please try again.')).toBeTruthy()
  })
})
