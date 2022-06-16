/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  render,
  waitFor,
  queryByAttribute,
  fireEvent,
  findByText as findByTextGlobal,
  act
} from '@testing-library/react'
import { useLocation } from 'react-router-dom'
import { TestWrapper, TestWrapperProps } from '@common/utils/testUtils'
import { accountPathProps, pipelineModuleParams, pipelinePathProps } from '@common/utils/routeUtils'
import routes from '@common/RouteDefinitions'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import { useGetListOfExecutions } from 'services/pipeline-ng'

import { branchStatusMock, gitConfigs, sourceCodeManagers } from '@connectors/mocks/mock'
import PipelineDeploymentList from '../PipelineDeploymentList'
import data from './execution-list.json'
import pipelines from '../../../components/PipelineModalListView/__tests__/RunPipelineListViewMocks'
import filters from './filters.json'
import deploymentTypes from '../../pipelines/__tests__/mocks/deploymentTypes.json'
import services from '../../pipelines/__tests__/mocks/services.json'
import environments from '../../pipelines/__tests__/mocks/environments.json'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')
jest.mock('@common/utils/YamlUtils', () => ({}))

jest.mock('@pipeline/components/Dashboards/PipelineSummaryCards/PipelineSummaryCards', () => () => <div />)
jest.mock('@pipeline/components/Dashboards/BuildExecutionsChart/PipelineBuildExecutionsChart', () => () => <div />)

const mockGetCallFunction = jest.fn()

jest.mock('services/pipeline-ng', () => ({
  useGetListOfExecutions: jest.fn(() => ({
    mutate: jest.fn(() => Promise.resolve(data)),
    loading: false,
    cancel: jest.fn()
  })),
  useGetPipelineList: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return { mutate: jest.fn(() => Promise.resolve(pipelines)), cancel: jest.fn(), loading: false }
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
  useGetServiceDefinitionTypes: jest
    .fn()
    .mockImplementation(() => ({ loading: false, data: deploymentTypes, refetch: jest.fn() })),
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
  })
}))

function ComponentWrapper(): React.ReactElement {
  const location = useLocation()
  return (
    <React.Fragment>
      <PipelineDeploymentList onRunPipeline={jest.fn()} />
      <div data-testid="location">{`${location.pathname}${location.search}`}</div>
    </React.Fragment>
  )
}

const testWrapperProps: TestWrapperProps = {
  path: routes.toDeployments({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams }),
  pathParams: {
    accountId: 'testAcc',
    orgIdentifier: 'testOrg',
    projectIdentifier: 'testProject',
    module: 'cd'
  },
  defaultAppStoreValues
}
jest.useFakeTimers()

