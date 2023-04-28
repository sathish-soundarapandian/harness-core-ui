import React from 'react'
import { Layout, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import type { QuestionResponse } from 'services/assessments'

interface QuestionTextProps {
  questionNumber: QuestionResponse['questionNumber']
  questionText: QuestionResponse['questionText']
}

export default function QuestionText(props: QuestionTextProps): JSX.Element {
  const { questionNumber, questionText } = props
  return (
    <Layout.Horizontal>
      <Text padding={{ right: 'small' }} color={Color.GREY_700}>{`${questionNumber}.`}</Text>
      <Text padding={{ bottom: 'medium' }} color={Color.GREY_700}>
        {questionText}
      </Text>
    </Layout.Horizontal>
  )
}
