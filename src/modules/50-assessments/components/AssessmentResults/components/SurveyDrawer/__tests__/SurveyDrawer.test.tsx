import React from 'react'
import { render, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import SurveyDrawer from '../SurveyDrawer'
import { mockDetails } from './SurveyDrawer.mock'

jest.mock('services/assessments', () => ({
  useGetQuestionLevelOptions: jest.fn().mockImplementation(() => ({ data: mockDetails, loading: false, error: null }))
}))
const mockCurrentRowDetails: any = {
  questionName:
    'Adding additional features or functions of a new product, requirements, or work that is not authorized',
  capability: 'Scope Creep',
  level: 'Level 3',
  userScore: 85,
  organizationScore: 32,
  benchmarkScore: 68,
  maturityLevel: 'LEVEL_3',
  recommendations:
    'Scope creep can result in context switches for developers resulting in dissatisfaction, overwork and poor outcomes. Consider leveraging Agile Training and Tooling to understand and chart scope creep'
}

describe('SurveyDrawer', () => {
  test('renders the current section', () => {
    render(
      <TestWrapper>
        <SurveyDrawer
          isOpen
          onHideCallback={jest.fn()}
          scores={mockCurrentRowDetails}
          questionId={'q1'}
          resultsCode={'resultCode'}
        />
      </TestWrapper>
    )

    expect(screen.getByText('Integrated Security and Governance')).toBeInTheDocument()
    expect(screen.getByText('assessments.youAreAt assessments.levelString 3')).toBeInTheDocument()
  })

  test('does not render the benchmark score if not available', () => {
    const mockCurrentRowDetailsWithoutBenchmark = {
      ...mockCurrentRowDetails,
      benchmarkScore: undefined
    }
    render(
      <TestWrapper>
        <SurveyDrawer
          isOpen
          onHideCallback={jest.fn()}
          scores={mockCurrentRowDetailsWithoutBenchmark}
          questionId={''}
          resultsCode={''}
        />
      </TestWrapper>
    )
    const benchmarkScore = screen.queryByText('assessments.benchmark')
    expect(benchmarkScore).not.toBeInTheDocument()
  })
})
