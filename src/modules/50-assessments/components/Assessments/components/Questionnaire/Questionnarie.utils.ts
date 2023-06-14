import { isEmpty } from 'lodash-es'
import type { QuestionResponse, UserAssessmentDTO, UserResponseRequestItem } from 'services/assessments'
import type { AssessmentsForm, FormatedResponse } from '@assessments/interfaces/Assessments'

export const getNextQuestion = (
  sectionQuestions: UserAssessmentDTO['sectionQuestions'],
  currentSectionId?: string,
  currentQuestionId?: string
): { sectionId: string; questionId: string } => {
  if (!sectionQuestions) {
    return {
      sectionId: '',
      questionId: ''
    }
  }
  const sectionIdList = Object.keys(sectionQuestions)
  if (!currentSectionId || !currentQuestionId) {
    const sectionId = sectionIdList[0]
    return {
      sectionId,
      questionId: sectionQuestions[sectionId][0].questionId || ''
    }
  }
  const currentSelection = {
    sectionId: currentSectionId,
    questionId: currentQuestionId
  }

  const currentSectionQuestions: QuestionResponse[] | undefined = sectionQuestions[currentSectionId]
  if (!currentSectionQuestions) {
    return currentSelection
  }

  const currentQuestionIndex = currentSectionQuestions.findIndex(
    (question: QuestionResponse) => question.questionId === currentQuestionId
  )
  if (currentQuestionIndex < currentSectionQuestions.length - 1) {
    return {
      sectionId: currentSectionId,
      questionId: currentSectionQuestions[currentQuestionIndex + 1].questionId || ''
    }
  }

  const sectionIndex = sectionIdList.findIndex((id: string) => id === currentSectionId)
  if (sectionIndex < sectionIdList.length - 1) {
    const sectionId = sectionIdList[sectionIndex + 1]
    return {
      sectionId,
      questionId: sectionQuestions[sectionId][0].questionId || ''
    }
  }

  return currentSelection
}

export const getPreviousQn = (
  sectionQuestions: UserAssessmentDTO['sectionQuestions'],
  currentSectionId?: string,
  currentQuestionId?: string
): { sectionId: string; questionId: string } => {
  if (!sectionQuestions) {
    return {
      sectionId: '',
      questionId: ''
    }
  }
  const sectionIdList = Object.keys(sectionQuestions)
  if (!currentSectionId || !currentQuestionId) {
    const sectionId = sectionIdList[0]
    return {
      sectionId,
      questionId: sectionQuestions[sectionId][0].questionId || ''
    }
  }
  const currentSelection = {
    sectionId: currentSectionId,
    questionId: currentQuestionId
  }

  const currentSectionQuestions: QuestionResponse[] | undefined = sectionQuestions[currentSectionId]
  if (!currentSectionQuestions) {
    return currentSelection
  }

  const currentQuestionIndex = currentSectionQuestions.findIndex(
    (question: QuestionResponse) => question.questionId === currentQuestionId
  )
  if (currentQuestionIndex > 0) {
    return {
      sectionId: currentSectionId,
      questionId: currentSectionQuestions[currentQuestionIndex - 1].questionId || ''
    }
  }

  const sectionIndex = sectionIdList.findIndex((id: string) => id === currentSectionId)
  if (sectionIndex > 0) {
    const sectionId = sectionIdList[sectionIndex - 1]
    const sectionQns = sectionQuestions[sectionId]
    const questionId = sectionQns[sectionQns.length - 1].questionId || ''
    return {
      sectionId,
      questionId
    }
  }

  return currentSelection
}

export const buildResponse = (userResponse: FormatedResponse): UserResponseRequestItem[] => {
  return Object.keys(userResponse).reduce((acc: UserResponseRequestItem[], sectionId: string) => {
    const sectionValues = userResponse[sectionId]
    const questions = Object.keys(sectionValues).map(
      (questionId: string) =>
        ({
          questionId,
          responseIds: sectionValues[questionId]
        } as UserResponseRequestItem)
    )
    return [...acc, ...questions]
  }, [])
}

export const getFirstUnansweredQn = (
  sectionQuestions: UserAssessmentDTO['sectionQuestions'],
  formData: AssessmentsForm
): { sectionId: string; questionId: string } => {
  const { userResponse } = formData
  if (!sectionQuestions) {
    return {
      sectionId: '',
      questionId: ''
    }
  }
  const sectionIdList = Object.keys(sectionQuestions)
  let sectionId
  let questionId

  let currentSectionId = ''
  let currentQuestionId = ''
  for (currentSectionId of sectionIdList) {
    const sectionResponse = userResponse[currentSectionId]
    const questionIds = Object.keys(sectionResponse)
    for (currentQuestionId of questionIds) {
      if (isEmpty(sectionResponse[currentQuestionId])) {
        sectionId = currentSectionId
        questionId = currentQuestionId
        break
      }
    }
    if (questionId) break
  }
  if (!sectionId || !questionId) {
    sectionId = currentSectionId
    questionId = currentQuestionId
  }

  return {
    sectionId,
    questionId
  }
}
