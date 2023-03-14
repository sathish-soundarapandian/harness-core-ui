import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react-dom/test-utils'
import { TestWrapper } from '@common/utils/testUtils'
import type { ExecutionNode } from 'services/pipeline-ng'
import ExecutionVerificationStepShortView from '../ExecutionVerificationStepShortView'
import { executionMetadata, stepDetails, stepDetailsWithoutPolicy } from './ExecutionVerificationStepShortView.mock'

jest.mock('../../ExecutionVerificationSummary/ExecutionVerificationSummary', () => {
  return { ExecutionVerificationSummary: () => <div data-testid="ExecutionVerificationSummary" /> }
})

describe('ExecutionVerificationStepShortView', () => {
  test('ExecutionVerificationStepShortView should render the right policy details', () => {
    const { container } = render(
      <TestWrapper>
        <ExecutionVerificationStepShortView
          step={stepDetails as unknown as ExecutionNode}
          executionMetadata={executionMetadata}
        />
      </TestWrapper>
    )

    const policyTab = screen.getByRole('tab', {
      name: 'pipeline.policyEnforcement.title'
    })

    expect(screen.getByTestId(/ExecutionVerificationSummary/)).toBeInTheDocument()
    expect(policyTab).toBeInTheDocument()

    act(() => {
      userEvent.click(policyTab)
    })

    expect(screen.queryByTestId(/ExecutionVerificationSummary/)).not.toBeInTheDocument()
    expect(screen.getByText(/pipeline.policyEvaluations.policySetName/)).toBeInTheDocument()
    expect(screen.getByText(/pipeline.executionStatus.Success/)).toBeInTheDocument()
    expect(container.querySelector('[data-icon="tick-circle"]')).toBeInTheDocument()
  })

  test('ExecutionVerificationStepShortView should not render policy enforcement if there is no policy data available', () => {
    render(
      <TestWrapper>
        <ExecutionVerificationStepShortView
          step={stepDetailsWithoutPolicy as unknown as ExecutionNode}
          executionMetadata={executionMetadata}
        />
      </TestWrapper>
    )

    expect(screen.getByTestId(/ExecutionVerificationSummary/)).toBeInTheDocument()

    expect(
      screen.queryByRole('tab', {
        name: 'pipeline.policyEnforcement.title'
      })
    ).not.toBeInTheDocument()
  })
})
