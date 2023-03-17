import React from 'react'
import { Container, Text, Layout } from '@harness/uicore'
import { Color } from '@harness/design-system'
import type { LogAnalysisRadarChartListDTO, LogData } from 'services/cv'
import { useStrings } from 'framework/strings'
import { getEventTypeColor, getEventTypeLightColor } from '@cv/utils/CommonUtils'
import { getEventTypeFromClusterType } from '../../../LogAnalysisRow.utils'
import LogAnalysisRiskDisplay from '../../LogAnalysisDataRow/components/LogAnalysisRiskDisplay'
import logRowStyle from '../../../LogAnalysisRow.module.scss'
import css from '../LogAnalysisDetailsDrawer.module.scss'

interface LogsMetaDataProps {
  activityType?: LogData['tag']
  risk?: LogAnalysisRadarChartListDTO['risk']
  count?: number
}

export default function LogsMetaData({ activityType, count, risk }: LogsMetaDataProps): JSX.Element {
  const { getString } = useStrings()
  return (
    <Container className={css.activityContainer}>
      <Layout.Horizontal className={css.firstRow}>
        <Container>
          <Text margin={{ bottom: 'small' }}>{getString('health')}</Text>
          <LogAnalysisRiskDisplay risk={risk} showText />
        </Container>
        <Container>
          <Text margin={{ bottom: 'small' }}> {getString('pipeline.verification.logs.eventType')}</Text>
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
          <Text margin={{ bottom: 'small' }}>{getString('cv.logs.totalCount')}</Text>
          <Text color={Color.BLACK} data-testid="ActivityHeadingContent_count">
            {count}
          </Text>
        </Container>
      </Layout.Horizontal>
    </Container>
  )
}
