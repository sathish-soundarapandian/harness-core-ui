export const mockGetAssessmentResults = {
  assessmentId: 'DEVOPSTest1',
  assessmentName: 'DevOps Test',
  majorVersion: 36,
  minorVersion: 0,
  status: 'COMPLETED',
  responses: [
    {
      questionId: 'ques1',
      questionText: 'Do you have redundancy for all your microservices and infrastructure?',
      questionType: 'RADIO_BUTTON',
      sectionId: 'section_res',
      sectionText: 'System Resilience',
      responses: [
        { optionId: 'opt1', optionText: 'Yes', selected: false },
        { optionId: 'opt2', optionText: 'No', selected: true }
      ],
      maxScore: 10,
      userScore: 1.0,
      organizationScore: 1.0,
      benchmarkScore: null
    },
    {
      questionId: 'ques2',
      questionText: 'Do you you high Test Coverage?',
      questionType: 'CHECKBOX',
      sectionId: 'section_res',
      sectionText: 'System Resilience',
      responses: [
        { optionId: 'opt1', optionText: 'Its low', selected: false },
        { optionId: 'opt2', optionText: 'Its moderate', selected: false },
        { optionId: 'opt3', optionText: 'Its High', selected: true },
        { optionId: 'opt4', optionText: 'Its excellent', selected: false }
      ],
      maxScore: 10,
      userScore: 4.0,
      organizationScore: 4.0,
      benchmarkScore: null
    },
    {
      questionId: 'ques3',
      questionText: 'Do you have Gitop setup?',
      questionType: 'RATING',
      sectionId: 'section_res',
      sectionText: 'System Resilience',
      responses: [
        { optionId: 'opt1', optionText: 'not happy', selected: false },
        { optionId: 'opt2', optionText: 'satisfied', selected: false },
        { optionId: 'opt3', optionText: 'very satisfied', selected: false },
        { optionId: 'opt4', optionText: 'very happy', selected: true },
        { optionId: 'opt5', optionText: 'extremely happy', selected: false }
      ],
      maxScore: 10,
      userScore: 8.0,
      organizationScore: 8.0,
      benchmarkScore: null
    },
    {
      questionId: 'ques4',
      questionText: 'Do you have service health monitoring?',
      questionType: 'YES_NO',
      sectionId: 'section_res',
      sectionText: 'System Resilience',
      responses: [
        { optionId: 'opt1', optionText: 'Yes', selected: true },
        { optionId: 'opt2', optionText: 'No', selected: false }
      ],
      maxScore: 10,
      userScore: 10.0,
      organizationScore: 10.0,
      benchmarkScore: null
    },
    {
      questionId: 'ques5',
      questionText: 'How Do you rate your CI/CD ?',
      questionType: 'RATING',
      sectionId: 'section_res',
      sectionText: 'System Resilience',
      responses: [
        { optionId: 'opt1', optionText: '1', selected: false },
        { optionId: 'opt2', optionText: '2', selected: false },
        { optionId: 'opt3', optionText: '3', selected: false },
        { optionId: 'opt4', optionText: '4', selected: true },
        { optionId: 'opt5', optionText: '5', selected: false }
      ],
      maxScore: 10,
      userScore: 8.0,
      organizationScore: 8.0,
      benchmarkScore: null
    },
    {
      questionId: 'ques6',
      questionText: 'Do you have Test intelligence',
      questionType: 'RADIO_BUTTON',
      sectionId: 'section_res',
      sectionText: 'System Resilience',
      responses: [
        { optionId: 'opt1', optionText: 'Yes', selected: true },
        { optionId: 'opt2', optionText: 'No', selected: false }
      ],
      maxScore: 10,
      userScore: 10.0,
      organizationScore: 10.0,
      benchmarkScore: null
    },
    {
      questionId: 'ques7',
      questionText: 'Do you have Feature Flags Support',
      questionType: 'RADIO_BUTTON',
      sectionId: 'section_res',
      sectionText: 'System Resilience',
      responses: [
        { optionId: 'opt1', optionText: 'Yes', selected: false },
        { optionId: 'opt2', optionText: 'No', selected: true }
      ],
      maxScore: 10,
      userScore: 8.0,
      organizationScore: 8.0,
      benchmarkScore: null
    }
  ],
  userScores: [
    { scoreType: 'QUESTION_LEVEL', entityId: 'ques1', score: 1.0, maxScore: 10 },
    { scoreType: 'QUESTION_LEVEL', entityId: 'ques2', score: 4.0, maxScore: 10 },
    { scoreType: 'QUESTION_LEVEL', entityId: 'ques3', score: 8.0, maxScore: 10 },
    { scoreType: 'QUESTION_LEVEL', entityId: 'ques4', score: 10.0, maxScore: 10 },
    { scoreType: 'QUESTION_LEVEL', entityId: 'ques5', score: 8.0, maxScore: 10 },
    { scoreType: 'QUESTION_LEVEL', entityId: 'ques6', score: 10.0, maxScore: 10 },
    { scoreType: 'QUESTION_LEVEL', entityId: 'ques7', score: 8.0, maxScore: 10 },
    { scoreType: 'SECTION_LEVEL', entityId: 'section_res', score: 49.0, maxScore: 70 },
    { scoreType: 'ASSESSMENT_LEVEL', entityId: 'DEVOPSTest1', score: 49.0, maxScore: 70 }
  ],
  organizationScores: [
    { scoreType: 'QUESTION_LEVEL', entityId: 'ques1', score: 1.0, maxScore: 10 },
    { scoreType: 'QUESTION_LEVEL', entityId: 'ques2', score: 4.0, maxScore: 10 },
    { scoreType: 'QUESTION_LEVEL', entityId: 'ques3', score: 8.0, maxScore: 10 },
    { scoreType: 'QUESTION_LEVEL', entityId: 'ques4', score: 10.0, maxScore: 10 },
    { scoreType: 'QUESTION_LEVEL', entityId: 'ques5', score: 8.0, maxScore: 10 },
    { scoreType: 'QUESTION_LEVEL', entityId: 'ques6', score: 10.0, maxScore: 10 },
    { scoreType: 'QUESTION_LEVEL', entityId: 'ques7', score: 8.0, maxScore: 10 },
    { scoreType: 'SECTION_LEVEL', entityId: 'section_res', score: 49.0, maxScore: 70 },
    { scoreType: 'ASSESSMENT_LEVEL', entityId: 'DEVOPSTest1', score: 49.0, maxScore: 70 }
  ],
  scoreOverview: {
    selfScore: { scoreType: 'ASSESSMENT_LEVEL', entityId: 'DEVOPSTest1', score: 49.0, maxScore: 70 },
    organizationScore: { scoreType: 'ASSESSMENT_LEVEL', entityId: 'DEVOPSTest1', score: 49.0, maxScore: 70 },
    numberOfResponses: 1,
    percentageDiffOrg: 0,
    best: [
      {
        questionId: 'ques7',
        questionText: 'Do you have Feature Flags Support',
        questionType: 'RADIO_BUTTON',
        sectionId: 'section_res',
        sectionText: 'System Resilience',
        responses: [
          { optionId: 'opt1', optionText: 'Yes', selected: false },
          { optionId: 'opt2', optionText: 'No', selected: true }
        ],
        maxScore: 10,
        userScore: 8.0,
        organizationScore: 8.0,
        benchmarkScore: null
      },
      {
        questionId: 'ques4',
        questionText: 'Do you have service health monitoring?',
        questionType: 'YES_NO',
        sectionId: 'section_res',
        sectionText: 'System Resilience',
        responses: [
          { optionId: 'opt1', optionText: 'Yes', selected: true },
          { optionId: 'opt2', optionText: 'No', selected: false }
        ],
        maxScore: 10,
        userScore: 10.0,
        organizationScore: 10.0,
        benchmarkScore: null
      },
      {
        questionId: 'ques6',
        questionText: 'Do you have Test intelligence',
        questionType: 'RADIO_BUTTON',
        sectionId: 'section_res',
        sectionText: 'System Resilience',
        responses: [
          { optionId: 'opt1', optionText: 'Yes', selected: true },
          { optionId: 'opt2', optionText: 'No', selected: false }
        ],
        maxScore: 10,
        userScore: 10.0,
        organizationScore: 10.0,
        benchmarkScore: null
      }
    ],
    worst: [
      {
        questionId: 'ques1',
        questionText: 'Do you have redundancy for all your microservices and infrastructure?',
        questionType: 'RADIO_BUTTON',
        sectionId: 'section_res',
        sectionText: 'System Resilience',
        responses: [
          { optionId: 'opt1', optionText: 'Yes', selected: false },
          { optionId: 'opt2', optionText: 'No', selected: true }
        ],
        maxScore: 10,
        userScore: 1.0,
        organizationScore: 1.0,
        benchmarkScore: null
      },
      {
        questionId: 'ques2',
        questionText: 'Do you you high Test Coverage?',
        questionType: 'CHECKBOX',
        sectionId: 'section_res',
        sectionText: 'System Resilience',
        responses: [
          { optionId: 'opt1', optionText: 'Its low', selected: false },
          { optionId: 'opt2', optionText: 'Its moderate', selected: false },
          { optionId: 'opt3', optionText: 'Its High', selected: true },
          { optionId: 'opt4', optionText: 'Its excellent', selected: false }
        ],
        maxScore: 10,
        userScore: 4.0,
        organizationScore: 4.0,
        benchmarkScore: null
      },
      {
        questionId: 'ques3',
        questionText: 'Do you have Gitop setup?',
        questionType: 'RATING',
        sectionId: 'section_res',
        sectionText: 'System Resilience',
        responses: [
          { optionId: 'opt1', optionText: 'not happy', selected: false },
          { optionId: 'opt2', optionText: 'satisfied', selected: false },
          { optionId: 'opt3', optionText: 'very satisfied', selected: false },
          { optionId: 'opt4', optionText: 'very happy', selected: true },
          { optionId: 'opt5', optionText: 'extremely happy', selected: false }
        ],
        maxScore: 10,
        userScore: 8.0,
        organizationScore: 8.0,
        benchmarkScore: null
      }
    ]
  },
  resultLink: 'EHzAPghDy659mEVOtxu-TDtgLsz8Q-VdDyvueJ8g0Ig='
}

