/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { render, screen } from '@testing-library/react'
import React from 'react'
import routes from '@common/RouteDefinitions'
import { accountPathProps, executionPathProps, pipelineModuleParams } from '@common/utils/routeUtils'
import { TestWrapper } from '@common/utils/testUtils'
import { ExecutionCompiledYaml } from '../ExecutionCompiledYaml'

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

describe('ExecutionCompiledYaml view', () => {
  test('should show dialog with title with warning', () => {
    jest.mock('services/pipeline-ng', () => ({
      useGetExecutionData: jest.fn(() => ({ error: { message: 'error occured' } }))
    }))
    render(
      <TestWrapper path={TEST_PATH} pathParams={pathParams}>
        <ExecutionCompiledYaml
          executionSummary={{ name: 'TestRun', planExecutionId: 'planExecutionId', runSequence: 10 }}
          onClose={jest.fn()}
        />
      </TestWrapper>
    )
    expect(
      screen.getByRole('heading', {
        name: /testrun/i
      })
    ).toBeInTheDocument()
  })

  test('should show dialog with valid response data', async () => {
    jest.mock('services/pipeline-ng', () => ({
      useGetExecutionData: jest.fn(() => ({ data: { data: { executionYaml: 'testcode' } } }))
    }))
    render(
      <TestWrapper path={TEST_PATH} pathParams={pathParams}>
        <ExecutionCompiledYaml
          executionSummary={{ name: 'TestRun success', planExecutionId: 'planExecutionId', runSequence: 10 }}
          onClose={jest.fn()}
        />
      </TestWrapper>
    )
    expect(screen.getByTestId('execution-compiled-yaml-viewer')).toBeInTheDocument()
  })
})
