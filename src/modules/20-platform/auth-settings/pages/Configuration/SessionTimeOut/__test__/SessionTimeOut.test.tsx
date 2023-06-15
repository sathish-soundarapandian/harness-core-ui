import React from 'react'
import { render, act, fireEvent, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { useSetSessionTimeoutAtAccountLevel } from 'services/cd-ng'
import SessionTimeOut from '../SessionTimeOut'
let showSuccessCalled = false
let showErrorCalled = false
jest.mock('@harness/uicore', () => ({
  ...jest.requireActual('@harness/uicore'),

  useToaster: jest.fn().mockImplementation(() => {
    return {
      showSuccess: jest.fn().mockImplementation(() => {
        showSuccessCalled = true
      }),
      showError: jest.fn().mockImplementation(() => {
        showErrorCalled = true
      })
    }
  })
}))
jest.mock('services/cd-ng', () => ({
  useSetSessionTimeoutAtAccountLevel: jest.fn().mockReturnValue({ mutate: jest.fn() })
}))

describe('Session time out settings', () => {
  test('set session timeout', async () => {
    const { container } = render(
      <TestWrapper pathParams={{ accountId: 'testAcc' }}>
        <SessionTimeOut timeout={30} />
      </TestWrapper>
    )

    const inputBox = container.getElementsByClassName('bp3-input')[0]
    await waitFor(() => {
      expect(inputBox.getAttribute('value')).toBe('30')
    })
    expect(inputBox.getAttribute('value')).toBe('30')
  })
  test('save timeout', async () => {
    let updateSessionTimeout = false
    ;(useSetSessionTimeoutAtAccountLevel as jest.Mock).mockImplementation().mockReturnValue({
      error: false,
      mutate: jest.fn().mockImplementation(() => {
        updateSessionTimeout = true
        return Promise.resolve({ metaData: {}, resource: true, responseMessages: [] })
      })
    })

    const { container, getByText } = render(
      <TestWrapper pathParams={{ accountId: 'testAcc' }}>
        <SessionTimeOut timeout={630} />
      </TestWrapper>
    )

    const inputBox = container.getElementsByClassName('bp3-input')[0]
    await waitFor(() => {
      expect(inputBox.getAttribute('value')).toBe('630')
    })
    expect(inputBox.getAttribute('value')).toBe('630')
    await act(async () => {
      fireEvent.click(getByText('save'))
    })
    await waitFor(() => {
      expect(updateSessionTimeout).toBeTruthy()
    })
    expect(updateSessionTimeout).toBeTruthy()
    await waitFor(() => {
      expect(showSuccessCalled).toBeTruthy()
    })
    expect(showSuccessCalled).toBeTruthy()
  })
  test('error on save timeout', async () => {
    ;(useSetSessionTimeoutAtAccountLevel as jest.Mock).mockImplementation().mockReturnValue({
      error: true,
      mutate: jest.fn().mockImplementation(() => {
        return Promise.resolve({ metaData: {}, resource: false, responseMessages: [] })
      })
    })

    const { container, getByText } = render(
      <TestWrapper pathParams={{ accountId: 'testAcc' }}>
        <SessionTimeOut timeout={630} />
      </TestWrapper>
    )

    const inputBox = container.getElementsByClassName('bp3-input')[0]
    await waitFor(() => {
      expect(inputBox.getAttribute('value')).toBe('630')
    })
    expect(inputBox.getAttribute('value')).toBe('630')

    await act(async () => {
      fireEvent.click(getByText('save'))
    })
    await waitFor(() => {
      expect(showErrorCalled).toBeTruthy()
    })
    expect(showErrorCalled).toBeTruthy()
  })

  test('saving state on save timeout', async () => {
    ;(useSetSessionTimeoutAtAccountLevel as jest.Mock).mockImplementation().mockReturnValue({
      error: false,
      loading: true,
      mutate: jest.fn().mockImplementation(() => {
        return Promise.resolve({ metaData: {}, resource: false, responseMessages: [] })
      })
    })

    const { container, getByText } = render(
      <TestWrapper pathParams={{ accountId: 'testAcc' }}>
        <SessionTimeOut timeout={630} />
      </TestWrapper>
    )

    const inputBox = container.getElementsByClassName('bp3-input')[0]
    await waitFor(() => {
      expect(inputBox.getAttribute('value')).toBe('630')
    })
    expect(inputBox.getAttribute('value')).toBe('630')

    await act(async () => {
      fireEvent.click(getByText('save'))
    })
    await waitFor(() => {
      expect(getByText('common.saving')).toBeDefined()
    })
    expect(getByText('common.saving')).toBeDefined()
  })
})
