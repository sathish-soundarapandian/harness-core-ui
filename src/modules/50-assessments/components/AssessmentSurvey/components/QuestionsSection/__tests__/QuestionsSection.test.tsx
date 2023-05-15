import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import QuestionsSection from '../QuestionsSection'

jest.mock('framework/strings', () => ({
  useStrings: () => ({
    getString: (key: string) => key
  })
}))

describe('QuestionsSection', () => {
  const questions = [
    {
      questionName:
        'Adding additional features or functions of a new product, requirements, or work that is not authorized',
      capability: 'Scope Creep',
      level: 'Level 3',
      userScore: 85,
      organizationScore: 32,
      benchmarkScore: 68,
      recommendations:
        'Scope creep can result in context switches for developers resulting in dissatisfaction, overwork and poor outcomes. Consider leveraging Agile Training and Tooling to understand and chart scope creep'
    },
    {
      questionName:
        'Acceptance criteria are a set of requirements that must be met by a software product or service to be deemed acceptable or satisfactory by the customer or end-user.',
      capability: 'Acceptance Criteria',
      level: 'Level 3',
      userScore: 85,
      organizationScore: 32,
      benchmarkScore: 68,
      recommendations:
        'Lack of acceptance criteria can result in poor quality and rework. Consider tracking acceptance criteria as one of the important gates for starting development'
    },
    {
      questionName:
        'Documentation process is the practice of creating and maintaining documents that describe the software, including requirements, design, implementation, testing, and maintenance details.',
      capability: 'Documentation Process',
      level: 'Level 2',
      userScore: 85,
      organizationScore: 32,
      benchmarkScore: 68,
      recommendations:
        'Documenting and following the development methodology can ensure consistency and repeatability in development. Consider templatizing and documenting the entire development cycle. to ensure the consistency.'
    }
  ]

  test('renders the table when questions are present', () => {
    const { container } = render(<QuestionsSection questions={questions} currentSection="section1" />)

    // Verify that the table is rendered
    const table = container.querySelector('[class*="TableV2"]')
    expect(table).toBeInTheDocument()

    // Verify that the category name column is present
    const categoryNameHeader = screen.getByText('CATEGORY')
    expect(categoryNameHeader).toBeInTheDocument()

    // Verify that the level column is present
    const levelHeader = screen.getByText('LEVEL')
    expect(levelHeader).toBeInTheDocument()

    // Verify that the comparison column is present
    const comparisonHeader = screen.getByText('ASSESSMENTS.COMPARISON')
    expect(comparisonHeader).toBeInTheDocument()

    // Verify that the recommendations column is present
    const recommendationsHeader = screen.getByText('ASSESSMENTS.RECOMMENDATIONS')
    expect(recommendationsHeader).toBeInTheDocument()
  })

  test('does not render the table when no questions are present', () => {
    const { container } = render(<QuestionsSection questions={[]} currentSection="section1" />)

    // Verify that the table is not rendered
    const table = container.querySelector('[class*="TableV2"]')
    expect(table).not.toBeInTheDocument()
  })

  test('opens the drawer when a row is clicked', async () => {
    const { container } = render(<QuestionsSection questions={questions} currentSection="section1" />)

    // Find a row and click on it
    const questionsRows = container.querySelectorAll('.TableV2--body [role="row"]')
    const firstRow = questionsRows[0]
    await userEvent.click(firstRow)

    // Verify that the drawer is opened
    const levelHeader = screen.getByText('LEVEL')
    expect(levelHeader).toBeInTheDocument()
  })
})
