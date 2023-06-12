import { cloneDeep } from 'lodash-es'
import type { QuestionMaturity } from 'services/assessments'

export const getImprovedScore = (data: QuestionMaturity[]): number => {
  const selectedCapabilites = data.filter(questionMaturity => questionMaturity.selected)
  const improvedValue = selectedCapabilites.reduce((sum: number, questionMaturity: QuestionMaturity) => {
    const diff = (questionMaturity.projectedScore || 0) - (questionMaturity.currentScore || 0)
    sum = sum + diff
    return sum
  }, 0)
  return improvedValue
}

export const updateQuestionsOnQuestionID = (
  currentQuestionList: QuestionMaturity[],
  questionId: string,
  sectionId: string,
  selectedValue: boolean
): QuestionMaturity[] => {
  const index = currentQuestionList?.findIndex(
    (question: QuestionMaturity) => question.questionId === questionId && question.sectionId === sectionId
  )
  const clonedQuestionMaturityList = cloneDeep(currentQuestionList)
  clonedQuestionMaturityList[index].selected = selectedValue
  return clonedQuestionMaturityList
}

export const updateQuestionsOnSectionId = (
  currentQuestionList: QuestionMaturity[],
  isSelected: boolean,
  sectionId?: string | undefined
): QuestionMaturity[] => {
  const clonedData: QuestionMaturity[] = cloneDeep(currentQuestionList)
  if (sectionId) {
    clonedData.forEach((question: QuestionMaturity) => {
      if (question.sectionId === sectionId) {
        question.selected = isSelected
      }
    })
  } else {
    clonedData.forEach((question: QuestionMaturity) => (question.selected = isSelected))
  }
  return clonedData
}
