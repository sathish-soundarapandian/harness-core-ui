import React from 'react'
import { Layout, Checkbox, Container, FormError } from '@harness/uicore'
import { useFormikContext } from 'formik'
import type { QuestionResponse } from 'services/assessments'
import type { AssessmentsForm } from '../../../interfaces/Assessments'
import QuestionText from '../../QuestionText/QuestionText'
import { getUpdatedResponseIds, isOptionChecked } from './CheckBoxQuestion.utils'

interface CheckBoxQuestionProps {
  questionNumber: QuestionResponse['questionNumber']
  questionText: QuestionResponse['questionText']
  possibleResponses: QuestionResponse['possibleResponses']
  questionIndex: number
}

export default function CheckBoxQuestion(props: CheckBoxQuestionProps): JSX.Element {
  const { questionNumber, questionText, possibleResponses, questionIndex } = props
  const { setFieldValue, values, touched, errors } = useFormikContext<AssessmentsForm>()
  const showFieldError = Boolean(Object.keys(touched).length)
  const errorMessage = errors?.userResponse?.[questionIndex]
  return (
    <>
      <QuestionText questionNumber={questionNumber} questionText={questionText} />
      <Layout.Vertical>
        {Array.isArray(possibleResponses) && possibleResponses.length
          ? possibleResponses.map((possibleResponse, possibleResponseIndex) => {
              const { optionId, optionText } = possibleResponse || {}
              return (
                <Checkbox
                  key={optionId}
                  label={optionText}
                  name={`userResponse.${questionIndex}.responseIds.${possibleResponseIndex}`}
                  checked={isOptionChecked(values, questionIndex, possibleResponse)}
                  onChange={e => {
                    const updatedResponseIds = getUpdatedResponseIds(values, questionIndex, e, optionId)
                    setFieldValue(`userResponse.${questionIndex}.responseIds`, updatedResponseIds)
                  }}
                />
              )
            })
          : null}
      </Layout.Vertical>
      {errorMessage && showFieldError && (
        <Container>
          <FormError name={`userResponse.${questionIndex}`} errorMessage={errorMessage} />
        </Container>
      )}
    </>
  )
}
