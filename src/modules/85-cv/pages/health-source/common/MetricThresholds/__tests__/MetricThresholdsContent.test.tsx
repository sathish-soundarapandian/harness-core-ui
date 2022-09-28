import React from 'react'
import { render, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import MetricThresholdContent from '../MetricThresholdsContent'

describe('MetricThresholdContent', () => {
  test('should render the component', () => {
    render(
      <TestWrapper>
        <MetricThresholdContent>
          <div data-testid="TestContent"></div>
        </MetricThresholdContent>
      </TestWrapper>
    )

    expect(screen.getByTestId('TestContent')).toBeInTheDocument()
  })
})
