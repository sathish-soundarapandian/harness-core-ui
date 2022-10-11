import React from 'react'
import { render, screen } from '@testing-library/react'
import { Container } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import MetricThresholdProvider from '../MetricThresholdProvider'
import { MockContextValues } from '../components/__tests__/IgnoreThresholdsContent.mock'
// eslint-disable-next-line react/display-name
jest.mock('@cv/pages/health-source/common/MetricThresholds/MetricThresholdsContent', () => () => (
  <Container data-testid="MetricThresholdContent" />
))

describe('MetricThreshold', () => {
  test('should render the component', () => {
    render(
      <TestWrapper>
        <MetricThresholdProvider {...MockContextValues} />
      </TestWrapper>
    )

    expect(screen.getByTestId('MetricThresholdContent')).toBeInTheDocument()
  })
})
