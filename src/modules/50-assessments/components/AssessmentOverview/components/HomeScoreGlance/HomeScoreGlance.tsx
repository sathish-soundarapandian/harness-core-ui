import { Card, Container, Icon, Layout, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { Link } from 'react-router-dom'
import cx from 'classnames'
import React, { useMemo } from 'react'
import { useStrings } from 'framework/strings'
import type { Score, ScoreOverviewDTO, SectionResultDTO } from 'services/assessments'
import { calculatePercentage } from '@assessments/components/utils'
import PercentageCard from '../PercentageCard/PercentageCard'
import ScoreSpiderGraph from '../ScoreSpiderGraph/ScoreSpiderGraph'
import PercentageChart from '../PercentageChart/PercentageChart'
import css from './HomeScoreGlance.module.scss'

interface HomeScoreGlanceProps {
  sectionResult: SectionResultDTO
}

const HomeScoreGlance = ({ sectionResult }: HomeScoreGlanceProps): JSX.Element => {
  const { getString } = useStrings()

  const { overallScoreOverview, sectionScores } = sectionResult
  const { selfScore, benchmarkScore } = overallScoreOverview as ScoreOverviewDTO
  const { score, maxScore } = selfScore as Score

  const benchmarkPercentage = useMemo(() => {
    if (benchmarkScore) {
      const { score: actualBenchmarkScore, maxScore: benchmarkMaxScore } = benchmarkScore as Score
      const benchmarkPercentagValue = calculatePercentage(actualBenchmarkScore, benchmarkMaxScore)
      const percentageDiffBenchmark = calculatePercentage(score, maxScore) - benchmarkPercentagValue
      const isBenchMarkPercentageDiffHigher = percentageDiffBenchmark >= 0
      return (
        <PercentageCard
          percentage={Math.abs(percentageDiffBenchmark)}
          percentageTitle={isBenchMarkPercentageDiffHigher ? 'Higher' : 'Lower'}
          textLineOne={'rest of industry'}
          textLineTwo={`${getString('assessments.benchmarkScore')} : ${benchmarkPercentagValue}`}
        />
      )
    }
    return null
  }, [benchmarkScore, getString, maxScore, score])

  return (
    <Layout.Horizontal margin={{ bottom: 'medium' }} className={css.homeScoreGlance}>
      <Layout.Vertical className={css.leftContainer} margin={{ right: 'large' }}>
        <Card className={css.leftCard}>
          <Layout.Horizontal flex={{ distribution: 'space-between' }}>
            <Layout.Vertical className={css.leftScoreCardContent} padding={{ top: 'large' }}>
              <Text font={{ size: 'medium', weight: 'semi-bold' }} color={Color.BLACK}>
                {getString('assessments.maturityScore')}
              </Text>
              <Text font={{ size: 'normal' }} padding={{ top: 'small', bottom: 'huge' }}>
                {getString('assessments.maturityLevelDefinition')}
              </Text>
              <Link to={''} target="_blank">
                <Layout.Horizontal>
                  <Text font={{ variation: FontVariation.SMALL }} color={Color.PRIMARY_7} padding={{ right: 'small' }}>
                    {getString('assessments.learnMoreAboutMaturity')}
                  </Text>
                  <Icon name="main-share" color={Color.PRIMARY_7} height={10} width={10} />
                </Layout.Horizontal>
              </Link>
            </Layout.Vertical>
            <Container
              margin={{ left: 'large' }}
              className={cx(css.leftScoreCardContent, css.circularPercentageContent)}
            >
              <PercentageChart score={score} maxScore={maxScore} />
            </Container>
          </Layout.Horizontal>
        </Card>
        <Card className={css.leftCard}>
          <Container flex={{ justifyContent: 'space-between' }}>
            <Layout.Vertical className={css.leftScoreCardContent} padding={{ top: 'large' }}>
              <Text font={{ size: 'medium', weight: 'semi-bold' }} color={Color.BLACK}>
                {getString('assessments.howYourScoreCompare')}
              </Text>
              <Text font={{ size: 'normal' }} padding={{ top: 'small', bottom: 'huge', right: 'xxlarge' }}>
                {getString('assessments.typicalComparison')}
              </Text>
              <Link to={''} target="_blank">
                <Layout.Horizontal>
                  <Text font={{ variation: FontVariation.SMALL }} color={Color.PRIMARY_7} padding={{ right: 'small' }}>
                    {getString('assessments.learnHowWeCompare')}
                  </Text>
                  <Icon name="main-share" color={Color.PRIMARY_7} height={10} width={10} />
                </Layout.Horizontal>
              </Link>
            </Layout.Vertical>
            {benchmarkPercentage}
          </Container>
        </Card>
      </Layout.Vertical>
      <ScoreSpiderGraph sectionScores={sectionScores || []} />
    </Layout.Horizontal>
  )
}

export default HomeScoreGlance
