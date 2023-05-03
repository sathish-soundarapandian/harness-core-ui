import type { OptionResponse } from 'services/assessments'
import type { AssessmentsForm } from '@assessments/interfaces/Assessments'

export function isOptionChecked(
  values: AssessmentsForm,
  questionIndex: number,
  possibleResponse: OptionResponse
): boolean | undefined {
  const userResponse = values?.userResponse[questionIndex]
  const responseIds = userResponse?.responseIds
  const optionId = possibleResponse?.optionId
  const isResponseIdIncluded = responseIds?.includes(optionId as string)
  return Boolean(isResponseIdIncluded)
}

export function getUpdatedResponseIds(
  values: AssessmentsForm,
  questionIndex: number,
  e: React.FormEvent<HTMLInputElement>,
  optionId?: string
): (string | undefined)[] {
  const responseIds = values?.userResponse?.[questionIndex]?.responseIds || []
  const updatedResponseIds = e.currentTarget.checked
    ? [...responseIds, optionId]
    : responseIds.filter(id => id !== optionId)
  return updatedResponseIds
}
