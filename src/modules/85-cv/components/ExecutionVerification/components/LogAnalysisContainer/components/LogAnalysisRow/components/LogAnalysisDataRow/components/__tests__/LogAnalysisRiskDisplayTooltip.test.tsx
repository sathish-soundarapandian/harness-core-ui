import React from 'react'
import { render, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import LogAnalysisRiskDisplayTooltip from '../components/LogAnalysisRiskDisplayTooltip'
import { feedbackData } from './LogAnalysisRiskDisplayTooltip.mock'

describe('LogAnalysisRiskDisplayTooltip', () => {
  test('should render log risk display tooltip, if no feedback is given', () => {
    render(
      <TestWrapper>
        <LogAnalysisRiskDisplayTooltip feedback={{}} risk="OBSERVE" />
      </TestWrapper>
    )

    expect(screen.getByTestId('logAnalysisRiskTooltip-text')).toBeInTheDocument()
    expect(screen.getByTestId('logAnalysisRiskTooltip-text')).toHaveTextContent(
      'cv.monitoredServices.serviceHealth.serviceDependencies.states.mediumHealthy'
    )
  })

  test('should render details in the tooltip correctly', () => {
    render(
      <TestWrapper>
        <LogAnalysisRiskDisplayTooltip feedback={feedbackData} risk="OBSERVE" />
      </TestWrapper>
    )

    expect(screen.getByTestId('logAnalysisRiskTooltip-feedbackScore')).toHaveTextContent(
      'cv.logs.eventPriorityValues.highRisk'
    )
    expect(screen.getByTestId('logAnalysisRiskTooltip-updatedAt')).toHaveTextContent(
      'jane.doe@harness.io common.on 02/26/2023 12:33 PM'
    )
  })
})
