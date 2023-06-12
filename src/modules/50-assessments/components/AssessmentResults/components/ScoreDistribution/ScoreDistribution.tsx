import React from 'react'
import { Card, Container, Layout, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import HighchartsReact from 'highcharts-react-official'
import Highcharts from 'highcharts'
import { useStrings } from 'framework/strings'
import type { ScoreOverviewDTO, SectionScore } from 'services/assessments'
import { calculatePercentage } from '../../../utils'
import ScoreCard from './ScoreCard'
import { getBarChart } from './ScoreDistribution.utils'
import css from './ScoreDistribution.module.scss'

interface ScoreDistributionProps {
  sectionScores: SectionScore[]
  overallScoreOverview: ScoreOverviewDTO
}

const ScoreDistribution = ({ sectionScores, overallScoreOverview }: ScoreDistributionProps): JSX.Element => {
  const { getString } = useStrings()

  return (
    <Card className={css.scoreDistribution}>
      <Layout.Horizontal className={css.headerContainer}>
        <Container className={css.titleText}>
          <Text font={{ weight: 'semi-bold', size: 'medium' }} width="340px" color="grey700">
            {getString('assessments.sectionScoreDistributionComparision')}
          </Text>
        </Container>
        {overallScoreOverview && (
          <Container className={css.scoreCardContainer}>
            <ScoreCard
              color={Color.PRIMARY_4}
              title={getString('assessments.yourScore')}
              score={calculatePercentage(
                overallScoreOverview?.selfScore?.score,
                overallScoreOverview?.selfScore?.maxScore
              )}
            />
            <ScoreCard
              color={Color.ORANGE_400}
              title={getString('assessments.companyAvgScore')}
              score={calculatePercentage(
                overallScoreOverview?.organizationScore?.score,
                overallScoreOverview?.organizationScore?.maxScore
              )}
            />
            {overallScoreOverview?.benchmarkScore && (
              <ScoreCard
                color={Color.YELLOW_500}
                title={getString('assessments.externalBenchmarkScore')}
                score={calculatePercentage(
                  overallScoreOverview?.benchmarkScore?.score,
                  overallScoreOverview?.benchmarkScore?.maxScore
                )}
              />
            )}
          </Container>
        )}
      </Layout.Horizontal>
      <HighchartsReact highcharts={Highcharts} options={getBarChart(sectionScores)} />
    </Card>
  )
}

export default ScoreDistribution
