import { render } from '@testing-library/react'
import React from 'react'
import { TestWrapper } from '@common/utils/testUtils'
import ScoreDistribution from '../ScoreDistribution'
import { sectionResultsData } from './ScoreDistribution.mock'

describe('Score Distribution component', () => {
  test('renders score cards', () => {
    const { getByText } = render(
      <TestWrapper>
        <ScoreDistribution
          sectionScores={sectionResultsData.sectionScores || []}
          overallScoreOverview={sectionResultsData.overallScoreOverview || {}}
        />
      </TestWrapper>
    )
    expect(getByText('assessments.sectionScoreDistributionComparision')).toBeInTheDocument()
  })
  test('renders empty score cards', () => {
    const { getByText } = render(
      <TestWrapper>
        <ScoreDistribution sectionScores={[{}]} overallScoreOverview={{}} />
      </TestWrapper>
    )
    expect(getByText('assessments.sectionScoreDistributionComparision')).toBeInTheDocument()
  })
})
