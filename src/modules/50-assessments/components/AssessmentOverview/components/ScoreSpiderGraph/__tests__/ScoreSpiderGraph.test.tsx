import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import ScoreSpiderGraph from '../ScoreSpiderGraph'
import { mockSectionInvalid, mockSectionList } from './ScoreSpiderGraph.mock'

describe('ScoreSpiderGraph', () => {
  test('should render high chart', () => {
    const { getByText } = render(
      <TestWrapper>
        <ScoreSpiderGraph sectionScores={mockSectionList} />
      </TestWrapper>
    )
    expect(getByText('assessments.howYouPerformedInSections')).toBeInTheDocument()
  })
  test('should render high chart with invalid values', () => {
    const { getByText } = render(
      <TestWrapper>
        <ScoreSpiderGraph sectionScores={mockSectionInvalid} />
      </TestWrapper>
    )
    expect(getByText('assessments.howYouPerformedInSections')).toBeInTheDocument()
  })
})
