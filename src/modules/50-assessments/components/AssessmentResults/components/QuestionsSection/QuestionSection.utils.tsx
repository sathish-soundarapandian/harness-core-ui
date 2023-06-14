import { Container, Layout, Text } from '@harness/uicore'
import React from 'react'
import { Color } from '@harness/design-system'
import type { CellProps, Renderer } from 'react-table'
import type { QuestionScore, Recommendation, ScoreOverviewDTO } from 'services/assessments'
import { useStrings } from 'framework/strings'
import thumpsUpImage from '@assessments/assets/Thumpsup.svg'
import { renderComparizionGraph } from '../ResultTable/ResultTable.utils'

export const RenderQuestion: Renderer<CellProps<QuestionScore>> = ({ row }) => {
  const { recommendation, capability } = row.original

  return (
    <Layout.Vertical padding={{ left: 'small', right: 'medium' }}>
      <Text padding={{ top: 'small' }} font={{ weight: 'bold', size: 'medium' }} color={Color.GREY_900}>
        {capability}
      </Text>
      <Text padding={{ top: 'small', bottom: 'small' }} font={{ size: 'normal' }} color={Color.GREY_500}>
        {recommendation?.recommendationText}
      </Text>
    </Layout.Vertical>
  )
}

export const RenderLevelForQuestion: Renderer<CellProps<QuestionScore>> = ({ row }) => {
  const level = row.original.questionScore?.maturityLevel
  const { getString } = useStrings()
  return (
    <Container>
      <Text padding={'medium'} font={{ weight: 'bold', size: 'medium' }} color={Color.GREY_900}>
        {`${getString('assessments.levelString')} ${level?.slice(-1)}`}
      </Text>
    </Container>
  )
}

export const RenderComparison: Renderer<CellProps<QuestionScore>> = ({ row }) => {
  const data = row.original.questionScore as ScoreOverviewDTO
  return renderComparizionGraph(data)
}

export const RenderQuestionsRecommendations: Renderer<CellProps<QuestionScore>> = ({ row }) => {
  const recommendation = row.original.recommendation as Recommendation

  if (recommendation) {
    return (
      <Container flex={{ justifyContent: 'center', alignItems: 'center' }}>
        <Text padding={{ left: 'small' }}>{recommendation.recommendationText}</Text>
      </Container>
    )
  } else {
    return (
      <Layout.Horizontal padding={{ left: 'medium' }}>
        <img src={thumpsUpImage} width="24" height="24" alt="" />
        <Text padding={{ left: 'small' }}>{'You are doing well'}</Text>
      </Layout.Horizontal>
    )
  }
}
