import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import FeedbackHistoryDisplay from '../FeedbackHistoryDisplay'

describe('FeedbackHistoryDisplay', () => {
  test('should render null if no feedbacks are present', () => {
    const { container } = render(
      <TestWrapper>
        <FeedbackHistoryDisplay />
      </TestWrapper>
    )

    expect(container.firstChild).toBeNull()
  })

  test('should render null if no logFeedback is present in feedbacks props', () => {
    const { container } = render(
      <TestWrapper>
        <FeedbackHistoryDisplay
          feedbacks={[{ createdBy: 'pranesh.g@harness.io', updatedBy: 'pranesh.g@harness.io' }]}
        />
      </TestWrapper>
    )

    expect(container.firstChild).toBeNull()
  })
})
