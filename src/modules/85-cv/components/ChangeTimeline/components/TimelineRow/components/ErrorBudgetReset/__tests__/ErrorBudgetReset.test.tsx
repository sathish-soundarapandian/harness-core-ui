/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import * as cvServices from 'services/cv'
import ErrorBudgetReset, { ErrorBudgetResetProps } from '../ErrorBudgetReset'
import { SLO_WIDGETS } from '../../../TimelineRow.constants'
import { mockedSecondaryEventsDetailsResponse } from './ErrorBudgetReset.mock'

function WrapperComponent(props: ErrorBudgetResetProps): JSX.Element {
  return (
    <TestWrapper>
      <ErrorBudgetReset {...props} />
    </TestWrapper>
  )
}

jest.mock('services/cv', () => ({
  useGetSecondaryEventDetails: jest.fn().mockImplementation(() => ({
    data: mockedSecondaryEventsDetailsResponse,
    loading: false,
    error: null,
    refetch: jest.fn()
  }))
}))

describe('ErrorBudgetReset', () => {
  const props = {
    widget: {
      endTime: 1679660280000,
      startTime: 1679660280000,
      icon: {
        height: 16,
        width: 16,
        url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTciIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNyAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxyZWN0IHg9IjAuNSIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiByeD0iOCIgZmlsbD0iIzdENEREMyIgLz4KICAgIDxwYXRoCiAgICAgIGQ9Ik04LjgwMTQ3IDYuNjQwMTdDOS4xMjY1OSA1LjY4NTk0IDguOTAzMDkgNC41ODk2NCA4LjEzMDk4IDMuODE4MUM3LjQ2MDQ5IDMuMTQ4MTEgNi41NDYxOSAyLjg4NDEgNS42OTI4NyAzLjA0NjU2QzUuNDY5MzcgMy4wODcyIDUuMzg4MTYgMy4zNzE0MyA1LjU1MDU4IDMuNTMzODZMNi41MDU1MiA0LjQ4ODA5QzYuOTMyMjcgNC45MTQ1MiA2LjkzMjI3IDUuNTg0MzYgNi41MDU1MiA2LjAxMDc5QzYuMDc4NzcgNi40MzcyMiA1LjQwODQzIDYuNDM3MjIgNC45ODE2OCA2LjAxMDc5TDQuMDI2NzQgNS4wNTY1NkMzLjg2NDE4IDQuODk0MTIgMy41Nzk3NCA0Ljk3NTQxIDMuNTM5MDcgNS4xOTg3NUMzLjM5Njc4IDYuMDUxNDYgMy42NDA2OSA2Ljk4NTQyIDQuMzExMTkgNy42MzUwNEM1LjA4MzMgOC40MDY1OCA2LjE4MDQzIDguNjA5NTMgNy4xMzUzNyA4LjMwNTAzTDExLjQ4MzQgMTIuNjQ5OEMxMS45NTA3IDEzLjExNjcgMTIuNzAyNSAxMy4xMTY3IDEzLjE0OTUgMTIuNjQ5OEMxMy42MTY4IDEyLjE4MjkgMTMuNjE2OCAxMS40MzE2IDEzLjE0OTUgMTAuOTg0OUw4LjgwMTQ3IDYuNjQwMTdaIgogICAgICBmaWxsPSJ3aGl0ZSIKICAgIC8+CiAgPC9zdmc+'
      },
      type: SLO_WIDGETS.ERROR_BUDGET_RESET,
      identifiers: ['zCyEg2AJQ4Kq2awF4iujI7'],
      leftOffset: 1043.7857589440778
    },
    index: 0
  }

  test('should be able to verify that ErrorBudgetReset component loads with appropriate data', async () => {
    const { getByText, getByTestId } = render(<WrapperComponent {...props} />)
    const errorBudgetResetIcon = getByTestId('errorBudgetResetIcon')
    await waitFor(() => expect(errorBudgetResetIcon).toBeInTheDocument())

    await userEvent.click(errorBudgetResetIcon)
    await waitFor(() => expect(getByText('cv.errorBudgetIncrease')).toBeInTheDocument())
  })

  test('should show loading icon when in loading phase', async () => {
    jest.spyOn(cvServices, 'useGetSecondaryEventDetails').mockReturnValue({
      data: null,
      loading: true
    } as any)

    const { getByTestId } = render(<WrapperComponent {...props} />)
    const errorBudgetResetIcon = getByTestId('errorBudgetResetIcon')
    await waitFor(() => expect(errorBudgetResetIcon).toBeInTheDocument())

    await userEvent.click(errorBudgetResetIcon)
    expect(getByTestId('loadingIcon')).toBeInTheDocument()
  })

  test('should render error state when api to fetch annotation details errors out', async () => {
    jest.spyOn(cvServices, 'useGetSecondaryEventDetails').mockReturnValue({
      data: null,
      loading: false,
      error: {
        message: 'Failed to fetch secondary event details'
      }
    } as any)
    const { getByText } = render(<WrapperComponent {...props} />)
    expect(getByText('Failed to fetch secondary event details')).toBeInTheDocument()
  })
})
