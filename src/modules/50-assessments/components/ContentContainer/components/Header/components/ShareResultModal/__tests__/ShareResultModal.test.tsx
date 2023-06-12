import { fireEvent, render } from '@testing-library/react'
import React from 'react'
import { TestWrapper } from '@common/utils/testUtils'
import ShareResultModal from '../ShareResultModal'

jest.mock('copy-to-clipboard', () => jest.fn())
describe('Share result modal', () => {
  test('should be able to copy and share results', () => {
    const { container, getByTestId } = render(
      <TestWrapper>
        <ShareResultModal isOpen={true} setOpen={jest.fn()} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
    const copyButton = getByTestId('copyLink')
    expect(copyButton).toBeInTheDocument()
    fireEvent.click(copyButton)
  })
})
