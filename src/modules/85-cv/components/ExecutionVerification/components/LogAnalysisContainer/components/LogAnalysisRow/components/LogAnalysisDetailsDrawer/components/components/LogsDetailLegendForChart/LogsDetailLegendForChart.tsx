import React from 'react'
import { Container, Layout, Text, Utils } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { LogData } from 'services/cv'
import { getEventTypeChartColor } from '@cv/utils/CommonUtils'
import { legendKeyMapping, LogEvents } from '../../../LogAnalysisDetailsDrawer.constants'
import css from './LogsDetailLegendForChart.module.scss'

export interface LogsDetailLegendForChartPropsType {
  clusterType: LogData['tag']
}

export default function LogsDetailLegendForChart({
  clusterType
}: LogsDetailLegendForChartPropsType): JSX.Element | null {
  const { getString } = useStrings()

  const clusterTypeColor = getEventTypeChartColor(clusterType)

  const isUnknownEvent = clusterType === LogEvents.UNKNOWN

  if (!clusterType) {
    return null
  }

  return (
    <Layout.Horizontal spacing="medium">
      {!isUnknownEvent && (
        <Layout.Horizontal className={css.legendHolder}>
          <Container
            className={css.legendTile}
            style={{ backgroundColor: Utils.getRealCSSColor(Color.GREY_300) }}
          ></Container>
          <Text tooltipProps={{ dataTooltipId: 'verifyStepBaselineEventsTooltip' }}>
            {getString('cv.baselineEvents')}
          </Text>
        </Layout.Horizontal>
      )}
      <Layout.Horizontal className={css.legendHolder}>
        <Container className={css.legendTile} style={{ backgroundColor: clusterTypeColor }}></Container>
        <Text>{getString(legendKeyMapping[clusterType])}</Text>
      </Layout.Horizontal>
    </Layout.Horizontal>
  )
}
