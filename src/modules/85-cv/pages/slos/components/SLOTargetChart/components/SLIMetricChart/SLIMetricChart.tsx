/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import type { SeriesLineOptions } from 'highcharts'
import { Container, Icon, PageError, NoDataCard } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { DataPoints } from 'services/cv'
import NoChartDataImage from '@cv/assets/noChartData.svg'
import { getChartSeriesValues } from '@cv/pages/health-source/common/CommonMetricLineChart/CommonMetricLineChart.utils'
import type { SLOTargetChartWithAPIGetSliGraphProps } from '../../SLOTargetChart.types'
import { SLIMetricChartLegend } from './SLIMetricChartLegend'
import { legendSliMetricChart } from './SLIMetricChartLegend.utils'
import css from './SLIMetricChart.module.scss'

export const SliMetricGraph: React.FC<SLOTargetChartWithAPIGetSliGraphProps> = ({
  serviceLevelIndicator,
  monitoredServiceIdentifier,
  metricGraphData,
  loading,
  error,
  retryOnError,
  showMetricChart
}) => {
  const eventType = serviceLevelIndicator.spec.spec?.eventType
  const { getString } = useStrings()
  const metricColor = ['red', 'green']
  const metricKeys = Object.keys(metricGraphData || {})
  const hasMultipleMetric = metricKeys.length > 1
  const dataMetricGraph = metricKeys.map((metric, index) => {
    const dataPoints = metricGraphData?.[metric].dataPoints?.map((graphData: DataPoints) => [
      graphData.timeStamp,
      graphData.value
    ])
    const chartColor = hasMultipleMetric ? { color: metricColor[index] } : {}
    return { name: metric, data: dataPoints, type: 'line', ...chartColor } as SeriesLineOptions
  })

  const legendData = legendSliMetricChart(metricGraphData)

  const chartSeriesValues = getChartSeriesValues(dataMetricGraph, undefined, {})

  const containerHeight = showMetricChart ? '250px' : '100%'

  if (loading) {
    return (
      <Container flex={{ justifyContent: 'center' }} height={containerHeight}>
        <Icon name="steps-spinner" color={Color.GREY_400} size={30} />
      </Container>
    )
  }

  if (error) {
    return (
      <Container flex={{ justifyContent: 'center' }} height={containerHeight}>
        <PageError
          width={400}
          message={error}
          onClick={() => retryOnError(serviceLevelIndicator, monitoredServiceIdentifier)}
        />
      </Container>
    )
  }

  if (metricKeys.length === 0) {
    return (
      <Container flex={{ justifyContent: 'center' }} width={'100%'} height={containerHeight} margin={{ top: 'large' }}>
        <NoDataCard
          image={NoChartDataImage}
          containerClassName={css.noData}
          message={getString('cv.monitoringSources.gco.noMetricData')}
        />
      </Container>
    )
  }

  return (
    <div>
      <HighchartsReact highcharts={Highcharts} options={chartSeriesValues} />
      <SLIMetricChartLegend hasMultipleMetric={hasMultipleMetric} eventType={eventType} legendData={legendData} />
    </div>
  )
}
