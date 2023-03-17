import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import RiskItemIndicator from '../component/RiskItemIndicator'

describe('FeedbackHistoryDisplay', () => {
  test('should render null if no risk is passed via props', () => {
    const { container } = render(
      <TestWrapper>
        <RiskItemIndicator />
      </TestWrapper>
    )

    expect(container.firstChild).toBeNull()
  })
})
