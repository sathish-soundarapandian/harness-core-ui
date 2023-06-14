import type { QuestionMaturity } from 'services/assessments'

export const questionMaturities: QuestionMaturity[] = [
  {
    sectionId: 'dd184e4a-0c4c-4a9a-afcf-2ab3ceb424d8',
    sectionText: 'Discoverability and Documentation ',
    questionId: '6ac4bd2b-50c2-4cad-ba39-c14f5a91b0ff',
    questionText: 'How is metadata and ownership of software and services tracked and discovered ?',
    capability: 'Cataloging services, software components and other development assets',
    recommendation: {
      recommendationId: '3',
      recommendationText:
        'Lack of software catalog can causes developer toil and increased wait times. We recommend cataloging all the metadata for software, services, pipelines and other assets and automatically updating the information on changes',
      currentMaturityLevel: 'LEVEL_1',
      harnessModule: 'IDP'
    },
    currentScore: 0,
    projectedScore: 1,
    selected: true
  },
  {
    sectionId: '6dfa8b13-7bff-430d-a35f-3a7de2c7509f',
    sectionText: 'Learning and Development',
    questionId: '93f1ab54-a33c-40a1-9000-7d17a5007227',
    questionText: 'Is there a structured curriculum for upskilling and reskilling engineers (internal and external) ?',
    capability: 'Ensuring there is a structured program for reskilling and upskilling engineers',
    currentScore: 0,
    projectedScore: 1,
    selected: false
  },
  {
    sectionId: 'dd184e4a-0c4c-4a9a-afcf-2ab3ceb424d8',
    sectionText: 'Discoverability and Documentation ',
    questionId: 'fe81f2af-3811-44fa-820a-d96463f23f19',
    questionText: 'Does your engineering team follow a documented development methodology ?',
    capability: 'Standardizing Development Methodology',
    recommendation: {
      recommendationId: '2',
      recommendationText:
        'Documenting and following the development methodology can ensure consistency and repeatability in development. Consider templatizing and documenting the entire development cycle. to ensure the consistency. ',
      currentMaturityLevel: 'LEVEL_1',
      harnessModule: 'SEI'
    },
    currentScore: 0,
    projectedScore: 1,
    selected: true
  },
  {
    sectionId: '2b139fcf-59dd-4a11-bbae-b3fba417a6c9',
    sectionText: 'Integrated Security and Governance   ',
    questionId: 'a6806b78-2700-4039-8201-ddcf0f518872',
    questionText: 'What is the median time to resolve high severity security issues ?',
    capability: 'Ensuring timely resolutions of high and critical severity issues',
    recommendation: {
      recommendationId: '34',
      recommendationText:
        'Unresolved high and critical severity security issues can result in insecure applications. We recommend fixing these issues in less than 7 days. ',
      currentMaturityLevel: 'LEVEL_1',
      harnessModule: 'SEI'
    },
    currentScore: 0,
    projectedScore: 1,
    selected: true
  },
  {
    sectionId: '2b139fcf-59dd-4a11-bbae-b3fba417a6c9',
    sectionText: 'Integrated Security and Governance   ',
    questionId: 'ef30b97c-cc1f-4acf-ab0c-4f1172fe4336',
    questionText: 'What percentage of artifacts have SBOM generated ?',
    capability: 'Improve the security and integrity of the application being deployed using SBOM scanning',
    recommendation: {
      recommendationId: '32',
      recommendationText:
        'Lack of SBOM scanning in the pipeline results in insecure code being released. We recommend implementing SBOM scan in the pipeline , so that high and severe vulnerabilities can gate the release',
      currentMaturityLevel: 'LEVEL_1',
      harnessModule: 'STO'
    },
    currentScore: 0,
    projectedScore: 1,
    selected: true
  }
]
