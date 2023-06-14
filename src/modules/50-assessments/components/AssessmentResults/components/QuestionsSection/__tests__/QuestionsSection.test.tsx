import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useGetAssessmentDetailedResults } from 'services/assessments'
import { TestWrapper } from '@common/utils/testUtils'
import QuestionsSection from '../QuestionsSection'
import { mockQuestions } from './QuestionsSection.mock'

jest.mock('services/assessments', () => ({
  useGetAssessmentDetailedResults: jest
    .fn()
    .mockImplementation(() => ({ data: mockQuestions, loading: false, error: null, refetch: jest.fn() }))
}))

describe('QuestionsSection', () => {
  test('renders the table when questions are present', () => {
    const { container } = render(
      <TestWrapper>
        <QuestionsSection currentSection={'52dbcb38-a0f0-442c-89e5-add1283e6c2c'} benchmarkId={''} />
      </TestWrapper>
    )

    // Verify that the table is rendered
    const table = container.querySelector('[class*="TableV2"]')
    expect(table).toBeInTheDocument()

    // Verify that the category name column is present
    const categoryNameHeader = screen.getByText('COMMON.CATEGORY')
    expect(categoryNameHeader).toBeInTheDocument()

    // Verify that the level column is present
    const levelHeader = screen.getByText('ASSESSMENTS.LEVELSTRING')
    expect(levelHeader).toBeInTheDocument()

    // Verify that the comparison column is present
    const comparisonHeader = screen.getByText('ASSESSMENTS.COMPARISON')
    expect(comparisonHeader).toBeInTheDocument()

    // Verify that the recommendations column is present
    const recommendationsHeader = screen.getByText('ASSESSMENTS.RECOMMENDATIONS')
    expect(recommendationsHeader).toBeInTheDocument()
  })

  test('does not render the table when no questions are present', () => {
    const { container } = render(
      <TestWrapper>
        <QuestionsSection currentSection={''} benchmarkId={''} />
      </TestWrapper>
    )

    // Verify that the table is not rendered
    const table = container.querySelector('[class*="TableV2"]')
    expect(table).not.toBeInTheDocument()
  })

  test('opens the drawer when a row is clicked', async () => {
    const { container } = render(
      <TestWrapper>
        <QuestionsSection currentSection={'2b139fcf-59dd-4a11-bbae-b3fba417a6c9'} benchmarkId={''} />
      </TestWrapper>
    )

    // Find a row and click on it
    const questionsRows = container.querySelectorAll('.TableV2--body [role="row"]')
    const firstRow = questionsRows[0]
    userEvent.click(firstRow)

    // Verify that the drawer is opened
    const levelHeader = screen.getByText('ASSESSMENTS.LEVELSTRING')
    expect(levelHeader).toBeInTheDocument()
  })
  test('renders spinner while loading', () => {
    ;(useGetAssessmentDetailedResults as jest.Mock).mockImplementation(() => ({
      loading: true,
      data: {},
      error: false
    }))

    const { getByTestId } = render(
      <TestWrapper>
        <QuestionsSection currentSection={'52dbcb38-a0f0-442c-89e5-add1283e6c2c'} benchmarkId={''} />
      </TestWrapper>
    )

    expect(getByTestId('page-spinner')).toBeInTheDocument()
  })
  test('renders error when data is not loaded', () => {
    ;(useGetAssessmentDetailedResults as jest.Mock).mockImplementation(() => ({
      loading: false,
      data: {},
      error: true
    }))

    const { getByText } = render(
      <TestWrapper>
        <QuestionsSection currentSection={'52dbcb38-a0f0-442c-89e5-add1283e6c2c'} benchmarkId={''} />
      </TestWrapper>
    )

    expect(getByText('We cannot perform your request at the moment. Please try again.')).toBeInTheDocument()
  })
})
