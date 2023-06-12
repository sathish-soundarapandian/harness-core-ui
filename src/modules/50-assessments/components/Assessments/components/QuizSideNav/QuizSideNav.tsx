import React, { useMemo } from 'react'
import { Container, Icon, Layout, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { QuestionResponse } from 'services/assessments'
import FlagImage from '@assessments/assets/flag.svg'
import type { SectionDetails } from '@assessments/interfaces/Assessments'
import VerticalStages from '../VerticalStages/VerticalStages'
import css from './QuizSideNav.module.scss'

interface QuizSideNavProps {
  expectedCompletionDuration: number
  sectionQuestions: {
    [key: string]: QuestionResponse[]
  }
  sectionId: string
}

export default function QuizSideNav(props: QuizSideNavProps): JSX.Element {
  const { getString } = useStrings()

  const sections = useMemo(() => {
    const sectionIds = Object.keys(props.sectionQuestions || {})
    return sectionIds.map((sectionId: string) => {
      const question = props.sectionQuestions[sectionId][0]
      return {
        id: sectionId,
        name: question?.sectionName || '',
        questionIds: props.sectionQuestions[sectionId].map((q: QuestionResponse) => q.questionId || '')
      } as SectionDetails
    })
  }, [props.sectionQuestions])

  return (
    <Container className={css.quizNav} padding={{ left: 'xxxlarge', right: 'xxlarge' }}>
      <Icon size={128} name="harness-logo-white" style={{ height: '84px' }} />
      <Text color={Color.GREY_0}>{getString('assessments.softwareDeliveryMaturityModel')}</Text>
      <Layout.Horizontal margin={{ top: 'xxlarge', bottom: 'large' }}>
        <Icon size={16} name={'stopwatch'} color={Color.GREY_0} />
        <Text color={Color.GREY_0} padding={{ left: 'small' }}>
          {`${getString('assessments.estimatedTime')}: ${props.expectedCompletionDuration || 0} min`}
        </Text>
      </Layout.Horizontal>
      <VerticalStages sections={sections} currentSectionId={props.sectionId} />
      <Layout.Horizontal margin={{ top: 'xxlarge', bottom: 'large' }}>
        <img src={FlagImage} width="16" height="16" alt="" />
        <Text color={Color.GREY_200} padding={{ left: 'small' }}>
          {getString('assessments.result')}
        </Text>
      </Layout.Horizontal>
    </Container>
  )
}
