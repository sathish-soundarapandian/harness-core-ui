export const mockDetails = {
  questionId: 'a6806b78-2700-4039-8201-ddcf0f518872',
  questionNumber: 35,
  questionType: 'RATING',
  sectionId: '2b139fcf-59dd-4a11-bbae-b3fba417a6c9',
  sectionName: 'Integrated Security and Governance   ',
  questionText: 'What is the median time to resolve high severity security issues ?',
  possibleResponses: [
    {
      optionId: 'opt1',
      optionText: 'Median time to resolve High and critical severity security issues is greater than 45 days',
      maturityLevel: 'LEVEL_1',
      optionPoints: 0.0
    },
    {
      optionId: 'opt2',
      optionText: 'Median time to resolve High and critical severity security issues is between 30 days',
      maturityLevel: 'LEVEL_2',
      optionPoints: 0.0
    },
    {
      optionId: 'opt3',
      optionText: 'Median time to resolve High and critical severity security issues is less than 7 days',
      maturityLevel: 'LEVEL_3',
      optionPoints: 1.0
    }
  ],
  scoreWeightage: 1,
  maxScore: 1,
  capability: 'Ensuring timely resolutions of high and critical severity issues',
  recommendations: [
    {
      recommendationId: '34',
      recommendationText:
        'Unresolved high and critical severity security issues can result in insecure applications. We recommend fixing these issues in less than 7 days. ',
      currentMaturityLevel: 'LEVEL_1',
      harnessModule: 'SEI'
    }
  ]
}
