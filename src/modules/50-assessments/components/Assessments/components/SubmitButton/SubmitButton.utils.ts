import { isEmpty } from 'lodash-es'
import type { AssessmentsForm } from '@assessments/interfaces/Assessments'

export const isAllAnswered = (formData: AssessmentsForm): boolean => {
  const { userResponse } = formData
  const sectionIds = Object.keys(userResponse)
  const hasErrors = sectionIds.some((sectId: string) => {
    const sectionResponse = userResponse[sectId]
    const questionIds = Object.keys(sectionResponse)
    return questionIds.some((questId: string) => {
      return isEmpty(sectionResponse[questId])
    })
  })
  return !hasErrors
}
