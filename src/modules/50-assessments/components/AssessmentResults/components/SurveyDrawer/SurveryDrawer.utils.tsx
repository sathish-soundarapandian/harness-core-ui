import { Container, Text } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import React from 'react'
import { calculatePercentage, getScoreComparisonChartOptions } from '@assessments/components/utils'
import type { ScoreOverviewDTO } from 'services/assessments'
import { SURVEY_CHART_OPTIONS } from './SurveryDrawer.constants'
import css from './SurveryDrawer.module.scss'

export const renderComparizionGraph = (sectionScore: ScoreOverviewDTO): JSX.Element => {
  const { benchmarkScore, organizationScore, selfScore } = sectionScore
  return (
    <Container className={css.comparisionGraphContainer}>
      <Container className={css.compareSeriesText}>
        <Text font={{ variation: FontVariation.SMALL_SEMI }}>{'Your score'}</Text>
        <Text font={{ variation: FontVariation.SMALL }}>{'Company score'}</Text>
        {benchmarkScore ? <Text font={{ variation: FontVariation.SMALL }}>{'Benchmark'}</Text> : null}
      </Container>
      <Container flex={{ alignItems: 'center' }}>
        <HighchartsReact
          highcharts={Highcharts}
          options={getScoreComparisonChartOptions(
            {
              userScore: calculatePercentage(selfScore?.score, selfScore?.maxScore),
              questionOrgScore: calculatePercentage(organizationScore?.score, organizationScore?.maxScore),
              questionBenchMarkScore: benchmarkScore
                ? calculatePercentage(benchmarkScore?.score, benchmarkScore?.maxScore)
                : undefined
            },
            SURVEY_CHART_OPTIONS
          )}
        />
      </Container>
    </Container>
  )
}
