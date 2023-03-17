import React from 'react'
import { render, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { ActivityHeadingContent } from '../ActivityHeadingContent'
import type { ActivityHeadingContentProps } from '../../LogAnalysisDetailsDrawer.types'
import { feedbackMock, messageFrequency } from './ActivityHeadingContent.mock'

interface FeatureFlagProp {
  enableSRMFeedback?: true
}

const initialProps: ActivityHeadingContentProps = {
  count: 12,
  activityType: 'KNOWN',
  messageFrequency,
  feedback: feedbackMock
}

const WrapperComponent = ({
  enableSRMFeedback,
  ...props
}: ActivityHeadingContentProps & FeatureFlagProp): JSX.Element => {
  return (
    <TestWrapper defaultFeatureFlagValues={{ SRM_LOG_FEEDBACK_ENABLE_UI: enableSRMFeedback }}>
      <ActivityHeadingContent {...props} />
    </TestWrapper>
  )
}

describe('ActivityHeadingContent', () => {
  test('should render all the highcharts as per given through props', () => {
    const { container } = render(<WrapperComponent {...initialProps} />)
    expect(container.querySelector('.highcharts-root')).toBeInTheDocument()
    expect(container.querySelectorAll('.highcharts-root')).toHaveLength(4)
  })

  test('should render correct values', () => {
    render(<WrapperComponent {...initialProps} />)

    expect(screen.getByTestId('ActivityHeadingContent_count')).toHaveTextContent('12')
    expect(screen.getByTestId('ActivityHeadingContent_eventType')).toHaveTextContent('Known')
  })

  test('should render full name if the activity type is unexpected', () => {
    render(<WrapperComponent {...initialProps} activityType="UNEXPECTED" />)

    expect(screen.getByTestId('ActivityHeadingContent_eventType')).toHaveTextContent('cv.unexpectedFrequency')
  })

  test('ActivityHeadingContent should not render charts and should render the cound and cluster event type when no message frequency is present', () => {
    const updatedProps = {
      ...initialProps,
      messageFrequency: []
    }
    render(<WrapperComponent {...updatedProps} activityType="KNOWN" />)

    expect(screen.queryByTestId('activityHeadingContent-chart')).not.toBeInTheDocument()
    expect(screen.getByTestId('ActivityHeadingContent_eventType')).toHaveTextContent('Known')
    expect(screen.getByTestId('ActivityHeadingContent_count')).toHaveTextContent('12')
  })

  test('ActivityHeadingContent should not render feedback details if feature flag is disabled', () => {
    const updatedProps = {
      ...initialProps,
      messageFrequency: []
    }
    render(<WrapperComponent {...updatedProps} activityType="KNOWN" />)

    expect(screen.queryByTestId('updatedFeedbackDisplay')).not.toBeInTheDocument()
  })

  test('ActivityHeadingContent should render feedback details if feature flag is enabled', () => {
    const updatedProps = {
      ...initialProps,
      messageFrequency: []
    }
    render(<WrapperComponent {...updatedProps} enableSRMFeedback />)

    expect(screen.getByTestId('updatedFeedbackDisplay')).toBeInTheDocument()
  })
})
