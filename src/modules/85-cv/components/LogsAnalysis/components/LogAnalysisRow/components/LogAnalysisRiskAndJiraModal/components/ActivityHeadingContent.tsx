import React, { useMemo } from 'react'
import { Container, Text, Layout } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import HighchartsReact from 'highcharts-react-official'
import Highcharts from 'highcharts'
import { useStrings } from 'framework/strings'
import { getEventTypeColor, getEventTypeLightColor } from '@cv/utils/CommonUtils'
import type { ActivityHeadingContentProps } from '../LogAnalysisRiskAndJiraModal.types'
import { getChartsConfigForDrawer } from '../LogAnalysisRiskAndJiraModal.utils'
import { getEventTypeFromClusterType } from '../../../LogAnalysisRow.utils'
import css from '../LogAnalysisRiskAndJiraModal.module.scss'
import logRowStyle from '../../../LogAnalysisRow.module.scss'

export function ActivityHeadingContent(props: ActivityHeadingContentProps): JSX.Element {
  const { count, trendData, activityType } = props
  const { getString } = useStrings()

  const chartsConfig = useMemo(() => getChartsConfigForDrawer(getString, trendData?.series), [trendData, getString])

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
            <Text>{getString('instanceFieldOptions.instanceHolder')}</Text>
            <Text color={Color.BLACK} data-testid="ActivityHeadingContent_count">
              {count}
            </Text>
          </Container>
          {/* <Container>
            <Text>{getString('pipeline.verification.logs.firstOccurrence')}</Text>
            <Text color={Color.BLACK}>09/01/2022 04:30:45 PM</Text>
          </Container>
          <Container>
            <Text>{getString('pipeline.verification.logs.lastKnownOccurrence')}</Text>
            <Text color={Color.BLACK}>09/01/2022 04:57:23 PM</Text>
          </Container> */}
        </Layout.Horizontal>
      </Container>
      <Container className={css.chartContainer}>
        <HighchartsReact highchart={Highcharts} options={chartsConfig} />
      </Container>
    </>
  )
}
