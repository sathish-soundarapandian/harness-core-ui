/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { render, RenderResult, screen } from '@testing-library/react'
import React from 'react'
import routes from '@common/RouteDefinitions'
import { accountPathProps, executionPathProps, pipelineModuleParams } from '@common/utils/routeUtils'
import { TestWrapper } from '@common/utils/testUtils'
import { useGetExecutionData } from 'services/pipeline-ng'
import { ExecutionCompiledYaml, ExecutionCompiledYamlProps } from '../ExecutionCompiledYaml'
jest.mock('services/pipeline-ng')

const TEST_PATH = routes.toExecutionPipelineView({
  ...accountPathProps,
  ...executionPathProps,
  ...pipelineModuleParams
})
const pathParams = {
  accountId: 'TEST_ACCOUNT_ID',
  orgIdentifier: 'TEST_ORG',
  projectIdentifier: 'TEST_PROJECT',
  pipelineIdentifier: 'TEST_PIPELINE',
  executionIdentifier: 'TEST_EXECUTION',
  module: 'cd',
  source: 'executions',
  stageId: 'selectedStageId'
}

const useGetExecutionDataMock = useGetExecutionData as jest.MockedFunction<any>

const renderExecutionCompiledYaml = (props: Partial<ExecutionCompiledYamlProps> = {}): RenderResult =>
  render(
    <TestWrapper path={TEST_PATH} pathParams={pathParams}>
      <ExecutionCompiledYaml
        executionSummary={{ name: 'TestRun success', planExecutionId: 'planExecutionId', runSequence: 10 }}
        onClose={jest.fn()}
        {...props}
      />
    </TestWrapper>
  )

describe('ExecutionCompiledYaml view', () => {
  test('should show drawer with loading', () => {
    useGetExecutionDataMock.mockReturnValue({
      data: {
        data: null
      },
      loading: true,
      refetch: jest.fn()
    })

    renderExecutionCompiledYaml()
    expect(screen.getByText('Loading, please wait...')).toBeInTheDocument()
  })

  test('should show drawer with valid response data', async () => {
    useGetExecutionDataMock.mockReturnValue({
      data: {
        data: { executionYaml: 'testcode' }
      },
      loading: false,
      refetch: jest.fn()
    })
    renderExecutionCompiledYaml()
    expect(screen.getByTestId('execution-compiled-yaml-viewer')).toBeInTheDocument()
  })

  test('should show drawer error', async () => {
    useGetExecutionDataMock.mockReturnValue({
      data: null,
      loading: false,
      error: { message: 'error' },
      refetch: jest.fn()
    })
    renderExecutionCompiledYaml()
    expect(screen.queryByTestId('execution-compiled-yaml-viewer')).not.toBeInTheDocument()
  })
})
