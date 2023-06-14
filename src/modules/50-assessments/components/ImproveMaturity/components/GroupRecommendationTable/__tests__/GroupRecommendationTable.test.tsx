import React from 'react'
import { render } from '@testing-library/react'
import type { QuestionMaturity } from 'services/assessments'
import GroupRecommendationTable from '../GroupRecommendationTable'

describe('Recommendation gouped by SDLC', () => {
  test('Should render the values in flat tables grouped by SDLC', () => {
    const testData: QuestionMaturity[] = [
      {
        sectionId: '2b139fcf-59dd-4a11-bbae-b3fba417a6c9',
        sectionText: 'Integrated Security and Governance   ',
        questionId: '7b13d037-d2a1-4ba9-b128-b6f9ac22cde5',
        questionText: 'Are security scans executed as part of the build pipelines?',
        capability: 'Improve the security of the application being deployed using SAST/SCA scanners',
        recommendation: {
          recommendationId: '31',
          recommendationText:
            'Lack of SAST and SCA scanning in the pipeline results in insecure code being released. We recommend implementing SAST/SCA scan in the pipeline , so that high and severe vulnerabilities can gate the release',
          currentMaturityLevel: 'LEVEL_1',
          harnessModule: 'STO'
        },
        currentScore: 0,
        projectedScore: 3,
        selected: true
      },
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
      }
    ]
    const { container } = render(
      <GroupRecommendationTable
        questionMaturityList={testData}
        onSelectionChange={jest.fn()}
        groupSelection={jest.fn()}
      />
    )

    expect(container).toMatchSnapshot()
  })
})
