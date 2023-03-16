/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { ThresholdLegend } from './SLIMetricChartLegend.types'

export const legendSliSingleMetricChart = (dataPoints: (number | undefined)[][]): ThresholdLegend => {
  const validMetricMax = Math.max(...(dataPoints?.map(item => item[1] || 0) || []))
  const validMetricMin = Math.min(...(dataPoints?.map(item => item[1] || 0) || []))

  const validMetricTotal =
    dataPoints?.reduce((sum, item) => {
      return (item[1] || 0) + sum
    }, 0) || 0
  const validMetricTotalLength = dataPoints?.length || 1

  const thresholdLegendData = {
    max: validMetricMax,
    min: validMetricMin,
    avg: validMetricTotal / validMetricTotalLength
  }

  return thresholdLegendData
}

export const sliMetricGraphConfig: Highcharts.Options = {
  xAxis: {
    gridLineWidth: 0,
    tickAmount: undefined,
    tickInterval: 14400000,
    showFirstLabel: true,
    showLastLabel: true
  },
  yAxis: {
    gridLineDashStyle: 'Solid'
  },
  chart: {
    height: 150
  }
}
