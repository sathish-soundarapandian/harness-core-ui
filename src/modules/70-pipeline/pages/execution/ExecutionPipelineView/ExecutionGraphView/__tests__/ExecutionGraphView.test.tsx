/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, within } from '@testing-library/react'
import { TestWrapper, CurrentLocation } from '@common/utils/testUtils'
import type { ExecutionPathProps, GitQueryParams, ModulePathParams } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import {
  accountPathProps,
  executionPathProps,
  modulePathProps,
  orgPathProps,
  pipelinePathProps,
  projectPathProps
} from '@common/utils/routeUtils'
import ExecutionContext from '@pipeline/context/ExecutionContext'
import type { ExecutionContextParams } from '@pipeline/context/ExecutionContext'
import { getPipelineStagesMap } from '@pipeline/utils/executionUtils'
import mockCD from './mock.json'
import mockCI from './mock-ci.json'
import mockError from './mock-error.json'
import ExecutionGraphView from '../ExecutionGraphView'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')
jest.mock('@common/utils/YamlUtils', () => ({}))

jest.mock('services/pipeline-ng', () => ({
  useGetInputsetYaml: jest.fn(() => ({ data: null })),
  useGetBarriersExecutionInfo: jest.fn(() => ({ data: null })),
  useHandleStageInterrupt: jest.fn(() => ({})),
  useHandleInterrupt: jest.fn(() => ({})),
  useGetBarrierInfo: jest.fn(() => ({})),
  useGetResourceConstraintsExecutionInfo: jest.fn(() => ({ refetch: () => ({}), data: null })),
  useGetExecutionNode: jest.fn(() => ({ data: {}, loading: false }))
}))

window.ResizeObserver =
  window.ResizeObserver ||
  jest.fn().mockImplementation(() => ({
    disconnect: jest.fn(),
    observe: jest.fn(),
    unobserve: jest.fn()
  }))

const mockIntersectionObserver = jest.fn()
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null
})
window.IntersectionObserver = mockIntersectionObserver

const contextValue = (mock: any = mockCD): ExecutionContextParams => ({
  pipelineExecutionDetail: mock.data as any,
  allNodeMap: mock.data.executionGraph.nodeMap as any,
  pipelineStagesMap: getPipelineStagesMap(
    mock.data.pipelineExecutionSummary.layoutNodeMap as any,
    mock.data.pipelineExecutionSummary.startingNodeId
  ),
  childPipelineStagesMap: new Map([]),
  allStagesMap: getPipelineStagesMap(
    mock.data.pipelineExecutionSummary.layoutNodeMap as any,
    mock.data.pipelineExecutionSummary.startingNodeId
  ),
  selectedStageId: 'google_1',
  selectedStageExecutionId: '',
  selectedStepId: '',
  selectedCollapsedNodeId: '',
  loading: false,
  isDataLoadedForSelectedStage: true,
  queryParams: {
    connectorRef: 'testConnector',
    repoName: 'testRepo',
    branch: 'testBranch',
    storeType: 'REMOTE'
  },
  logsToken: 'token',
  setLogsToken: jest.fn(),
  addNewNodeToMap: jest.fn()
})

const fetchMock = jest.spyOn(global, 'fetch' as any)
fetchMock.mockResolvedValue({
  text: () => new Promise(resolve => resolve('')),
  json: () => new Promise(resolve => resolve({})),
  headers: { get: () => 'application/json' }
})

const PATH = routes.toExecutionPipelineView({
  ...accountPathProps,
  ...modulePathProps,
  ...orgPathProps,
  ...projectPathProps,
  ...pipelinePathProps,
  ...executionPathProps
})

const PATH_PARAMS: ExecutionPathProps & ModulePathParams = {
  accountId: 'testAccount',
  orgIdentifier: 'testOrg',
  projectIdentifier: 'testProject',
  pipelineIdentifier: 'testPipeline',
  executionIdentifier: 'testExec',
  module: 'cd',
  source: 'executions'
}

const QUERY_PARAMS: GitQueryParams = {
  connectorRef: 'testConnector',
  repoName: 'testRepo',
  branch: 'testBranch',
  storeType: 'REMOTE'
}

