import { render } from '@testing-library/react'
import React from 'react'
import { TestWrapper } from '@common/utils/testUtils'
import { useGetAssessmentSectionOverviewResults } from 'services/assessments'
import MaturityScore from '../MaturityScore'
import { sectionScoreOverview, sectionScoreOverview2 } from './MaturityScore.mock'

jest.mock('services/assessments', () => ({
  useGetAssessmentSectionOverviewResults: jest
    .fn()
    .mockImplementation(() => ({ data: sectionScoreOverview, error: null, loading: false, refetch: jest.fn() }))
}))

describe('Maturity Score', () => {
  test('Displays maturity score and improvement based on selection', () => {
    ;(useGetAssessmentSectionOverviewResults as jest.Mock).mockImplementation(() => ({
      data: sectionScoreOverview,
      error: null,
      loading: false,
      refetch: jest.fn()
    }))
    const { getByText } = render(
      <TestWrapper>
        <MaturityScore improvementScore={15} />
      </TestWrapper>
    )
    expect(getByText('15%')).toBeInTheDocument()
  })
  test('Displays spinner while loading', () => {
    ;(useGetAssessmentSectionOverviewResults as jest.Mock).mockImplementation(() => ({
      data: null,
      error: null,
      loading: true,
      refetch: jest.fn()
    }))
    const { getByTestId } = render(
      <TestWrapper>
        <MaturityScore improvementScore={15} />
      </TestWrapper>
    )
    expect(getByTestId('page-spinner')).toBeInTheDocument()
  })
  test('Displays maturity score and improvement based on selection', () => {
    ;(useGetAssessmentSectionOverviewResults as jest.Mock).mockImplementation(() => ({
      data: null,
      error: true,
      loading: false,
      refetch: jest.fn()
    }))
    const { getByTestId } = render(
      <TestWrapper>
        <MaturityScore improvementScore={15} />
      </TestWrapper>
    )
    expect(getByTestId('page-error')).toBeInTheDocument()
  })
  test('renders with minimal data', () => {
    ;(useGetAssessmentSectionOverviewResults as jest.Mock).mockImplementation(() => ({
      data: sectionScoreOverview2,
      error: null,
      loading: false,
      refetch: jest.fn()
    }))
    const { getByText } = render(
      <TestWrapper>
        <MaturityScore improvementScore={15} />
      </TestWrapper>
    )
    expect(getByText('assessments.maturityScore')).toBeInTheDocument()
  })
})
