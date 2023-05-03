export interface AssessmentsForm {
  userResponse: SubmittedQuestionResponse[]
}

export interface SubmittedQuestionResponse {
  questionId: string
  responseIds: string[]
}
