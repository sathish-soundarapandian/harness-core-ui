/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SLIOnboardingGraphs } from 'services/cv'
import type { ThresholdLegend, RatioLegend } from './SLIMetricChartLegend.types'

export const legendSliMetricChart = (
  metricGraphData: SLIOnboardingGraphs['metricGraphs']
): ThresholdLegend | RatioLegend => {
  const metricKeys = Object.keys(metricGraphData || {})
  const validMetricMax = Math.max(...(metricGraphData?.[metricKeys[0]]?.dataPoints?.map(item => item.value || 0) || []))
  const validMetricMin = Math.min(...(metricGraphData?.[metricKeys[0]]?.dataPoints?.map(item => item.value || 0) || []))
  const validMetricTotal =
    metricGraphData?.[metricKeys[0]]?.dataPoints?.reduce((sum, item) => {
      return (item?.value || 0) + sum
    }, 0) || 0
  const validMetricTotalLength = metricGraphData?.[metricKeys[0]]?.dataPoints?.length || 1
  const goodMetricTotal =
    metricGraphData?.[metricKeys[1]]?.dataPoints?.reduce((sum, item) => {
      return (item?.value || 0) + sum
    }, 0) || 0
  const goodMetricTotalLength = metricGraphData?.[metricKeys[0]]?.dataPoints?.length || 1

  const thresholdLegendData = {
    max: validMetricMax,
    min: validMetricMin,
    avg: validMetricTotal / validMetricTotalLength
  }
  const ratioLegendData = {
    goodMetric: goodMetricTotal / goodMetricTotalLength,
    validMetric: validMetricTotal / validMetricTotalLength
  }

  return metricKeys.length > 1 ? ratioLegendData : thresholdLegendData
}
