import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import ResultTable from '../ResultTable'
import { mockQuestions, mockSectionValues } from './ResultTable.mock'

jest.mock('services/assessments', () => ({
  useGetAssessmentDetailedResults: jest
    .fn()
    .mockImplementation(() => ({ data: mockQuestions, loading: false, error: null, refetch: jest.fn() }))
}))

describe('Result Table', () => {
  test('renders the table when questions are present', () => {
    const { container } = render(
      <TestWrapper>
        <ResultTable sectionScores={mockSectionValues} benchmarkId={''} />
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

    const rowButtons = screen.getAllByRole('button')
    expect(rowButtons).toHaveLength(11)
    fireEvent.click(rowButtons[0])
  })
})
