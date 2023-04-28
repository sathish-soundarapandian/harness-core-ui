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
    // {
    //   questionNumber: '4',
    //   questionText: 'Question 4',
    //   questionType: 'RATING',
    //   possibleResponses: [
    //     { optionId: 'g', optionText: 'Low' },
    //     { optionId: 'h', optionText: 'High' },
    //     { optionId: 'i', optionText: 'Medium' },
    //     { optionId: 'i', optionText: 'Good' }
    //   ]
    // }
  ]
}
