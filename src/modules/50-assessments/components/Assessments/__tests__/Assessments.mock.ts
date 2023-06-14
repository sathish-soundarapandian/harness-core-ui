export const responseData = {
  assessmentId: '123',
  resultLink: '/assessment/results/abc',
  expectedCompletionDuration: 10,
  questions: [
    {
      questionNumber: '1',
      questionText: 'Question 1',
      questionType: 'RADIO_BUTTON',
      possibleResponses: [
        { optionId: 'a', optionText: 'Option A' },
        { optionId: 'b', optionText: 'Option B' }
      ]
    },
    {
      questionNumber: '2',
      questionText: 'Question 2',
      questionType: 'CHECKBOX',
      possibleResponses: [
        { optionId: 'c', optionText: 'Option C' },
        { optionId: 'd', optionText: 'Option D' }
      ]
    },
    {
      questionNumber: '3',
      questionText: 'Question 3',
      questionType: 'YES_NO',
      possibleResponses: [
        { optionId: 'e', optionText: 'Yes' },
        { optionId: 'f', optionText: 'No' }
      ]
    }
  ],
  sectionQuestions: {
    section1: [
      {
        questionId: 'q1',
        questionNumber: 1,
        questionText: 'Question 1',
        questionType: 'RADIO_BUTTON',
        sectionName: 'section1',
        possibleResponses: [
          { optionId: 'a', optionText: 'Option A' },
          { optionId: 'b', optionText: 'Option B' }
        ]
      },
      {
        questionId: 'q2',
        questionNumber: 2,
        questionText: 'Question 2',
        questionType: 'CHECKBOX',
        sectionName: 'section1',
        possibleResponses: [
          { optionId: 'c', optionText: 'Option C' },
          { optionId: 'd', optionText: 'Option D' }
        ]
      }
    ],
    section2: [
      {
        questionId: 'q3',
        questionNumber: 1,
        questionText: 'Question 3',
        questionType: 'YES_NO',
        sectionName: 'section2',
        possibleResponses: [
          { optionId: 'e', optionText: 'Yes' },
          { optionId: 'f', optionText: 'No' }
        ]
      }
    ]
  }
}

export const savedvalues = {
  userResponse: {
    section1: {
      q1: [],
      q2: []
    },
    section2: {
      q3: []
    }
  }
}

export const allAnsweredAssessment = {
  assessmentId: '123',
  resultLink: '/assessment/results/abc',
  expectedCompletionDuration: 10,
  questions: [
    {
      questionNumber: '1',
      questionText: 'Question 1',
      questionType: 'RADIO_BUTTON',
      possibleResponses: [
        { optionId: 'a', optionText: 'Option A' },
        { optionId: 'b', optionText: 'Option B' }
      ]
    },
    {
      questionNumber: '2',
      questionText: 'Question 2',
      questionType: 'CHECKBOX',
      possibleResponses: [
        { optionId: 'c', optionText: 'Option C' },
        { optionId: 'd', optionText: 'Option D' }
      ]
    },
    {
      questionNumber: '3',
      questionText: 'Question 3',
      questionType: 'YES_NO',
      possibleResponses: [
        { optionId: 'e', optionText: 'Yes' },
        { optionId: 'f', optionText: 'No' }
      ]
    }
  ],
  sectionQuestions: {
    section1: [
      {
        questionId: 'q1',
        questionNumber: 1,
        questionText: 'Question 1',
        questionType: 'RADIO_BUTTON',
        sectionName: 'section1',
        possibleResponses: [
          { optionId: 'a', optionText: 'Option A' },
          { optionId: 'b', optionText: 'Option B' }
        ]
      },
      {
        questionId: 'q2',
        questionNumber: 2,
        questionText: 'Question 2',
        questionType: 'CHECKBOX',
        sectionName: 'section1',
        possibleResponses: [
          { optionId: 'c', optionText: 'Option C' },
          { optionId: 'd', optionText: 'Option D' }
        ]
      }
    ],
    section2: [
      {
        questionId: 'q3',
        questionNumber: 1,
        questionText: 'Question 3',
        questionType: 'YES_NO',
        sectionName: 'section2',
        possibleResponses: [
          { optionId: 'e', optionText: 'Yes' },
          { optionId: 'f', optionText: 'No' }
        ]
      }
    ]
  },
  userResponse: [
    {
      questionId: 'q1',
      responseIds: ['a']
    },
    {
      questionId: 'q2',
      responseIds: ['d']
    },
    {
      questionId: 'q3',
      responseIds: ['e']
    }
  ]
}

export const allSavedValues = {
  userResponse: {
    section1: {
      q1: ['a'],
      q2: ['d']
    },
    section2: {
      q3: ['e']
    }
  }
}
