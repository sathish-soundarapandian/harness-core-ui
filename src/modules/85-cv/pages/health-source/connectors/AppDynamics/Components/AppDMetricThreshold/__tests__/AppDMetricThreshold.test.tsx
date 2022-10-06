import React from 'react'
import { render, screen } from '@testing-library/react'
import { Container } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import AppDMetricThreshold from '../AppDMetricThreshold'
import { AppDMetricThresholdProps } from './AppDMetricThreshold.mock'

// eslint-disable-next-line react/display-name
jest.mock('../Components/AppDMetricThresholdContent', () => () => (
  <Container data-testid="AppDMetricThresholdContent" />
))

describe('AppDMetricThreshold', () => {
  test('should render the component', () => {
    render(
      <TestWrapper>
        {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
        {/* @ts-ignore */}
        <AppDMetricThreshold {...AppDMetricThresholdProps} />
      </TestWrapper>
    )

    expect(screen.getByTestId('AppDMetricThresholdContent')).toBeInTheDocument()
  })
})
