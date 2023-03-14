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
import { Container, Icon, PageError, NoDataCard, Heading, Utils } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import NoChartDataImage from '@cv/assets/noChartData.svg'
import { getChartSeriesValues } from '@cv/pages/health-source/common/CommonMetricLineChart/CommonMetricLineChart.utils'
import { SLIMetricChartLegend } from './SLIMetricChartLegend'
import { legendSliSingleMetricChart, sliMetricGraphConfig } from './SLIMetricChartLegend.utils'
import css from './SLIMetricChart.module.scss'

export interface SLIMetricChartProps {
  title?: string
  subTitle?: string
  metricName: string
  loading?: boolean
  error?: string
  dataPoints: (number | undefined)[][]
  retryOnError?: () => void
  showLegend?: boolean
  graphColor?: string
  legendTypePercentage?: boolean
}

export const SLIMetricChart = ({
  title,
  subTitle,
  loading,
  error,
  metricName,
  retryOnError,
  dataPoints,
  graphColor,
  showLegend,
  legendTypePercentage
}: SLIMetricChartProps): JSX.Element => {
  const { getString } = useStrings()
  const containerHeight = '150px'
  let content = null

  if (loading) {
    content = (
      <Container flex={{ justifyContent: 'center' }} height={containerHeight}>
        <Icon name="steps-spinner" color={Color.GREY_400} size={30} />
      </Container>
    )
  } else if (error) {
    content = (
      <Container flex={{ justifyContent: 'center' }} height={containerHeight}>
        <PageError width={400} message={error} onClick={() => retryOnError?.()} />
      </Container>
    )
  } else if (!dataPoints || dataPoints?.length === 0) {
    content = (
      <Container flex={{ justifyContent: 'center' }} width={'100%'} height={containerHeight} margin={{ top: 'large' }}>
        <NoDataCard
          image={NoChartDataImage}
          containerClassName={css.noData}
          message={getString('cv.monitoringSources.gco.noMetricData')}
        />
      </Container>
    )
  } else {
    const sliMetricGraphSeries = [
      {
        name: metricName,
        data: dataPoints,
        type: 'line',
        color: graphColor || Utils.getRealCSSColor(Color.PRIMARY_5)
      } as SeriesLineOptions
    ]

    const legendData = legendSliSingleMetricChart(dataPoints)

    const chartSeriesValues = getChartSeriesValues(sliMetricGraphSeries, undefined, sliMetricGraphConfig)

    content = (
      <>
        <HighchartsReact highcharts={Highcharts} options={chartSeriesValues} />
        {showLegend && <SLIMetricChartLegend showPercentage={legendTypePercentage} legendData={legendData} />}
      </>
    )
  }

  return (
    <Container className={css.singleMetricChart} data-testid={`${metricName}_metricChart`}>
      <Heading level={6} color={Color.PRIMARY_10}>
        {title}
      </Heading>
      <Heading level={4} margin={{ bottom: 'small' }}>
        {subTitle}
      </Heading>
      {content}
    </Container>
  )
}
