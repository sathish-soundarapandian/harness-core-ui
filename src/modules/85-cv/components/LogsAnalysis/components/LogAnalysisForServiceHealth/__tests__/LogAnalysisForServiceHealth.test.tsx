import React from 'react'
import { render, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import type { LogAnalysisProps } from '@cv/components/ExecutionVerification/components/LogAnalysisContainer/LogAnalysis.types'
import LogAnalysisForServiceHealth from '../LogAnalysisForServiceHealth'
import {
  mockLogAnalysisForServiceHealthProps,
  mockLogAnalysisForServiceHealthPropsWithError,
  mockLogAnalysisForServiceHealthPropsWithNoData
} from './LogAnalysisForServiceHealth.test.mock'

describe('LogAnalysisForServiceHealth', () => {
  test('LogAnalysisForServiceHealth should render loading UI, when logs are loading', async () => {
    render(
      <TestWrapper>
        <LogAnalysisForServiceHealth {...(mockLogAnalysisForServiceHealthProps as LogAnalysisProps)} />
      </TestWrapper>
    )

    const loadingUI = await screen.findByTestId(/logAnalysisForServiceHealth-loadingLogs/)

    expect(loadingUI).toBeInTheDocument()
  })

  test('LogAnalysisForServiceHealth should render error UI, when logs props valid error', async () => {
    render(
      <TestWrapper>
        <LogAnalysisForServiceHealth {...(mockLogAnalysisForServiceHealthPropsWithError as LogAnalysisProps)} />
      </TestWrapper>
    )

    const errorUI = await screen.findByTestId(/LogAnalysisList_error/)

    expect(errorUI).toBeInTheDocument()
  })

  test('LogAnalysisForServiceHealth should render no data UI, logAnalysisData is empty and clusterChartLoading is not loading', async () => {
    render(
      <TestWrapper>
        <LogAnalysisForServiceHealth {...(mockLogAnalysisForServiceHealthPropsWithNoData as LogAnalysisProps)} />
      </TestWrapper>
    )

    const noDataUI = await screen.findByTestId(/LogAnalysisList_NoData/)

    expect(noDataUI).toBeInTheDocument()
  })
})
