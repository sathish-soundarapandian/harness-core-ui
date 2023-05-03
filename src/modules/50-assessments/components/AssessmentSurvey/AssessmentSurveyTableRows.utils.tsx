import { Button, ButtonVariation, Container, Layout, Text } from '@harness/uicore'
import React from 'react'
import type { CellProps, Renderer } from 'react-table'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import type { UserResponsesResponse } from 'services/assessments'
import { getScoreComparisonChartOptions } from '../AssessmentResults/AssessmentResults.utils'
import { SURVEY_CHART_OPTIONS } from './AssessmentSurvey.constants'
import Score from './components/Score/Score'
import css from './AssessmentSurvey.module.scss'

export const RenderQuestion: Renderer<CellProps<UserResponsesResponse>> = ({ row }) => {
  const questionTextInfo = row?.original?.questionText
  return (
    <Text padding={'medium'} className={css.questionText}>
      {questionTextInfo}
    </Text>
  )
}

export const RenderScore: Renderer<CellProps<UserResponsesResponse>> = ({ row }) => {
  const userScoreInfo = row?.original?.userScore as number
  return <Score userScore={userScoreInfo} />
}

export const RenderComparison: Renderer<CellProps<UserResponsesResponse>> = ({ row }) => {
  const data = row?.original
  const {
    benchmarkScore: questionBenchMarkScore,
    maxScore: questionMaxScore,
    organizationScore: questionOrgScore
  } = data

  return (
    <Layout.Horizontal>
      <Layout.Vertical padding={{ top: 'xlarge' }} width={120}>
        <Text className={css.scoreLabels}>{'Company score'}</Text>
        <Text className={css.scoreLabels}>{'Maximum score'}</Text>
        {questionBenchMarkScore ? <Text className={css.scoreLabels}>{'Benchmark'}</Text> : null}
      </Layout.Vertical>
      <HighchartsReact
        highcharts={Highcharts}
        options={getScoreComparisonChartOptions(
          {
            questionOrgScore,
            questionBenchMarkScore,
            questionMaxScore
          },
          SURVEY_CHART_OPTIONS
        )}
      />
    </Layout.Horizontal>
  )
}

export const RenderRecommendations: Renderer<CellProps<UserResponsesResponse>> = () => {
  return (
    <Container flex={{ justifyContent: 'center', alignItems: 'center' }}>
      <Button
        variation={ButtonVariation.SECONDARY}
        text={'Recommendations'}
        margin={{ right: 'small' }}
        disabled={true}
      />
    </Container>
  )
}
