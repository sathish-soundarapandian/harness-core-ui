/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { SLIMetricChart, SLIMetricChartProps } from '../SLIMetricChart'

const Wrapper = (props: SLIMetricChartProps) => (
  <TestWrapper>
    <SLIMetricChart {...props} />
  </TestWrapper>
)

describe('Validate SLI Metric chart', () => {
  test('should render with no data', () => {
    const retryOnError = jest.fn()
    const { getByText } = render(<Wrapper retryOnError={retryOnError} dataPoints={[]} metricName="" />)
    expect(getByText('cv.monitoringSources.gco.noMetricData')).toBeInTheDocument()
  })

  test('should render with loading', () => {
    const retryOnError = jest.fn()
    const { container } = render(<Wrapper retryOnError={retryOnError} loading={true} dataPoints={[]} metricName="" />)
    expect(container.querySelector('[data-icon="steps-spinner"]')).toBeInTheDocument()
  })

  test('should render with error', () => {
    const retryOnError = jest.fn()
    const { getByText } = render(
      <Wrapper retryOnError={retryOnError} error={'API Failure'} dataPoints={[]} metricName="" />
    )
    expect(getByText('API Failure')).toBeInTheDocument()
    fireEvent.click(getByText('Retry'))
    expect(retryOnError).toHaveBeenCalled()
  })

  test('should render with data', () => {
    const retryOnError = jest.fn()
    const { getByText } = render(
      <Wrapper
        retryOnError={retryOnError}
        dataPoints={[
          [1, 2],
          [2, 3]
        ]}
        metricName="metric1"
        title="metric1"
      />
    )
    expect(getByText('metric1')).toBeInTheDocument()
  })
  test('should render with legend', () => {
    const retryOnError = jest.fn()
    const { getByText } = render(
      <Wrapper
        retryOnError={retryOnError}
        dataPoints={[
          [1, 2],
          [2, 3]
        ]}
        metricName="metric1"
        title="metric1"
        showLegend
      />
    )
    expect(getByText('metric1')).toBeInTheDocument()
    expect(getByText('cv.minimum:')).toBeInTheDocument()
  })
})