export const mockedBenchMarksResults = [
  {
    benchmarkId: 'new_tech',
    benchmarkName: 'New Tech (500-1000)',
    isDefault: false,
    scores: [
      { scoreType: 'QUESTION_LEVEL', entityId: 'ques1', score: 6.0, maxScore: 10 },
      { scoreType: 'QUESTION_LEVEL', entityId: 'ques2', score: 10.0, maxScore: 10 },
      { scoreType: 'QUESTION_LEVEL', entityId: 'ques3', score: 8.0, maxScore: 10 },
      { scoreType: 'QUESTION_LEVEL', entityId: 'ques4', score: 9.0, maxScore: 10 },
      { scoreType: 'QUESTION_LEVEL', entityId: 'ques5', score: 8.0, maxScore: 10 },
      { scoreType: 'QUESTION_LEVEL', entityId: 'ques6', score: 8.0, maxScore: 10 },
      { scoreType: 'QUESTION_LEVEL', entityId: 'ques7', score: 8.0, maxScore: 10 }
    ]
  },
  {
    benchmarkId: 'top_250_devops',
    benchmarkName: 'top_250_devops',
    isDefault: true,
    scores: [
      { scoreType: 'QUESTION_LEVEL', entityId: 'ques1', score: 9.0, maxScore: 10 },
      { scoreType: 'QUESTION_LEVEL', entityId: 'ques2', score: 8.0, maxScore: 10 },
      { scoreType: 'QUESTION_LEVEL', entityId: 'ques3', score: 8.0, maxScore: 10 },
      { scoreType: 'QUESTION_LEVEL', entityId: 'ques4', score: 8.0, maxScore: 10 },
      { scoreType: 'QUESTION_LEVEL', entityId: 'ques5', score: 8.0, maxScore: 10 },
      { scoreType: 'QUESTION_LEVEL', entityId: 'ques6', score: 8.0, maxScore: 10 },
      { scoreType: 'QUESTION_LEVEL', entityId: 'ques7', score: 8.0, maxScore: 10 }
    ]
  }
]
