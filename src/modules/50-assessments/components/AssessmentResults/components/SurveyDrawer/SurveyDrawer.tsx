import { Card, Container, Layout, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import React from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { Drawer } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import type { QuestionScore } from 'services/assessments'
import { calculatePercentage, getScoreComparisonChartOptions, getSectionImage } from '../../../utils'
import { DrawerProps } from './SurveryDrawer.constants'
import css from './SurveryDrawer.module.scss'

interface SurveyDrawerProps {
  isOpen: boolean
  onHideCallback: () => void
  currentRowDetails: QuestionScore | null
  currentSection: string
}

export default function SurveyDrawer(props: SurveyDrawerProps): JSX.Element {
  const { isOpen, onHideCallback, currentRowDetails, currentSection } = props
  const { questionScore, questionText, capability } = currentRowDetails || {}
  const { selfScore, benchmarkScore, organizationScore } = questionScore || {}
  const { getString } = useStrings()
  const sectionImage = getSectionImage(currentSection)
  return (
    <Drawer {...DrawerProps} isOpen={isOpen} onClose={onHideCallback} data-testid={'surveyDrawer'}>
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
              {currentSection}
            </Text>
          </Layout.Horizontal>
        </Layout.Horizontal>
      </Container>
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
    </Drawer>
  )
}