describe('<ExecutionGraphView /> tests', () => {
  const dateToString = jest.spyOn(Date.prototype, 'toLocaleString')

  beforeAll(() => {
    dateToString.mockImplementation(() => 'DUMMY DATE')
  })

  afterAll(() => {
    dateToString.mockRestore()
  })
  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('renders execution graphs with CD data', () => {
    const { container } = render(
      <TestWrapper>
        <ExecutionContext.Provider value={contextValue()}>
          <ExecutionGraphView />
          <CurrentLocation />
        </ExecutionContext.Provider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('renders execution graphs with CI data', () => {
    const { container } = render(
      <TestWrapper>
        <ExecutionContext.Provider value={contextValue(mockCI)}>
          <ExecutionGraphView />
          <CurrentLocation />
        </ExecutionContext.Provider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('if pipeline errors are visible', () => {
    const { queryByText } = render(
      <TestWrapper>
        <ExecutionContext.Provider value={contextValue(mockError)}>
          <ExecutionGraphView />
          <CurrentLocation />
        </ExecutionContext.Provider>
      </TestWrapper>
    )
    expect(queryByText('Some error message')).toBeTruthy()
  })

  test('stage selection works', async () => {
    const { getByTestId } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS as unknown as any} queryParams={QUERY_PARAMS as unknown as any}>
        <ExecutionContext.Provider value={contextValue()}>
          <ExecutionGraphView />
          <CurrentLocation />
        </ExecutionContext.Provider>
      </TestWrapper>
    )

    expect(getByTestId('location')).toMatchInlineSnapshot(`
      <div
        data-testid="location"
      >
        /account/testAccount/cd/orgs/testOrg/projects/testProject/pipelines/testPipeline/executions/testExec/pipeline?connectorRef=testConnector&repoName=testRepo&branch=testBranch&storeType=REMOTE
      </div>
    `)

    const stage = (await document.querySelector('.nodeNameText.stageName')) as HTMLElement
    fireEvent.click(within(stage).getByText('Google1'))

    expect(getByTestId('location')).toMatchInlineSnapshot(`
      <div
        data-testid="location"
      >
        /account/testAccount/cd/orgs/testOrg/projects/testProject/pipelines/testPipeline/executions/testExec/pipeline?connectorRef=testConnector&repoName=testRepo&branch=testBranch&storeType=REMOTE&stage=google_1
      </div>
    `)
  })

  test('stage selection does not works for "NotStarted" status', async () => {
    const { getByTestId } = render(
      <TestWrapper>
        <ExecutionContext.Provider value={contextValue()}>
          <ExecutionGraphView />
          <CurrentLocation />
        </ExecutionContext.Provider>
      </TestWrapper>
    )
    const stage = (await document.querySelector('#qastage')) as HTMLElement

    fireEvent.click(stage)

    expect(getByTestId('location')).toMatchInlineSnapshot(`
      <div
        data-testid="location"
      >
        /
      </div>
    `)
  })

  test('step selection works', async () => {
    const { findByText, getByTestId } = render(
      <TestWrapper path={PATH} pathParams={PATH_PARAMS as unknown as any} queryParams={QUERY_PARAMS as unknown as any}>
        <ExecutionContext.Provider value={contextValue()}>
          <ExecutionGraphView />
          <CurrentLocation />
        </ExecutionContext.Provider>
      </TestWrapper>
    )

    expect(getByTestId('location')).toMatchInlineSnapshot(`
      <div
        data-testid="location"
      >
        /account/testAccount/cd/orgs/testOrg/projects/testProject/pipelines/testPipeline/executions/testExec/pipeline?connectorRef=testConnector&repoName=testRepo&branch=testBranch&storeType=REMOTE
      </div>
    `)

    const step = await findByText('Rollout Deployment')

    fireEvent.click(step)

    expect(getByTestId('location')).toMatchInlineSnapshot(`
      <div
        data-testid="location"
      >
        /account/testAccount/cd/orgs/testOrg/projects/testProject/pipelines/testPipeline/executions/testExec/pipeline?connectorRef=testConnector&repoName=testRepo&branch=testBranch&storeType=REMOTE&stage=google_1&step=K8sRollingUuid
      </div>
    `)
  })

  test('step selection does not works for "NotStarted" status', async () => {
    const { findByText, getByTestId } = render(
      <TestWrapper>
        <ExecutionContext.Provider value={contextValue()}>
          <ExecutionGraphView />
          <CurrentLocation />
        </ExecutionContext.Provider>
      </TestWrapper>
    )

    const step = await findByText('RolloutSecond')

    fireEvent.click(step)

    expect(getByTestId('location')).toMatchInlineSnapshot(
      `
      <div
        data-testid="location"
      >
        /
      </div>
    `
    )
  })
  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('step details are shown when step is selected', async () => {
    const { container } = render(
      <TestWrapper>
        <ExecutionContext.Provider
          value={{
            ...contextValue(),
            queryParams: { step: 'K8sRollingUuid' },
            selectedStepId: 'K8sRollingUuid'
          }}
        >
          <ExecutionGraphView />
          <CurrentLocation />
        </ExecutionContext.Provider>
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
