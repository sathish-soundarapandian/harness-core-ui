import { Card, Container, FormError, Layout, Text } from '@harness/uicore'
import React, { useMemo } from 'react'
import { useFormikContext } from 'formik'
import { isEmpty } from 'lodash-es'
import cx from 'classnames'
import type { QuestionResponse } from 'services/assessments'
import type { AssessmentsForm } from '../../../interfaces/Assessments'
import QuestionText from '../../QuestionText/QuestionText'
import { YES_NO_ENUM } from './YesNoQuestions.constants'
import css from './YesNoQuestion.module.scss'

interface YesNoQuestionProps {
  questionNumber: QuestionResponse['questionNumber']
  questionText: QuestionResponse['questionText']
  possibleResponses: QuestionResponse['possibleResponses']
  questionIndex: number
}

export default function YesNoQuestion(props: YesNoQuestionProps): JSX.Element {
  const { questionNumber, questionText, questionIndex, possibleResponses } = props
  const { setFieldValue, values, errors, touched } = useFormikContext<AssessmentsForm>()
  const showFieldError = Boolean(Object.keys(touched).length)
  const errorMessage = errors?.userResponse?.[questionIndex]

  const handleCardSelection = (cardSelection: YES_NO_ENUM): void => {
    const selectedOption = possibleResponses?.find(possibleResponse => possibleResponse?.optionText === cardSelection)
    setFieldValue(`userResponse.${questionIndex}.responseIds.0`, selectedOption?.optionId)
  }

  const selectedYesNo = useMemo(() => {
    let currentValue = ''
    const currentQuestionResponse = values?.userResponse?.[questionIndex]?.responseIds
    if (!isEmpty(currentQuestionResponse)) {
      const currentSelectedOptId = currentQuestionResponse[0]
      currentValue = possibleResponses?.find(possibleResponse => possibleResponse.optionId === currentSelectedOptId)
        ?.optionText as string
    }
    return currentValue
  }, [possibleResponses, questionIndex, values?.userResponse])

  const isYesSelected = selectedYesNo === YES_NO_ENUM.YES
  const isNoSelected = selectedYesNo === YES_NO_ENUM.NO

  return (
    <>
      <QuestionText questionNumber={questionNumber} questionText={questionText} />
      <Layout.Horizontal>
        <Container padding={{ right: 'medium' }}>
          <Card
            interactive={true}
            selected={isYesSelected}
            className={cx(css.displayCard, {
              [css.selected]: isYesSelected
            })}
            onClick={() => handleCardSelection(YES_NO_ENUM.YES)}
          >
            <Text
              style={{ marginTop: '5px' }}
              font="small"
              className={cx(css.optionText, {
                [css.selectedText]: isYesSelected
              })}
            >
              {YES_NO_ENUM.YES}
            </Text>
          </Card>
        </Container>
        <Card
          interactive={true}
          selected={isNoSelected}
          className={cx(css.displayCard, {
            [css.selected]: isNoSelected
          })}
          onClick={() => handleCardSelection(YES_NO_ENUM.NO)}
        >
          <Text
            style={{ marginTop: '5px' }}
            font="small"
            className={cx(css.optionText, {
              [css.selectedText]: isNoSelected
            })}
          >
            {YES_NO_ENUM.NO}
          </Text>
        </Card>
      </Layout.Horizontal>
      {errorMessage && showFieldError && (
        <Container>
          <FormError name={`userResponse.${questionIndex}`} errorMessage={errorMessage} />
        </Container>
      )}
    </>
  )
}
