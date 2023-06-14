import type { SectionResultDTO } from 'services/assessments'

export const sectionResult: SectionResultDTO = {
  assessmentId: 'sdmmAssessment1',
  companyId: 'propelo.ai',
  companyName: 'propelo.ai',
  userEmail: 'sharath1@propelo.ai',
  overallScoreOverview: {
    selfScore: {
      scoreType: 'ASSESSMENT_LEVEL',
      entityId: 'sdmmAssessment1',
      score: 37,
      maxScore: 100
    },
    organizationScore: {
      scoreType: 'ASSESSMENT_LEVEL',
      entityId: 'sdmmAssessment1',
      score: 37,
      maxScore: 100
    },
    maturityLevel: 'LEVEL_2'
  },
  benchmarkId: 'a8f43a2e-146c-4e5e-ab41-902227196063'
}

export const sectionResultWithBenchmark: SectionResultDTO = {
  assessmentId: 'sdmmAssessment1',
  companyId: 'propelo.ai',
  companyName: 'propelo.ai',
  userEmail: 'sharath3@propelo.ai',
  overallScoreOverview: {
    selfScore: {
      scoreType: 'ASSESSMENT_LEVEL',
      entityId: 'sdmmAssessment1',
      score: 77.0,
      maxScore: 100
    },
    organizationScore: {
      scoreType: 'ASSESSMENT_LEVEL',
      entityId: 'sdmmAssessment1',
      score: 66.0,
      maxScore: 100
    },
    benchmarkScore: {
      scoreType: 'ASSESSMENT_LEVEL',
      entityId: 'sdmmAssessment1',
      score: 80.0,
      maxScore: 100
    },
    maturityLevel: 'LEVEL_2'
  },
  benchmarkId: 'a8f43a2e-146c-4e5e-ab41-902227196063',
  sectionScores: [
    {
      sectionId: '1c87edc5-8925-4347-be21-b21223579f29',
      sectionText: '      Planning and Requirements Process',
      sectionScore: {
        selfScore: {
          scoreType: 'SECTION_LEVEL',
          entityId: '1c87edc5-8925-4347-be21-b21223579f29',
          score: 5.0,
          maxScore: 6
        },
        organizationScore: {
          scoreType: 'SECTION_LEVEL',
          entityId: '1c87edc5-8925-4347-be21-b21223579f29',
          score: 4.0,
          maxScore: 6
        },
        benchmarkScore: {
          scoreType: 'SECTION_LEVEL',
          entityId: '1c87edc5-8925-4347-be21-b21223579f29',
          score: 4.0,
          maxScore: 4
        },
        maturityLevel: 'LEVEL_3'
      },
      numRecommendations: 2
    },
    {
      sectionId: '2b139fcf-59dd-4a11-bbae-b3fba417a6c9',
      sectionText: 'Integrated Security and Governance   ',
      sectionScore: {
        selfScore: {
          scoreType: 'SECTION_LEVEL',
          entityId: '2b139fcf-59dd-4a11-bbae-b3fba417a6c9',
          score: 4.0,
          maxScore: 6
        },
        organizationScore: {
          scoreType: 'SECTION_LEVEL',
          entityId: '2b139fcf-59dd-4a11-bbae-b3fba417a6c9',
          score: 2.0,
          maxScore: 6
        },
        benchmarkScore: {
          scoreType: 'SECTION_LEVEL',
          entityId: '2b139fcf-59dd-4a11-bbae-b3fba417a6c9',
          score: 3.0,
          maxScore: 3
        },
        maturityLevel: 'LEVEL_2'
      },
      numRecommendations: 4
    },
    {
      sectionId: 'a28dfa3e-fff7-469b-893e-225519d9088d',
      sectionText: 'Build Process',
      sectionScore: {
        selfScore: {
          scoreType: 'SECTION_LEVEL',
          entityId: 'a28dfa3e-fff7-469b-893e-225519d9088d',
          score: 10.0,
          maxScore: 12
        },
        organizationScore: {
          scoreType: 'SECTION_LEVEL',
          entityId: 'a28dfa3e-fff7-469b-893e-225519d9088d',
          score: 8.33,
          maxScore: 12
        },
        benchmarkScore: {
          scoreType: 'SECTION_LEVEL',
          entityId: 'a28dfa3e-fff7-469b-893e-225519d9088d',
          score: 3.0,
          maxScore: 3
        },
        maturityLevel: 'LEVEL_3'
      },
      numRecommendations: 4
    }
  ]
}
