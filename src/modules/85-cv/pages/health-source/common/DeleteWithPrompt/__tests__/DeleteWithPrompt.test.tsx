import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react-dom/test-utils'
import { TestWrapper } from '@common/utils/testUtils'
import DeleteWithPrompt from '../DeleteWithPrompt'

describe('DeleteWithPrompt', () => {
  test('DeleteWithPrompt should render delete icon with given props correctly', async () => {
    const onClick = jest.fn()
    const { container } = render(
      <TestWrapper>
        <DeleteWithPrompt index={0} onClick={onClick} itemName="testItem" showPromptOnDelete />
      </TestWrapper>
    )

    expect(container.querySelector('span[data-icon="main-delete"]')).toBeInTheDocument()

    act(() => {
      userEvent.click(container.querySelector('span[data-icon="main-delete"]')!)
    })

    expect(onClick).not.toHaveBeenCalled()

    expect(document.body.querySelector('[class*="useConfirmationDialog"]')).toBeDefined()

    const modalDeleteBtn = screen.queryAllByText('confirm')[0]
    act(() => {
      userEvent.click(modalDeleteBtn!)
    })

    await waitFor(() => {
      expect(document.body.innerHTML).not.toContain('useConfirmationDialog')
    })

    expect(onClick).toHaveBeenCalledWith('testItem', 0)
  })

  test('DeleteWithPrompt should not show popup, if showPromptOnDelete prop is not given', async () => {
    const onClick = jest.fn()
    const { container } = render(
      <TestWrapper>
        <DeleteWithPrompt index={0} onClick={onClick} itemName="testItem" />
      </TestWrapper>
    )

    expect(container.querySelector('span[data-icon="main-delete"]')).toBeInTheDocument()

    act(() => {
      userEvent.click(container.querySelector('span[data-icon="main-delete"]')!)
    })

    expect(onClick).toHaveBeenCalledWith('testItem', 0)
  })
})
