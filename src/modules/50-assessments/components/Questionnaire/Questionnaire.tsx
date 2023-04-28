import { Container, useToaster } from '@harness/uicore'
import React from 'react'
import { useFormikContext } from 'formik'
import { UserAssessmentDTO, useSaveAssessmentResponse } from 'services/assessments'
import { getErrorMessage } from '@auth-settings/utils'
import { useDeepCompareEffect } from '@common/hooks'
import type { AssessmentsForm } from '../../interfaces/Assessments'
import CheckBoxQuestion from '../components/CheckBoxQuestion/CheckBoxQuestion'
import RadioButtonQuestion from '../components/RadioButtonQuestion/RadioButtonQuestion'
import RatingQuestion from '../components/RatingQuestion/RatingQuestion'
import YesNoQuestion from '../components/YesNoQuestion/YesNoQuestion'

interface QuestionnaireProps {
  questions: UserAssessmentDTO['questions']
  inviteCode: string
}

export default function Questionnaire(props: QuestionnaireProps): JSX.Element {
  const { showError } = useToaster()
  const { questions, inviteCode } = props
  const { values } = useFormikContext<AssessmentsForm>()

  const { mutate: saveAssessment } = useSaveAssessmentResponse({
    requestOptions: {
      headers: {
        Authorization: inviteCode
      }
    }
  })

  async function handleSubmit(formData: AssessmentsForm): Promise<void> {
    const saveAssessmentReqBody = { responses: formData?.userResponse }
    try {
      await saveAssessment(saveAssessmentReqBody)
    } catch (errorInfo) {
      showError(getErrorMessage(errorInfo))
    }
  }

  useDeepCompareEffect(() => {
    if (values) {
      handleSubmit(values)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values])

  return (
    <>
      {Array.isArray(questions) && questions.length
        ? questions.map((question, questionIndex) => {
            const { questionNumber, questionText, possibleResponses, questionType } = question || {}
            switch (questionType) {
              case 'RADIO_BUTTON':
                return (
                  <Container padding={{ bottom: 'xxxlarge' }}>
                    <RadioButtonQuestion
                      questionNumber={questionNumber}
                      questionText={questionText}
                      possibleResponses={possibleResponses}
                      questionIndex={questionIndex}
                    />
                  </Container>
                )
              case 'CHECKBOX':
                return (
                  <Container padding={{ bottom: 'xxxlarge' }}>
                    <CheckBoxQuestion
                      questionNumber={questionNumber}
                      questionText={questionText}
                      possibleResponses={possibleResponses}
                      questionIndex={questionIndex}
                    />
                  </Container>
                )
              case 'RATING':
                return (
                  <Container padding={{ bottom: 'xxxlarge' }}>
                    <RatingQuestion
                      questionNumber={questionNumber}
                      questionText={questionText}
                      possibleResponses={possibleResponses}
                      questionIndex={questionIndex}
                    />
                  </Container>
                )
              case 'YES_NO':
                return (
                  <Container padding={{ bottom: 'xxxlarge' }}>
                    <YesNoQuestion
                      questionNumber={questionNumber}
                      questionText={questionText}
                      possibleResponses={possibleResponses}
                      questionIndex={questionIndex}
                    />
                  </Container>
                )
              default:
                return <></>
            }
          })
        : null}
    </>
  )
}
