import React from 'react'
import { render, screen } from '@testing-library/react'
import { Container } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import MetricThresholdProvider from '../MetricThresholdProvider'
import { MockContextValues } from './MetricThresholdProvider.mock'

jest.mock('@cv/pages/health-source/common/MetricThresholds/MetricThresholdsContent', () => () => (
  <Container data-testid="metricThresholdContent" />
))

describe('MetricThreshold', () => {
  test('should render the component', () => {
    render(
      <TestWrapper>
        <MetricThresholdProvider {...MockContextValues} />
      </TestWrapper>
    )

    expect(screen.getByTestId('metricThresholdContent')).toBeInTheDocument()
  })
})
