import type { FormikErrors, FormikProps } from 'formik'
import { isEmpty, set } from 'lodash-es'
import type { UseStringsReturn } from 'framework/strings'
import type { UserAssessmentDTO } from 'services/assessments'
import type { AssessmentsForm, SubmittedQuestionResponse } from '../../interfaces/Assessments'

export const validateAssessments = (
  formData: AssessmentsForm,
  getString: UseStringsReturn['getString']
): FormikErrors<AssessmentsForm> => {
  const errors: FormikErrors<AssessmentsForm> = {}
  const { userResponse = [] } = formData

  userResponse.forEach((response, index) => {
    if (isEmpty(response?.responseIds)) {
      set(errors, `userResponse.${index}`, getString('fieldRequired'))
    }
  })

  return errors
}

export function getQuestionsAnswered(assessmentForm: FormikProps<AssessmentsForm>): number {
  const userResponseData = assessmentForm?.values?.userResponse || []
  const filteredResponses = userResponseData.filter(response => !isEmpty(response?.responseIds))
  return filteredResponses.length || 0
}

export function getInitialUserResponse(
  userResponse: UserAssessmentDTO['userResponse'],
  questions: UserAssessmentDTO['questions']
): SubmittedQuestionResponse[] {
  return (userResponse ||
    questions?.map(question => {
      return {
        questionId: question?.questionId,
        responseIds: []
      }
    })) as SubmittedQuestionResponse[]
}
