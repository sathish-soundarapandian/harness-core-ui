import React from 'react'
import { render } from '@testing-library/react'
import { useGetAssessmentSectionOverviewResults } from 'services/assessments'
import { TestWrapper } from '@common/utils/testUtils'
import AssessmentOverview from '../AssessmentOverview'
import { mockedResponsesData, benchmarks } from './AssessmentOverview.mock'

jest.mock('@auth-settings/utils', () => ({
  getErrorMessage: jest.fn()
}))
jest.mock('services/assessments', () => ({
  useGetAssessmentSectionOverviewResults: jest
    .fn()
    .mockImplementation(() => ({ data: mockedResponsesData, loading: false, error: null, refetch: jest.fn() })),
  useSendAssessmentInvite: jest.fn().mockImplementation(() => ({ mutate: jest.fn(), loading: false, error: null })),
  useGetBenchmarksForResultCode: jest.fn().mockImplementation(() => ({ data: benchmarks, loading: true }))
}))
jest.mock('copy-to-clipboard', () => jest.fn())
jest.mock('@assessments/components/ContentContainer/components/SideNav/SideNav', () => {
  // eslint-disable-next-line react/display-name
  return () => {
    return <>Side nav</>
  }
})
jest.mock('@assessments/components/AssessmentOverview/components/HomeScoreGlance/HomeScoreGlance', () => {
  // eslint-disable-next-line react/display-name
  return () => {
    return <>HomeScore at a Glance</>
  }
})

describe('AssessmentResults', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders data', () => {
    const { getByText } = render(
      <TestWrapper>
        <AssessmentOverview />
      </TestWrapper>
    )
    expect(getByText('assessments.softwareDeliveryMaturityModel')).toBeInTheDocument()
  })

  test('renders loading spinner when results are loading', () => {
    ;(useGetAssessmentSectionOverviewResults as jest.Mock).mockImplementation(() => ({
      data: null,
      error: null,
      loading: true,
      refetch: jest.fn()
    }))
    const { getByTestId } = render(
      <TestWrapper>
        <AssessmentOverview />
      </TestWrapper>
    )
    expect(getByTestId('page-spinner')).toBeInTheDocument()
  })

  test('renders error on failure', () => {
    ;(useGetAssessmentSectionOverviewResults as jest.Mock).mockImplementation(() => ({
      data: null,
      error: true,
      loading: false,
      refetch: jest.fn()
    }))
    const { getByTestId } = render(
      <TestWrapper>
        <AssessmentOverview />
      </TestWrapper>
    )
    expect(getByTestId('page-error')).toBeInTheDocument()
  })
})
