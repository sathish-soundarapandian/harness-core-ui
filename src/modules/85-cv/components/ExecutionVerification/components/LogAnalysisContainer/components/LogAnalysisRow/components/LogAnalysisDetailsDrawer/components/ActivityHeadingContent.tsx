import React, { useMemo } from 'react'
import { isEmpty } from 'lodash-es'
import { Container, Text, Layout } from '@harness/uicore'
import { Color } from '@harness/design-system'
import HighchartsReact from 'highcharts-react-official'
import Highcharts from 'highcharts'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import { useStrings } from 'framework/strings'
import type { ActivityHeadingContentProps } from '../LogAnalysisDetailsDrawer.types'
import { getChartsConfigForDrawer } from '../LogAnalysisDetailsDrawer.utils'
import LogsDetailLegendForChart from './components/LogsDetailLegendForChart/LogsDetailLegendForChart'
import LogsMetaData from './LogsMetaData'
import LogDetailsFeedbackDisplay from './components/LogDetailsFeedbackDisplay/LogDetailsFeedbackDisplay'
import css from '../LogAnalysisDetailsDrawer.module.scss'

export function ActivityHeadingContent(props: ActivityHeadingContentProps): JSX.Element | null {
  const { count, messageFrequency, activityType, riskStatus, feedback, feedbackApplied } = props

  const isLogFeedbackEnabled = useFeatureFlag(FeatureFlag.SRM_LOG_FEEDBACK_ENABLE_UI)

  const { getString } = useStrings()

  const chartsConfig = useMemo(
    () =>
      messageFrequency?.map(chart => {
        return {
          hostName: chart.hostName,
          chartConfig: getChartsConfigForDrawer({ getString, chartDetails: chart, eventType: activityType })
        }
      }),
    [messageFrequency]
  )

  const canShowCharts = chartsConfig && !isEmpty(chartsConfig)

  return (
    <>
      <LogsMetaData activityType={activityType} count={count} risk={riskStatus} />

      {isLogFeedbackEnabled && <LogDetailsFeedbackDisplay feedback={feedback} feedbackApplied={feedbackApplied} />}

      {canShowCharts && (
        <Container margin={{ bottom: 'medium' }}>
          <LogsDetailLegendForChart clusterType={activityType} />
        </Container>
      )}
      {canShowCharts &&
        chartsConfig?.map(chart => {
          return (
            <Container data-testid="activityHeadingContent-chart" key={chart.hostName} margin={{ bottom: 'large' }}>
              <Layout.Horizontal margin={{ bottom: 'small' }}>
                <Text color={Color.GREY_400} margin={{ right: 'small' }}>
                  {getString('pipeline.verification.testHostName')}:
                </Text>
                <Text color={Color.GREY_700}>{chart.hostName}</Text>
              </Layout.Horizontal>

              <Container className={css.chartContainer}>
                <HighchartsReact highchart={Highcharts} options={chart.chartConfig} />
              </Container>
            </Container>
          )
        })}
    </>
  )
}
