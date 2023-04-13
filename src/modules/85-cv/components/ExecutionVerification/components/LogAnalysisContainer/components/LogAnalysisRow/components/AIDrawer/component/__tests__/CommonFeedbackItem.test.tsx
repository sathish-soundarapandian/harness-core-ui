import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import CommonFeedbackItem from '../CommonFeedbackItem'

describe('CommonFeedbackItem', () => {
  test('should render null if no label is present', () => {
    const { container } = render(
      <TestWrapper>
        <CommonFeedbackItem label="" value="ABC" />
      </TestWrapper>
    )

    expect(container.firstChild).toBeNull()
  })

  test('should render null if no value is present', () => {
    const { container } = render(
      <TestWrapper>
        <CommonFeedbackItem label="ABC" value="" />
      </TestWrapper>
    )

    expect(container.firstChild).toBeNull()
  })
})
