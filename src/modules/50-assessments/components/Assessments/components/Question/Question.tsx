import { Container, Layout } from '@harness/uicore'
import React, { useMemo } from 'react'
import type { QuestionResponse } from 'services/assessments'
import QuestionText from '../QuestionText/QuestionText'
import { QuestionOptions, getOptionsForQuestion } from './Question.utils'
import SubmitButton from '../SubmitButton/SubmitButton'
import Option from '../Option/Option'
import css from './Question.module.scss'

interface QuestionProps {
  questionNumber: QuestionResponse['questionNumber']
  questionText: QuestionResponse['questionText']
  possibleResponses: QuestionResponse['possibleResponses']
  questionId: string | undefined
  onAnswerSelected: (optionId: string | undefined) => void
  selectedValues?: string[]
}

export default function Question(props: QuestionProps): JSX.Element {
  const { questionNumber, questionText, possibleResponses, onAnswerSelected, selectedValues } = props
  const items = useMemo(() => getOptionsForQuestion(possibleResponses), [possibleResponses])

  return (
    <Container width="900px" className={css.question}>
      <QuestionText questionNumber={questionNumber} questionText={questionText} />
      <Layout.Vertical spacing="medium" padding={{ left: 'huge', top: 'medium' }}>
        {items.map((item: QuestionOptions) => (
          <Option
            key={item.sequence}
            option={item.option}
            sequence={item.sequence}
            onClick={onAnswerSelected}
            isSelected={!!selectedValues?.includes(item.option.optionId || '')}
          />
        ))}
        <SubmitButton />
      </Layout.Vertical>
    </Container>
  )
}
