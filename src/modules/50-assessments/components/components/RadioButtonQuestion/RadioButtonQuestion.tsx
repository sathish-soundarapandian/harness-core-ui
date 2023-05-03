import { Container, FormError, FormInput } from '@harness/uicore'
import React, { useMemo } from 'react'
import { useFormikContext } from 'formik'
import type { QuestionResponse } from 'services/assessments'
import type { AssessmentsForm } from '../../../interfaces/Assessments'
import { getOptionsForRadioButtonQuestion } from './RadioButtonQuestion.utils'
import QuestionText from '../../QuestionText/QuestionText'

interface RadioButtonQuestionProps {
  questionNumber: QuestionResponse['questionNumber']
  questionText: QuestionResponse['questionText']
  possibleResponses: QuestionResponse['possibleResponses']
  questionIndex: number
}

export default function RadioButtonQuestion(props: RadioButtonQuestionProps): JSX.Element {
  const { questionNumber, questionText, possibleResponses, questionIndex } = props
  const { errors, touched } = useFormikContext<AssessmentsForm>()
  const showFieldError = Boolean(Object.keys(touched).length)
  const errorMessage = errors?.userResponse?.[questionIndex]

  const items = useMemo(() => {
    return getOptionsForRadioButtonQuestion(possibleResponses)
  }, [possibleResponses])

  return (
    <>
      <FormInput.RadioGroup
        name={`userResponse.${questionIndex}.responseIds.0`}
        label={<QuestionText questionNumber={questionNumber} questionText={questionText} />}
        items={items}
      />
      {errorMessage && showFieldError && (
        <Container>
          <FormError name={`userResponse.${questionIndex}`} errorMessage={errorMessage} />
        </Container>
      )}
    </>
  )
}
