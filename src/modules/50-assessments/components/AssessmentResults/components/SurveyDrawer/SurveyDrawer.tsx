import { Card, Container, Layout, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import React from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { Drawer } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import type { QuestionScore } from 'services/assessments'
import { calculatePercentage, getScoreComparisonChartOptions, getSectionImage } from '../../../utils'
import { DrawerProps, LEVELS } from './SurveryDrawer.constants'
import LevelContent from './components/LevelContent/LevelContent'
import css from './SurveryDrawer.module.scss'

interface SurveyDrawerProps {
  isOpen: boolean
  onHideCallback: () => void
  currentRowDetails: QuestionScore
  currentSection: string
}

export default function SurveyDrawer(props: SurveyDrawerProps): JSX.Element {
  const { isOpen, onHideCallback, currentRowDetails, currentSection } = props
  const { questionScore, questionText, capability } = currentRowDetails || {}
  const { selfScore, benchmarkScore, organizationScore } = questionScore || {}
  const { getString } = useStrings()
  const sectionImage = getSectionImage(currentSection)
  return (
    <Drawer
      {...DrawerProps}
      isOpen={isOpen}
      onClose={onHideCallback}
      data-testid={'surveyDrawer'}
      className={css.surveryDrawer}
    >
      <Layout.Vertical>
        <Container className={css.drawerHeader}>
          <Layout.Horizontal flex={{ justifyContent: 'space-between' }}>
            <Layout.Vertical width={340}>
              <Text padding={'medium'} font={{ weight: 'bold', size: 'medium' }} color={Color.GREY_900}>
                {capability}
              </Text>
              <Text padding={{ left: 'medium' }} font={{ size: 'small' }} color={Color.GREY_500}>
                {questionText}
              </Text>
            </Layout.Vertical>
            <Layout.Horizontal
              flex={{ justifyContent: 'center', alignItems: 'center' }}
              margin={{ top: 'xxxlarge', left: 'xxxlarge' }}
            >
              <img src={sectionImage} width="30" height="30" alt="" />
              <Text
                padding={{ left: 'small', right: 'medium', top: 'medium', bottom: 'medium' }}
                font={{ weight: 'semi-bold', size: 'normal' }}
                color={Color.GREY_600}
              >
                {currentRowDetails?.sectionText}
              </Text>
            </Layout.Horizontal>
          </Layout.Horizontal>
        </Container>
        <Layout.Vertical className={css.drawerContent}>
          <Card className={css.charts}>
            {Object.values(LEVELS).map((level: string) => (
              <div key={level as string}>
                <LevelContent level={level} question={currentRowDetails} />
              </div>
            ))}
          </Card>
          <Card className={css.charts}>
            <Layout.Vertical>
              <Text className={css.sideDrawerTitle}>{'Comparison'}</Text>
              <Layout.Horizontal>
                <Layout.Vertical padding={{ top: 'xlarge' }} width={120}>
                  <Text className={css.scoreLabels} padding={{ top: 'xxsmall' }}>
                    {getString('assessments.yourScore')}
                  </Text>
                  <Text className={css.scoreLabels} padding={{ top: 'xxsmall' }}>
                    {getString('assessments.companyScore')}
                  </Text>
                  {benchmarkScore ? (
                    <Text className={css.scoreLabels} padding={{ top: 'xxsmall' }}>
                      {getString('assessments.benchmark')}
                    </Text>
                  ) : null}
                </Layout.Vertical>
                <HighchartsReact
                  highcharts={Highcharts}
                  options={getScoreComparisonChartOptions({
                    userScore: calculatePercentage(selfScore?.score, selfScore?.maxScore),
                    questionOrgScore: calculatePercentage(organizationScore?.score, organizationScore?.maxScore),
                    questionBenchMarkScore: benchmarkScore
                      ? calculatePercentage(benchmarkScore?.score, benchmarkScore?.maxScore)
                      : undefined
                  })}
                />
              </Layout.Horizontal>
            </Layout.Vertical>
          </Card>
          {currentRowDetails?.recommendation && (
            <Card className={css.charts}>
              <Text>{getString('assessments.recommendation')}</Text>
              <Text>{currentRowDetails.recommendation.recommendationText}</Text>
            </Card>
          )}
        </Layout.Vertical>
      </Layout.Vertical>
    </Drawer>
  )
}
