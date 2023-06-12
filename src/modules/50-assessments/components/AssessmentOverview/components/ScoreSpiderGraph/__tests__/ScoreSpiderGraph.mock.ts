import type { SectionScore } from 'services/assessments'

export const mockSectionList: SectionScore[] = [
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
        score: 0,
        maxScore: 2
      },
      organizationScore: {
        scoreType: 'SECTION_LEVEL',
        entityId: 'dd184e4a-0c4c-4a9a-afcf-2ab3ceb424d8',
        score: 0,
        maxScore: 2
      },
      maturityLevel: 'LEVEL_1'
    },
    numRecommendations: 2
  }
]

export const mockSectionInvalid: SectionScore[] = [
  {
    sectionId: '2b139fcf-59dd-4a11-bbae-b3fba417a6c9',
    sectionScore: {
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
    numRecommendations: 2
  }
]
