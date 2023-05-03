import { isEmpty } from 'lodash-es'
import type { OptionResponse } from 'services/assessments'
import type { AssessmentsForm } from '../../../interfaces/Assessments'

export function getCurrentSelectedValue(
  possibleResponses: OptionResponse[],
  values: AssessmentsForm,
  questionIndex: number
): number {
  let currentValue = Math.round(possibleResponses.length / 2) - 1
  const currentQuestionResponse = values?.userResponse?.[questionIndex]?.responseIds
  if (!isEmpty(currentQuestionResponse)) {
    const currentSelectedOptId = currentQuestionResponse[0]
    currentValue = possibleResponses?.findIndex(possibleResponse => possibleResponse.optionId === currentSelectedOptId)
  }
  return currentValue
}
