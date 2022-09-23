import React from 'react'
import { render, screen } from '@testing-library/react'
import { Container } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import PrometheusMetricThreshold from '../PrometheusMetricThreshold'
import { PrometheusThresholdProps } from './PrometheusMetricThreshold.mock'

// eslint-disable-next-line react/display-name
jest.mock('@cv/pages/health-source/common/MetricThresholds/MetricThresholdsContent', () => () => (
  <Container data-testid="MetricThresholdContent" />
))

describe('PrometheusMetricThreshold', () => {
  test('should render the component', () => {
    render(
      <TestWrapper>
        {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
        {/* @ts-ignore */}
        <PrometheusMetricThreshold {...PrometheusThresholdProps} />
      </TestWrapper>
    )

    expect(screen.getByTestId('MetricThresholdContent')).toBeInTheDocument()
  })
})
