/*
 * Copyright 2020 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import mockImport from 'framework/utils/mockImport'
import { getMockFor_useGetPipeline } from '@pipeline/components/RunPipelineModal/__tests__/mocks'

import { TestWrapper } from '@common/utils/testUtils'
import { executionPathProps, modulePathProps } from '@common/utils/routeUtils'
import routes from '@common/RouteDefinitions'

import { SavedExecutionViewTypes } from '@pipeline/components/LogsContent/LogsContent'
import ExecutionPipelineView from '../ExecutionPipelineView'

jest.mock('../ExecutionGraphView/ExecutionGraphView', () => {
  // eslint-disable-next-line react/display-name
  return () => <div data-testid="view">ExecutionGraphView</div>
})

jest.mock('../ExecutionLogView/ExecutionLogView', () => {
  // eslint-disable-next-line react/display-name
  return () => <div data-testid="view">ExecutionLogView</div>
})

jest.mock('services/pipeline-ng', () => ({
  useGetPipeline: jest.fn(() => getMockFor_useGetPipeline())
}))

describe('<ExecutionPipelineView /> tests', () => {
  test('renders graph view by default', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <ExecutionPipelineView />
      </TestWrapper>
    )

    expect(getByTestId('view').innerHTML).toBe('ExecutionGraphView')
  })

  test('renders log view with correct params', () => {
    const { getByTestId } = render(
      <TestWrapper queryParams={{ view: SavedExecutionViewTypes.LOG }}>
        <ExecutionPipelineView />
      </TestWrapper>
    )

    expect(getByTestId('view').innerHTML).toBe('ExecutionLogView')
  })

  test('renders graph view with correct params', () => {
    const { getByTestId } = render(
      <TestWrapper queryParams={{ view: SavedExecutionViewTypes.GRAPH }}>
        <ExecutionPipelineView />
      </TestWrapper>
    )

    expect(getByTestId('view').innerHTML).toBe('ExecutionGraphView')
  })

  test('renders log view with correct params by default, with FF CI_YAML_VERSIONING ON for CI module', () => {
    mockImport('@common/hooks/useFeatureFlag', {
      useFeatureFlags: () => ({ CI_YAML_VERSIONING: true })
    })
    const { getByTestId } = render(
      <TestWrapper
        path={routes.toExecutionPipelineView({ ...executionPathProps, ...modulePathProps })}
        pathParams={{
          accountId: 'acc',
          orgIdentifier: 'org',
          projectIdentifier: 'project',
          pipelineIdentifier: 'pipeline',
          executionIdentifier: 'execution',
          source: 'deployments',
          module: 'ci'
        }}
      >
        <ExecutionPipelineView />
      </TestWrapper>
    )

    expect(getByTestId('view').innerHTML).toBe('ExecutionLogView')
  })
})
