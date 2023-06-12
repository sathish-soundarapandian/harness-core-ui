import React from 'react'
import { render } from '@testing-library/react'
import type { SectionScore } from 'services/assessments'
import { TestWrapper } from '@common/utils/testUtils'
import PerformanceOverview from '../PerformanceOverview'

const mockSectionList: SectionScore[] = [
  {
    sectionId: '2b139fcf-59dd-4a11-bbae-b3fba417a6c9',
    sectionText: 'Integrated Security and Governance   ',
    sectionScore: {
      selfScore: {
        scoreType: 'SECTION_LEVEL',
        entityId: '2b139fcf-59dd-4a11-bbae-b3fba417a6c9',
        score: 0,
        maxScore: 6
      },
      organizationScore: {
        scoreType: 'SECTION_LEVEL',
        entityId: '2b139fcf-59dd-4a11-bbae-b3fba417a6c9',
        score: 0,
        maxScore: 6
      },
      maturityLevel: 'LEVEL_1'
    },
    numRecommendations: 4
  },
  {
    sectionId: 'dd184e4a-0c4c-4a9a-afcf-2ab3ceb424d8',
    sectionText: 'Discoverability and Documentation ',
    sectionScore: {
      selfScore: {
        scoreType: 'SECTION_LEVEL',
        entityId: 'dd184e4a-0c4c-4a9a-afcf-2ab3ceb424d8',
        score: 2,
        maxScore: 2
      },
      organizationScore: {
        scoreType: 'SECTION_LEVEL',
        entityId: 'dd184e4a-0c4c-4a9a-afcf-2ab3ceb424d8',
        score: 2,
        maxScore: 2
      },
      maturityLevel: 'LEVEL_3'
    },
    numRecommendations: 0
  }
]

describe('PerformanceOverview', () => {
  test('should render top opportunities by default', () => {
    const { getByText } = render(
      <TestWrapper>
        <PerformanceOverview sectionList={mockSectionList} />
      </TestWrapper>
    )
    expect(getByText('assessments.yourTopOpportunities')).toBeInTheDocument()
  })
  test('should render best performances', () => {
    const { getByText } = render(
      <TestWrapper>
        <PerformanceOverview sectionList={mockSectionList} isBest />
      </TestWrapper>
    )
    expect(getByText('assessments.yourBestPerformance')).toBeInTheDocument()
  })
  test('should display empty when no section values', () => {
    const { container } = render(
      <TestWrapper>
        <PerformanceOverview sectionList={[]} />
      </TestWrapper>
    )
    expect(container.getElementsByClassName('sectionPerformanceCard').length).toBe(0)
  })
})
