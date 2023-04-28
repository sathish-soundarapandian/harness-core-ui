import { Card, Container, Layout, Text } from '@harness/uicore'
import React from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { Drawer } from '@blueprintjs/core'
import type { UserResponsesResponse } from 'services/assessments'
import { getScoreComparisonChartOptions } from '@assessments/components/AssessmentResults/AssessmentResults.utils'
import { useStrings } from 'framework/strings'
import { DrawerProps } from '../../AssessmentSurvey.constants'
import Score from '../Score/Score'
import css from '../../AssessmentSurvey.module.scss'

interface SurveyDrawerProps {
  isOpen: boolean
  onHideCallback: () => void
  currentRowDetails: UserResponsesResponse | null
}

export default function SurveyDrawer(props: SurveyDrawerProps): JSX.Element {
  const { isOpen, onHideCallback, currentRowDetails } = props
  const { userScore, maxScore, benchmarkScore, organizationScore, questionText } = currentRowDetails || {}
  const { getString } = useStrings()
  return (
    <Drawer {...DrawerProps} isOpen={isOpen} onClose={onHideCallback}>
      <Container className={css.drawerHeader}>
        <Layout.Horizontal flex={{ justifyContent: 'space-between' }}>
          <Layout.Vertical width={298}>
            <Text padding={'medium'} className={css.questionLabel}>
              {'QUESTION'}
            </Text>
            <Text padding={{ left: 'medium' }} className={css.questionTextDrawerHeader}>
              {questionText}
            </Text>
          </Layout.Vertical>
          <Container margin={{ top: 'xxxlarge', right: 'xxxlarge' }}>
            <Score userScore={currentRowDetails?.userScore} />
          </Container>
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
              <Text className={css.scoreLabels} padding={{ top: 'xxsmall' }}>
                {getString('assessments.maxScore')}
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
                userScore: userScore,
                questionOrgScore: organizationScore,
                questionBenchMarkScore: benchmarkScore,
                questionMaxScore: maxScore
              })}
            />
          </Layout.Horizontal>
        </Layout.Vertical>
      </Card>
    </Drawer>
  )
}
