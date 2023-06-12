import type { SectionResultDTO } from 'services/assessments'

export const sectionResultsData: SectionResultDTO = {
  assessmentId: 'DEVOPSTest11',
  companyId: 'abcd.com',
  companyName: 'ABC, Inc.',
  userEmail: 'abcgs4@abcd.com',
  overallScoreOverview: {
    selfScore: {
      scoreType: 'ASSESSMENT_LEVEL',
      entityId: 'DEVOPSTest11',
      score: 132.0,
      maxScore: 190
    },
    organizationScore: {
      scoreType: 'ASSESSMENT_LEVEL',
      entityId: 'DEVOPSTest11',
      score: 132.0,
      maxScore: 190
    },
    maturityLevel: 'LEVEL_2'
  },
  benchmarkId: '',
  sectionScores: [
    {
      sectionId: 'planning',
      sectionText: 'Planning and Requirements Process',
      sectionScore: {
        selfScore: {
          scoreType: 'SECTION_LEVEL',
          entityId: 'planning',
          score: 8.0,
          maxScore: 30
        },
        organizationScore: {
          scoreType: 'SECTION_LEVEL',
          entityId: 'planning',
          score: 8.0,
          maxScore: 30
        },
        maturityLevel: 'LEVEL_1'
      },
      numRecommendations: 3
    }
  ]
}
