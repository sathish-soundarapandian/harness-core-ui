/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import type { LogAnalysisRowData } from '@cv/components/ExecutionVerification/components/LogAnalysisContainer/LogAnalysis.types'
import { LogAnalysisDetailsDrawer } from '../LogAnalysisDetailsDrawer'
import type { LogAnalysisDetailsDrawerProps } from '../LogAnalysisDetailsDrawer.types'
import { drawerPropsMockData } from './LogAnalysisDetailsDrawer.mock'

const WrapperComponent = (props: LogAnalysisDetailsDrawerProps): JSX.Element => {
  return (
    <TestWrapper>
      <LogAnalysisDetailsDrawer {...props} />
    </TestWrapper>
  )
}

describe('Unit tests for LogAnalysisRiskAndJiraModal', () => {
  const initialProps: LogAnalysisDetailsDrawerProps = {
    onHide: jest.fn(),
    ...drawerPropsMockData,
    index: null,
    onUpdatePreferenceDrawerOpen: jest.fn(),
    onJiraDrawerOpen: () => jest.fn()
  }
  test('Verify if all the fields are rendered correctly inside LogAnalysisRiskAndJiraModal', async () => {
    const { getByText } = render(<WrapperComponent {...initialProps} />)

    await waitFor(() => {
      expect(getByText('cv.logs.totalCount')).toBeInTheDocument()
      expect(getByText('Known')).toBeInTheDocument()

      expect(getByText(initialProps.rowData.count.toString())).toBeInTheDocument()

      expect(getByText('pipeline.verification.logs.sampleEvent')).not.toBeNull()
      expect(getByText('test data - host1 - log1')).toBeInTheDocument()
    })
  })

  test('should verify loading UI is shown if the data is loading', () => {
    render(<WrapperComponent {...initialProps} isDataLoading />)

    expect(screen.getByTestId('LogAnalysisDetailsDrawer_loader')).toBeInTheDocument()
  })

  test('should verify error UI is shown if the API call fails', () => {
    const errorObj = {
      message: 'Failed to fetch: Failed to fetch',
      data: 'Failed to fetch'
    }

    render(<WrapperComponent {...initialProps} logsError={errorObj} rowData={{} as unknown as LogAnalysisRowData} />)

    expect(screen.getByTestId('LogAnalysisDetailsDrawer_error')).toBeInTheDocument()
  })

  test('should not show error when data is available', () => {
    const errorObj = {
      message: 'Failed to fetch: Failed to fetch',
      data: 'Failed to fetch'
    }

    render(<WrapperComponent {...initialProps} logsError={errorObj} />)

    expect(screen.queryByTestId('LogAnalysisDetailsDrawer_error')).not.toBeInTheDocument()
  })
})
