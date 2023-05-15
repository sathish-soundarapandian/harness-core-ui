/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import * as cvServices from 'services/cv'
import {
  errorBudgetResetHistoryResponse,
  testWrapperProps,
  errorMessage
} from '@cv/pages/slos/__tests__/CVSLOsListingPage.mock'
import ErrorBudgetResetHistory from '../views/ErrorBudgetResetHistory'

describe('ErrorBudgetResetHistory', () => {
  test('it should render the data', () => {
    jest
      .spyOn(cvServices, 'useGetErrorBudgetResetHistory')
      .mockImplementation(
        () => ({ data: errorBudgetResetHistoryResponse, loading: false, error: null, refetch: jest.fn() } as any)
      )

    const { container } = render(
      <TestWrapper {...testWrapperProps}>
        <ErrorBudgetResetHistory serviceLevelObjectiveIdentifier="" />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('it should render no data state', () => {
    jest
      .spyOn(cvServices, 'useGetErrorBudgetResetHistory')
      .mockImplementation(() => ({ data: null, loading: false, error: null, refetch: jest.fn() } as any))

    render(
      <TestWrapper {...testWrapperProps}>
        <ErrorBudgetResetHistory serviceLevelObjectiveIdentifier="" />
      </TestWrapper>
    )

    expect(screen.getByText('cv.noPreviousErrorBudgetResetHistoryAvailable')).toBeInTheDocument()
  })

  test('it should render loading', () => {
    jest
      .spyOn(cvServices, 'useGetErrorBudgetResetHistory')
      .mockImplementation(() => ({ data: null, loading: true, error: null, refetch: jest.fn() } as any))

    const { container } = render(
      <TestWrapper {...testWrapperProps}>
        <ErrorBudgetResetHistory serviceLevelObjectiveIdentifier="" />
      </TestWrapper>
    )

    expect(container.querySelector('[data-icon="steps-spinner"]')).toBeInTheDocument()
  })

  test('it should render error', async () => {
    const retryOnError = jest.fn()
    jest
      .spyOn(cvServices, 'useGetErrorBudgetResetHistory')
      .mockImplementation(
        () => ({ data: null, loading: false, error: { message: errorMessage }, refetch: retryOnError } as any)
      )

    render(
      <TestWrapper {...testWrapperProps}>
        <ErrorBudgetResetHistory serviceLevelObjectiveIdentifier="" />
      </TestWrapper>
    )

    expect(screen.getByText(errorMessage)).toBeInTheDocument()

    await userEvent.click(screen.getByText('Retry'))

    await waitFor(() => expect(retryOnError).toHaveBeenCalled())
  })
})