// eslint-disable-next-line jest/no-disabled-tests
describe('Test Pipeline Deployment list', () => {
  beforeAll(() => {
    jest.spyOn(global.Date, 'now').mockReturnValue(1603645966706)
  })
  afterAll(() => {
    jest.spyOn(global.Date, 'now').mockReset()
  })

  test('should render deployment list', async () => {
    const { container, findByText } = render(
      <TestWrapper
        path={routes.toPipelineDeploymentList({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams })}
        pathParams={{
          accountId: 'testAcc',
          orgIdentifier: 'testOrg',
          projectIdentifier: 'testProject',
          pipelineIdentifier: 'testPipeline',
          module: 'cd'
        }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <PipelineDeploymentList onRunPipeline={jest.fn()} />
      </TestWrapper>
    )
    await waitFor(() => findByText('http_pipeline', { selector: '.pipelineName' }))
    expect(container).toMatchSnapshot()
  })

  // TODO:PMS enable search once with actual API
  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('search works', () => {
    const { container, getByTestId } = render(
      <TestWrapper {...testWrapperProps}>
        <ComponentWrapper />
      </TestWrapper>
    )

    const search = queryByAttribute('type', container, 'search')!

    fireEvent.change(search, { target: { value: 'my search term' } })
    jest.runOnlyPendingTimers()

    expect(getByTestId('location')).toMatchInlineSnapshot(`
      <div
        data-testid="location"
      >
        /account/testAcc/cd/orgs/testOrg/projects/testProject/deployments?query=my%20search%20term
      </div>
    `)

    expect(useGetListOfExecutions).toHaveBeenLastCalledWith({
      queryParamStringifyOptions: { arrayFormat: 'repeat' },
      queryParams: {
        accountIdentifier: 'testAcc',
        executionStatuses: undefined,
        orgIdentifier: 'testOrg',
        page: 0,
        pipelineIdentifiers: undefined,
        projectIdentifier: 'testProject',
        searchTerm: 'my search term'
      }
    })

    const clear = queryByAttribute('data-icon', container, 'small-cross')!.closest('button')!
    fireEvent.click(clear)

    jest.runOnlyPendingTimers()

    expect(getByTestId('location')).toMatchInlineSnapshot(`
      <div
        data-testid="location"
      >
        /account/testAcc/cd/orgs/testOrg/projects/testProject/deployments?query=
      </div>
    `)

    expect(useGetListOfExecutions).toHaveBeenLastCalledWith({
      queryParamStringifyOptions: { arrayFormat: 'repeat' },
      queryParams: {
        accountIdentifier: 'testAcc',
        executionStatuses: undefined,
        orgIdentifier: 'testOrg',
        page: 0,
        pipelineIdentifiers: undefined,
        projectIdentifier: 'testProject',
        searchTerm: ''
      }
    })
  })

  test('Status selection works', async () => {
    const { getByTestId } = render(
      <TestWrapper {...testWrapperProps}>
        <ComponentWrapper />
      </TestWrapper>
    )

    const select = await waitFor(() => getByTestId('status-select')!)

    fireEvent.click(select)

    await waitFor(() => queryByAttribute('class', document.body, 'bp3-popover-content'))
    const optionFailed = await findByTextGlobal(document.body, 'pipeline.executionFilters.labels.Failed', {
      selector: '[class*="menuItem"]'
    })

    fireEvent.click(optionFailed)

    const optionExpired = await findByTextGlobal(document.body, 'pipeline.executionFilters.labels.Expired', {
      selector: '[class*="menuItem"]'
    })

    fireEvent.click(optionExpired)

    await act(async () => {
      jest.runOnlyPendingTimers()
    })

    expect(getByTestId('location')).toMatchInlineSnapshot(`
      <div
        data-testid="location"
      >
        /account/testAcc/cd/orgs/testOrg/projects/testProject/deployments?status%5B0%5D=Failed&status%5B1%5D=Expired&page=1
      </div>
    `)

    expect(useGetListOfExecutions).toHaveBeenLastCalledWith({
      body: {
        filterType: 'PipelineExecution'
      },
      queryParamStringifyOptions: { arrayFormat: 'repeat' },
      queryParams: {
        accountIdentifier: 'testAcc',
        orgIdentifier: 'testOrg',
        page: 0,
        size: 20,
        pipelineIdentifier: undefined,
        projectIdentifier: 'testProject',
        status: ['Failed', 'Expired'],
        filterIdentifier: undefined,
        module: 'cd',
        myDeployments: false,
        repoIdentifier: undefined,
        searchTerm: undefined,
        branch: undefined
      }
    })

    fireEvent.click(optionFailed)

    fireEvent.click(optionExpired)

    await act(async () => {
      jest.runOnlyPendingTimers()
    })

    expect(getByTestId('location')).toMatchInlineSnapshot(`
      <div
        data-testid="location"
      >
        /account/testAcc/cd/orgs/testOrg/projects/testProject/deployments?page=1
      </div>
    `)

    expect(useGetListOfExecutions).toHaveBeenLastCalledWith({
      body: {
        filterType: 'PipelineExecution'
      },
      queryParamStringifyOptions: { arrayFormat: 'repeat' },
      queryParams: {
        accountIdentifier: 'testAcc',
        orgIdentifier: 'testOrg',
        page: 0,
        size: 20,
        pipelineIdentifier: undefined,
        projectIdentifier: 'testProject',
        filterIdentifier: undefined,
        module: 'cd',
        myDeployments: false,
        repoIdentifier: undefined,
        searchTerm: undefined,
        status: [],
        branch: undefined
      }
    })
  })

  test('Pipeline selection works', async () => {
    const { getByTestId } = render(
      <TestWrapper {...testWrapperProps}>
        <ComponentWrapper />
      </TestWrapper>
    )

    const select = await waitFor(() => getByTestId('pipeline-select')!)

    fireEvent.click(select)

    await waitFor(() => queryByAttribute('class', document.body, 'bp3-popover-content'))

    const option1 = await findByTextGlobal(document.body, 'pipeline1', { selector: '[class*="menuItem"]' })

    fireEvent.click(option1)

    await act(async () => {
      jest.runOnlyPendingTimers()
    })

    expect(getByTestId('location')).toMatchInlineSnapshot(`
      <div
        data-testid="location"
      >
        /account/testAcc/cd/orgs/testOrg/projects/testProject/deployments?pipelineIdentifier=pipeline1&page=1
      </div>
    `)

    expect(useGetListOfExecutions).toHaveBeenLastCalledWith({
      body: {
        filterType: 'PipelineExecution'
      },
      queryParamStringifyOptions: { arrayFormat: 'repeat' },
      queryParams: {
        accountIdentifier: 'testAcc',
        orgIdentifier: 'testOrg',
        page: 0,
        size: 20,
        pipelineIdentifier: 'pipeline1',
        projectIdentifier: 'testProject',
        status: [],
        filterIdentifier: undefined,
        module: 'cd',
        myDeployments: false,
        repoIdentifier: undefined,
        searchTerm: undefined,
        branch: undefined
      }
    })

    const option2 = select.getElementsByTagName('button')[0]

    fireEvent.click(option2)

    await act(async () => {
      jest.runOnlyPendingTimers()
    })

    expect(getByTestId('location')).toMatchInlineSnapshot(`
      <div
        data-testid="location"
      >
        /account/testAcc/cd/orgs/testOrg/projects/testProject/deployments?page=1
      </div>
    `)

    expect(useGetListOfExecutions).toHaveBeenLastCalledWith({
      body: {
        filterType: 'PipelineExecution'
      },
      queryParamStringifyOptions: { arrayFormat: 'repeat' },
      queryParams: {
        accountIdentifier: 'testAcc',
        orgIdentifier: 'testOrg',
        page: 0,
        pipelineIdentifier: undefined,
        projectIdentifier: 'testProject',
        status: [],
        filterIdentifier: undefined,
        module: 'cd',
        myDeployments: false,
        repoIdentifier: undefined,
        searchTerm: undefined,
        size: 20,
        branch: undefined
      }
    })
  })

  test('Polling works', async () => {
    const { getByTestId } = render(
      <TestWrapper {...testWrapperProps}>
        <ComponentWrapper />
      </TestWrapper>
    )

    expect(getByTestId('location')).toMatchInlineSnapshot(`
      <div
        data-testid="location"
      >
        /account/testAcc/cd/orgs/testOrg/projects/testProject/deployments
      </div>
    `)

    expect(useGetListOfExecutions).toHaveBeenLastCalledWith({
      body: {
        filterType: 'PipelineExecution'
      },
      queryParamStringifyOptions: { arrayFormat: 'repeat' },
      queryParams: {
        accountIdentifier: 'testAcc',
        orgIdentifier: 'testOrg',
        page: 0,
        pipelineIdentifier: undefined,
        projectIdentifier: 'testProject',
        status: [],
        filterIdentifier: undefined,
        module: 'cd',
        myDeployments: false,
        repoIdentifier: undefined,
        searchTerm: undefined,
        size: 20,
        branch: undefined
      }
    })
  })
})
