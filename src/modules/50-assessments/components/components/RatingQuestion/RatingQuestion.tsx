import React, { useMemo } from 'react'
import { Container, FormError, Layout, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { Slider } from '@blueprintjs/core'
import { useFormikContext } from 'formik'
import type { QuestionResponse } from 'services/assessments'
import { useStrings } from 'framework/strings'
import type { AssessmentsForm } from '../../../interfaces/Assessments'
import QuestionText from '../../QuestionText/QuestionText'
import { getCurrentSelectedValue } from './RatingQuestion.utils'
import css from './Rating.module.scss'

export interface RatingQuestionProps {
  questionNumber: QuestionResponse['questionNumber']
  questionText: QuestionResponse['questionText']
  possibleResponses: QuestionResponse['possibleResponses']
  questionIndex: number
}

export default function RatingQuestion(props: RatingQuestionProps): JSX.Element {
  const { questionNumber, questionText, possibleResponses = [], questionIndex } = props
  const { setFieldValue, touched, errors, values } = useFormikContext<AssessmentsForm>()
  const showFieldError = Boolean(Object.keys(touched).length)
  const { getString } = useStrings()
  const errorMessage = errors?.userResponse?.[questionIndex]

  const currentSelectedValue = useMemo(() => {
    return getCurrentSelectedValue(possibleResponses, values, questionIndex)
  }, [possibleResponses, questionIndex, values])

  return (
    <>
      {possibleResponses.length ? (
        <>
          <QuestionText questionNumber={questionNumber} questionText={questionText} />
          <Layout.Vertical padding={{ top: 'xlarge' }}>
            <Layout.Horizontal>
              <Text padding={{ right: 'xlarge' }} color={Color.RED_700}>
                {getString('assessments.stronglyDisagree')}
              </Text>
              <Slider
                className={css.slider}
                min={0}
                max={possibleResponses.length - 1}
                stepSize={1}
                value={currentSelectedValue}
                labelRenderer={valueData => {
                  return possibleResponses[valueData]?.optionText as string
                }}
                onChange={selectedValue => {
                  setFieldValue(
                    `userResponse.${questionIndex}.responseIds.0`,
                    possibleResponses[selectedValue]?.optionId
                  )
                }}
              />
              <Text padding={{ left: 'xlarge' }} color={Color.GREEN_700}>
                {getString('assessments.stronglyAgree')}
              </Text>
            </Layout.Horizontal>
          </Layout.Vertical>
        </>
      ) : null}
      {errorMessage && showFieldError && (
        <Container>
          <FormError name={`userResponse.${questionIndex}`} errorMessage={errorMessage} />
        </Container>
      )}
    </>
  )
}
