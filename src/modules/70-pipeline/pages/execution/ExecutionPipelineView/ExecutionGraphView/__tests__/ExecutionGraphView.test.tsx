/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, within } from '@testing-library/react'
import { TestWrapper, CurrentLocation } from '@common/utils/testUtils'
import type { ExecutionNode } from 'services/pipeline-ng'

import type { ExecutionPipelineNode } from '@pipeline/components/ExecutionStageDiagram/ExecutionPipelineModel'
import type { ExecutionStageDiagramProps } from '@pipeline/components/ExecutionStageDiagram/ExecutionStageDiagram'
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

function renderNode(
  data: ExecutionPipelineNode<ExecutionNode>,
  itemClickHandler: ExecutionStageDiagramProps<ExecutionNode>['itemClickHandler']
): React.ReactElement {
  const { parallel, group, item } = data

  if (parallel) {
    return (
      <div data-stage="parallel" key={parallel[0].item?.identifier}>
        {parallel.map(e => renderNode(e, itemClickHandler))}
      </div>
    )
  }
  if (group) {
    return (
      <div data-stage="group" key={group.identifier} data-group={group.name}>
        {group.items.map(e => renderNode(e, itemClickHandler))}
      </div>
    )
  }

  if (item) {
    return (
      <div
        data-item={item.identifier}
        data-status={item.status}
        key={item.identifier}
        onClick={e => {
          e.stopPropagation()
          itemClickHandler?.({ ...e, stage: item } as any)
        }}
      >
        {item?.name}
      </div>
    )
  }

  return <div data-item="empty" />
}

jest.mock('@pipeline/components/ExecutionStageDiagram/ExecutionStageDiagram', () => {
  // eslint-disable-next-line react/function-component-definition
  return function ExecutionStageDiagramMock(props: ExecutionStageDiagramProps<ExecutionNode>) {
    const { data, itemClickHandler } = props
    return <div data-testid="execution-stage-diagram-mock">{data?.items.map(e => renderNode(e, itemClickHandler))}</div>
  }
})

const contextValue = (mock: any = mockCD): ExecutionContextParams => ({
  pipelineExecutionDetail: mock.data as any,
  allNodeMap: mock.data.executionGraph.nodeMap as any,
  pipelineStagesMap: getPipelineStagesMap(
    mock.data.pipelineExecutionSummary.layoutNodeMap as any,
    mock.data.pipelineExecutionSummary.startingNodeId
  ),
  selectedStageId: 'google_1',
  selectedStageExecutionId: '',
  selectedStepId: '',
  loading: false,
  isDataLoadedForSelectedStage: true,
  queryParams: {},
  logsToken: 'token',
  setLogsToken: jest.fn(),
  addNewNodeToMap: jest.fn(),
  setSelectedStepId: jest.fn(),
  setSelectedStageId: jest.fn(),
  setSelectedStageExecutionId: jest.fn()
})

const fetchMock = jest.spyOn(global, 'fetch' as any)
fetchMock.mockResolvedValue({
  text: () => new Promise(resolve => resolve('')),
  json: () => new Promise(resolve => resolve({})),
  headers: { get: () => 'application/json' }
})

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
      <TestWrapper>
        <ExecutionContext.Provider value={contextValue()}>
          <ExecutionGraphView />
          <CurrentLocation />
        </ExecutionContext.Provider>
      </TestWrapper>
    )
    const stage = (await document.querySelector('.nodeNameText.stageName')) as HTMLElement
    fireEvent.click(within(stage).getByText('Google1'))

    expect(getByTestId('location')).toMatchInlineSnapshot(`
      <div
        data-testid="location"
      >
        /?stage=google_1
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
      <TestWrapper>
        <ExecutionContext.Provider value={contextValue()}>
          <ExecutionGraphView />
          <CurrentLocation />
        </ExecutionContext.Provider>
      </TestWrapper>
    )

    const step = await findByText('Rollout Deployment')

    fireEvent.click(step)

    expect(getByTestId('location')).toMatchInlineSnapshot(`
      <div
        data-testid="location"
      >
        /?stage=google_1&step=K8sRollingUuid
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
