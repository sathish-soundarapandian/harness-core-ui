/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import type { CommonChartProps } from '../CommonChart'
import CommonChart from '../CommonChart'
import { mockedTimeSeriesData } from './CommonChart.mock'

function WrapperComponent(props: CommonChartProps): JSX.Element {
  return (
    <TestWrapper>
      <CommonChart {...props} />
    </TestWrapper>
  )
}

describe('Unit tests for CommonChart', () => {
  test('Ensure CommonChart component loads correctly when there is no data', async () => {
    const props = {
      timeSeriesDataLoading: false,
      timeseriesDataError: null,
      healthSourceTimeSeriesData: []
    }
    const { getByText } = render(<WrapperComponent {...props} />)
    await waitFor(() => expect(getByText('cv.monitoringSources.commonHealthSource.chart')).toBeInTheDocument())
    await waitFor(() => expect(getByText('cv.changeSource.noDataAvaiableForCard')).toBeInTheDocument())
  })

  test('Ensure CommonChart component loads correctly when there is valid data', async () => {
    const props = {
      timeSeriesDataLoading: false,
      timeseriesDataError: null,
      healthSourceTimeSeriesData: mockedTimeSeriesData
    }
    const { getByText, queryByText, getByTestId } = render(<WrapperComponent {...props} />)
    await waitFor(() => expect(getByText('cv.monitoringSources.commonHealthSource.chart')).toBeInTheDocument())
    await waitFor(() => expect(queryByText('cv.changeSource.noDataAvaiableForCard')).not.toBeInTheDocument())
    await waitFor(() => expect(getByTestId('chart')).toBeInTheDocument())
  })

  test('Ensure CommonChart component loads correctly when there is error data', async () => {
    const props = {
      timeSeriesDataLoading: false,
      timeseriesDataError: {
        message: 'Failed to fetch chart data',
        data: 'Failed'
      },
      healthSourceTimeSeriesData: mockedTimeSeriesData
    }
    const { getByText, queryByText, queryByTestId } = render(<WrapperComponent {...props} />)
    await waitFor(() => expect(getByText('cv.monitoringSources.commonHealthSource.chart')).toBeInTheDocument())
    await waitFor(() => expect(queryByText('cv.changeSource.noDataAvaiableForCard')).not.toBeInTheDocument())
    await waitFor(() => expect(queryByTestId('chart')).not.toBeInTheDocument())
    await waitFor(() => expect(queryByTestId('error')).toBeInTheDocument())
  })

  test('Ensure CommonChart component loads correctly when there is loading data', async () => {
    const props = {
      timeSeriesDataLoading: true,
      timeseriesDataError: null,
      healthSourceTimeSeriesData: mockedTimeSeriesData
    }
    const { getByText, queryByText, queryByTestId } = render(<WrapperComponent {...props} />)
    await waitFor(() => expect(getByText('cv.monitoringSources.commonHealthSource.chart')).toBeInTheDocument())
    await waitFor(() => expect(queryByText('cv.changeSource.noDataAvaiableForCard')).not.toBeInTheDocument())
    await waitFor(() => expect(queryByTestId('chart')).not.toBeInTheDocument())
    await waitFor(() => expect(queryByTestId('loading')).toBeInTheDocument())
  })
})
