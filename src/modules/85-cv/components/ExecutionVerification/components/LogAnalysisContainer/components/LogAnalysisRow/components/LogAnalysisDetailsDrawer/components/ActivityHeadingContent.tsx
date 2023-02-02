import React, { useMemo } from 'react'
import { isEmpty } from 'lodash-es'
import { Container, Text, Layout } from '@harness/uicore'
import { Color } from '@harness/design-system'
import HighchartsReact from 'highcharts-react-official'
import Highcharts from 'highcharts'
import { useStrings } from 'framework/strings'
import { getEventTypeColor, getEventTypeLightColor } from '@cv/utils/CommonUtils'
import type { ActivityHeadingContentProps } from '../LogAnalysisDetailsDrawer.types'
import { getChartsConfigForDrawer } from '../LogAnalysisDetailsDrawer.utils'
import { getEventTypeFromClusterType } from '../../../LogAnalysisRow.utils'
import LogsDetailLegendForChart from './components/LogsDetailLegendForChart/LogsDetailLegendForChart'
import logRowStyle from '../../../LogAnalysisRow.module.scss'
import css from '../LogAnalysisDetailsDrawer.module.scss'

export function ActivityHeadingContent(props: ActivityHeadingContentProps): JSX.Element | null {
  const { count, messageFrequency, activityType } = props

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
      <Container className={css.activityContainer}>
        <Layout.Horizontal className={css.firstRow}>
          <Container>
            <Text>{getString('pipeline.verification.logs.eventType')}</Text>
            <Text
              className={logRowStyle.eventTypeTag}
              font="normal"
              style={{
                color: getEventTypeColor(activityType),
                background: getEventTypeLightColor(activityType)
              }}
              data-testid="ActivityHeadingContent_eventType"
            >
              {getEventTypeFromClusterType(activityType, getString, true)}
            </Text>
          </Container>
          <Container>
            <Text>{getString('cv.logs.totalCount')}</Text>
            <Text color={Color.BLACK} data-testid="ActivityHeadingContent_count">
              {count}
            </Text>
          </Container>
        </Layout.Horizontal>
      </Container>

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
