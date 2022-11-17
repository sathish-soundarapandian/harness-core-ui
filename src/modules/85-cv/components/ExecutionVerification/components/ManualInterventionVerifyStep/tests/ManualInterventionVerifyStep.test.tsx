/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import { ExecutionNode, useHandleManualInterventionInterrupt } from 'services/pipeline-ng'
import { Strategy } from '@pipeline/utils/FailureStrategyUtils'
import { accountPathProps, executionPathProps, pipelineModuleParams } from '@common/utils/routeUtils'
import { data } from '@cd/pages/Resources/SampleColumnsData'
import routes from '@common/RouteDefinitions'
import { ManualInterventionVerifyStep } from '../ManualInterventionVerifyStep'
import { mockedVerifyStepWithStatusWaiting, pathParams } from './ManualInterventionVerifyStep.mock'

const mutate = jest.fn()
jest.mock('services/pipeline-ng', () => ({
  useHandleManualInterventionInterrupt: jest.fn(() => ({ mutate }))
}))

const showError = jest.fn()
jest.mock('@harness/uicore', () => ({
  ...jest.requireActual('@harness/uicore'),
  useToaster: jest.fn(() => ({ showError }))
}))

const TEST_PATH = routes.toExecutionPipelineView({
  ...accountPathProps,
  ...executionPathProps,
  ...pipelineModuleParams
})

const AllStrategies = Object.values(Strategy)

describe('Unit tests for ManualInterventionVerifyStep', () => {
  test('should render the permissible Actions Dropdown when there is a need of Manual Interruption', () => {
    const { container } = render(
      <TestWrapper path={TEST_PATH} pathParams={pathParams}>
        <ManualInterventionVerifyStep step={mockedVerifyStepWithStatusWaiting as unknown as ExecutionNode} />
      </TestWrapper>
    )
    expect(container.querySelector('input[name="permissibleActions"]')).toBeInTheDocument()
  })

  test('should not render the permissible Actions Dropdown when there is no Manual Interruption required', () => {
    const stepWithErrorStatus = { ...mockedVerifyStepWithStatusWaiting, status: 'ERROR' }
    const { container } = render(
      <TestWrapper path={TEST_PATH} pathParams={pathParams}>
        <ManualInterventionVerifyStep step={stepWithErrorStatus as unknown as ExecutionNode} />
      </TestWrapper>
    )
    expect(container.querySelector('input[name="permissibleActions"]')).not.toBeInTheDocument()
  })

  test('should set the particular permission action once it is selected', async () => {
    const { container } = render(
      <TestWrapper path={TEST_PATH} pathParams={pathParams}>
        <ManualInterventionVerifyStep step={mockedVerifyStepWithStatusWaiting as unknown as ExecutionNode} />
      </TestWrapper>
    )
    const strategy = 'Ignore'

    const permissibleActionDropdown = container.querySelector('input[name="permissibleActions"]') as Element

    expect(permissibleActionDropdown).not.toBeNull()

    userEvent.click(permissibleActionDropdown)

    userEvent.click(screen.getByText(strategy))

    await waitFor(() => {
      expect(mutate).toHaveBeenLastCalledWith(undefined, {
        headers: { 'content-type': 'application/json' },
        queryParams: {
          accountIdentifier: pathParams.accountId,
          interruptType: strategy,
          orgIdentifier: pathParams.orgIdentifier,
          projectIdentifier: pathParams.projectIdentifier
        }
      })
    })
  })

  test('handles error', () => {
    ;(useHandleManualInterventionInterrupt as jest.Mock).mockImplementationOnce(() => ({
      mutate,
      error: { message: 'error occured' }
    }))

    render(
      <TestWrapper path={TEST_PATH} pathParams={pathParams}>
        <ManualInterventionVerifyStep step={data as any} allowedStrategies={AllStrategies} />
      </TestWrapper>
    )

    expect(showError).toHaveBeenCalled()
  })
})
