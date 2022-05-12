import React from 'react'
import { render, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { ActivityHeadingContent } from '../ActivityHeadingContent'
import type { ActivityHeadingContentProps } from '../../LogAnalysisRiskAndJiraModal.types'
import { trendData } from './ActivityHeadingContent.mock'

const initialProps: ActivityHeadingContentProps = {
  count: 12,
  activityType: 'KNOWN',
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  trendData
}

const WrapperComponent = (props: ActivityHeadingContentProps): JSX.Element => {
  return (
    <TestWrapper>
      <ActivityHeadingContent {...props} />
    </TestWrapper>
  )
}

describe('ActivityHeadingContent', () => {
  test('should render highcharts', () => {
    const { container } = render(<WrapperComponent {...initialProps} />)
    expect(container.querySelector('.highcharts-root')).toBeInTheDocument()
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
})
