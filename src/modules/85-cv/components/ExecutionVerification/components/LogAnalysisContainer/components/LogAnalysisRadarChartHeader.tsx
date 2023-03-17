/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Text, Layout, Container } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { getEventTypeChartColor } from '@cv/utils/CommonUtils'
import type { LogAnalysisRadarChartHeaderProps } from './LogAnalysisRadarChart.types'
import { HealthRiskLegendOrder } from '../LogAnalysisView.container.constants'
import {
  getRiskDisplayText,
  getRiskIcon
} from './LogAnalysisRow/components/LogAnalysisDataRow/components/LogAnalysisRiskDisplayUtils'
import css from '../LogAnalysis.module.scss'

const LogAnalysisRadarChartHeader: React.FC<LogAnalysisRadarChartHeaderProps> = ({
  eventsCount,
  totalClustersCount,
  showHealthLegend
}) => {
  const { getString } = useStrings()
  return (
    <Container margin={{ bottom: 'large' }}>
      <Layout.Horizontal className={css.logCountsDetail}>
        {eventsCount ? (
          <Text
            border={{ right: true }}
            padding={{ right: 'small' }}
            margin={{ right: 'small' }}
            font={{ variation: FontVariation.SMALL }}
            style={{ whiteSpace: 'nowrap' }}
            data-testid="LogAnalysis_totalClusters"
          >
            {getString('total')} : {totalClustersCount ?? getString('noData')}
          </Text>
        ) : null}
        {eventsCount
          ? eventsCount.map(detail => {
              return (
                <Layout.Horizontal
                  style={{ alignItems: 'center' }}
                  margin={{ right: 'small' }}
                  key={detail.clusterType}
                  data-testid={`${detail.clusterType}-count`}
                >
                  <span
                    className={css.radarChartTypeIndicator}
                    style={{ background: getEventTypeChartColor(detail.clusterType) }}
                  ></span>
                  <Text font={{ variation: FontVariation.SMALL }}>
                    {detail.displayName} ({detail.count})
                  </Text>
                </Layout.Horizontal>
              )
            })
          : null}
      </Layout.Horizontal>
      {showHealthLegend && (
        <Layout.Horizontal margin={{ top: 'small' }} className={css.logCountsDetail}>
          <Text
            margin={{ right: 'small' }}
            font={{ variation: FontVariation.SMALL }}
            style={{ whiteSpace: 'nowrap' }}
            data-testid="healthRisks_legend"
          >
            {getString('cd.getStartedWithCD.healthStatusLabel')} :
          </Text>

          {HealthRiskLegendOrder.map(healthRisk => {
            return (
              <Layout.Horizontal
                style={{ alignItems: 'center' }}
                margin={{ right: 'small' }}
                key={'Healthy'}
                data-testid={healthRisk}
              >
                <img src={getRiskIcon(healthRisk)} style={{ width: 16 }} alt={healthRisk} />
                <Text font={{ variation: FontVariation.SMALL }}>{getRiskDisplayText(healthRisk, getString)}</Text>
              </Layout.Horizontal>
            )
          })}
        </Layout.Horizontal>
      )}
    </Container>
  )
}

export default LogAnalysisRadarChartHeader
