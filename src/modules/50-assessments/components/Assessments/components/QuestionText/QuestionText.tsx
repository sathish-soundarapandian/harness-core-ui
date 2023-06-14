import React from 'react'
import { Layout, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import type { QuestionResponse } from 'services/assessments'
import css from './QuestionText.module.scss'

interface QuestionTextProps {
  questionNumber: QuestionResponse['questionNumber']
  questionText: QuestionResponse['questionText']
}

export default function QuestionText(props: QuestionTextProps): JSX.Element {
  const { questionNumber, questionText } = props
  return (
    <Layout.Horizontal spacing="medium" className={css.questionText}>
      <div className={css.questionNumber}>
        <Text color={Color.GREY_0}>{questionNumber}</Text>
      </div>
      <Text font={{ variation: FontVariation.H3 }} color={Color.GREY_900}>
        {questionText}
      </Text>
    </Layout.Horizontal>
  )
}
