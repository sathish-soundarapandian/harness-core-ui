import type { QuestionResponse, UserAssessmentDTO, UserResponseRequestItem } from 'services/assessments'
import type { FormatedResponse } from '../../interfaces/Assessments'

export function getInitialUserResponse(
  userResponse: UserAssessmentDTO['userResponse'],
  sectionQuestions: UserAssessmentDTO['sectionQuestions']
): FormatedResponse {
  let response: { [index: string]: string[] } = {}
  if (userResponse) {
    response = userResponse.reduce((acc: { [index: string]: string[] }, curr: UserResponseRequestItem) => {
      return {
        ...acc,
        [curr.questionId || '']: curr.responseIds || []
      }
    }, {})
  }
  if (!sectionQuestions) return {}
  const sectionIds = Object.keys(sectionQuestions)
  return sectionIds.reduce((acc: FormatedResponse, sectionId: string) => {
    const responses = sectionQuestions[sectionId].reduce(
      (allQuestions: { [index: string]: string[] }, question: QuestionResponse) => {
        const questionId = question.questionId || ''
        return {
          ...allQuestions,
          [questionId]: response[questionId] || []
        }
      },
      {}
    )
    return {
      ...acc,
      [sectionId]: { ...responses }
    }
  }, {})
}
