import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react-dom/test-utils'
import { TestWrapper } from '@common/utils/testUtils'
import CheckboxWithPrompt from '../CheckboxWithPrompt'

describe('CheckboxWithPrompt', () => {
  test('CheckboxWithPrompt should render checkbox with all given props correctly', () => {
    const onChange = jest.fn()
    const { container } = render(
      <TestWrapper>
        <CheckboxWithPrompt checkboxLabel="test" onChange={onChange} checked popupTitleText="Test popup title" />
      </TestWrapper>
    )

    expect(container.querySelector('input[type="checkbox"]')).toBeInTheDocument()
    expect(screen.getByText(/test/)).toBeInTheDocument()
  })

  test('CheckboxWithPrompt should show the popup on uncheck of checkbox', async () => {
    const onChange = jest.fn()
    const { container } = render(
      <TestWrapper>
        <CheckboxWithPrompt
          checkboxLabel="test"
          checkboxName="test checkbox name"
          onChange={onChange}
          checked
          showPromptOnUnCheck
          popupTitleText="Test popup title"
        />
      </TestWrapper>
    )

    expect(container.querySelector('input[type="checkbox"]')).toBeInTheDocument()

    act(() => {
      userEvent.click(container.querySelector('input[type="checkbox"]')!)
    })

    expect(onChange).not.toHaveBeenCalled()

    expect(document.body.querySelector('[class*="useConfirmationDialog"]')).toBeDefined()

    const modalDeleteBtn = screen.queryAllByText('confirm')[0]
    act(() => {
      userEvent.click(modalDeleteBtn!)
    })

    await waitFor(() => {
      expect(document.body.innerHTML).not.toContain('useConfirmationDialog')
    })

    expect(onChange).toHaveBeenCalledWith(false, 'test checkbox name')
  })

  test('CheckboxWithPrompt should not show the popup on uncheck of checkbox, if showPromptOnUnCheck prop is not passed', async () => {
    const onChange = jest.fn()
    const { container } = render(
      <TestWrapper>
        <CheckboxWithPrompt
          checkboxLabel="test"
          checkboxName="test checkbox name"
          onChange={onChange}
          checked
          popupTitleText="Test popup title"
        />
      </TestWrapper>
    )

    act(() => {
      userEvent.click(container.querySelector('input[type="checkbox"]')!)
    })

    expect(onChange).toHaveBeenCalledWith(false, 'test checkbox name')
  })
})
