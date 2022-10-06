/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { forwardRef, useMemo } from 'react'
import type Highcharts from 'highcharts/highcharts'
import { isEqual, pick } from 'lodash-es'
import cx from 'classnames'
import { Container, Icon } from '@wings-software/uicore'
import type {
  PerspectiveTimeSeriesData,
  TimeSeriesDataPoints,
  QlceViewTimeGroupType,
  Maybe,
  QlceViewFieldInputInput
} from 'services/ce/services'

import type { CCM_CHART_TYPES } from '@ce/constants'
import { CCM_PAGE_TYPE } from '@ce/types'
import type { PerspectiveAnomalyData } from 'services/ce'
import Chart from './Chart'
import WorkloadDetailsChart from './WorkloadDetailsChart'
import { ResourceType, chartConfigMapping, chartOptionsMapping } from './ChartConfigs'
import { transformTimeSeriesData, ChartConfigType } from './chartUtils'
import css from './CloudCostInsightChart.module.scss'

interface CloudCostInsightChartProps {
  fetching: boolean
  errors?: any[] | null
  data: Maybe<PerspectiveTimeSeriesData>
  columnSequence: string[]
  chartType: CCM_CHART_TYPES
  aggregation: QlceViewTimeGroupType
  xAxisPointCount: number
  setFilterUsingChartClick?: (value: string) => void
  showLegends?: boolean
  pageType?: CCM_PAGE_TYPE
  anomaliesCountData?: PerspectiveAnomalyData[]
  groupBy?: QlceViewFieldInputInput
}

/* istanbul ignore next */
function getChartList({
  data,
  pageType,
  columnSequence
}: {
  data: Maybe<PerspectiveTimeSeriesData>
  pageType?: CCM_PAGE_TYPE
  columnSequence: string[]
}): ChartConfigType[][] {
  if (!data) {
    return []
  }
  if (pageType === CCM_PAGE_TYPE.Workload || pageType === CCM_PAGE_TYPE.Node) {
    const cpuChart: any[] = []
    const memoryChart: any[] = []

    Object.keys(data).forEach(chartKey => {
      const key = chartKey as keyof PerspectiveTimeSeriesData
      const chartData = data[key] as Array<TimeSeriesDataPoints>
      if (!Array.isArray(chartData)) return
      const transformedSeries = transformTimeSeriesData(chartData)

      const { chartType, resource } = chartConfigMapping[chartKey] || {}

      const chartSeries = transformedSeries.map(chart => {
        const chartName = chart.name || 'DEFAULT'

        return Object.assign({}, chart, chartOptionsMapping[chartType][chartName], {
          visible: true,
          showInLegend: true,
          chartSeries: chartKey
        })
      })

      if (resource === ResourceType.CPU) {
        cpuChart.push(...chartSeries)
      }
      if (resource === ResourceType.MEMORY) {
        memoryChart.push(...chartSeries)
      }
    })

    const series: any[] = []

    cpuChart.length && series.push(cpuChart)
    memoryChart.length && series.push(memoryChart)
    return series
  }

  const defBillingData = (data?.stats as TimeSeriesDataPoints[]) || null
  const defBillingChartData = defBillingData && transformTimeSeriesData(defBillingData, columnSequence)
  return [defBillingChartData]
}

const CloudCostInsightChart = forwardRef((props: CloudCostInsightChartProps, ref: React.Ref<Highcharts.Chart>) => {
  const {
    data,
    chartType,
    aggregation,
    xAxisPointCount,
    setFilterUsingChartClick,
    showLegends,
    pageType,
    fetching,
    columnSequence,
    anomaliesCountData,
    groupBy
  } = props

  const chartListData = useMemo(
    () =>
      getChartList({
        data,
        pageType,
        columnSequence
      }),
    [data, columnSequence]
  )

  const setChartRef: (chart: Highcharts.Chart) => void = chart => {
    const chartRef = ref as { current: Highcharts.Chart }
    if (chartRef) {
      chartRef.current = chart
    }
  }

  if (fetching) {
    return (
      <Container className={cx(css.chartMainContainer, css.loadingContainer)} data-testid="loader">
        <Icon name="spinner" size={28} color="blue500" />
      </Container>
    )
  }

  if (pageType === CCM_PAGE_TYPE.Workload || pageType === CCM_PAGE_TYPE.Node) {
    return (
      <Container className={css.chartMainContainer}>
        <WorkloadDetailsChart
          data={chartListData}
          aggregation={aggregation}
          chartType={chartType}
          onLoad={setChartRef}
          xAxisPointCount={xAxisPointCount}
          showLegends={showLegends || false}
        />
      </Container>
    )
  }

  return (
    <div>
      <Chart
        data={chartListData}
        aggregation={aggregation}
        chartType={chartType}
        onLoad={setChartRef}
        xAxisPointCount={xAxisPointCount}
        setFilterUsingChartClick={setFilterUsingChartClick}
        showLegends={showLegends || false}
        anomaliesCountData={anomaliesCountData}
        groupBy={groupBy as QlceViewFieldInputInput}
      />
    </div>
  )
})

CloudCostInsightChart.displayName = 'CloudCostInsightChart'

const propsToMonitor = ['data', 'fetching', 'errors', 'columnSequence', 'chartType', 'anomaliesCountData']

export default React.memo(CloudCostInsightChart, (prevProps, nextProps) => {
  return isEqual(pick(prevProps, propsToMonitor), pick(nextProps, propsToMonitor))
})
