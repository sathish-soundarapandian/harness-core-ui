/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import moment from 'moment'
import { minBy, maxBy } from 'lodash-es'
import type Highcharts from 'highcharts'
import { Utils } from '@harness/uicore'
import { Color } from '@harness/design-system'
import type { Point, ServiceLevelIndicatorSpec, TimeGraphResponse } from 'services/cv'
import { SLIEventTypes, SLIMetricTypes } from '../CVCreateSLOV2/CVCreateSLOV2.types'
import type { GetMetricTitleAndLoadingProps, GetMetricTitleAndLoadingValues } from './SLOTargetChart.types'

const MILLISECONDS_PER_HOUR = 1000 * 60 * 60 * 4

export const getDefaultChartOptions = (): Highcharts.Options => ({
  chart: { spacing: [20, 0, 20, 0] },
  xAxis: {
    tickInterval: MILLISECONDS_PER_HOUR,
    allowDecimals: false,
    type: 'datetime',
    labels: {
      formatter: function () {
        return moment(this.value).format('h:mm A')
      }
    },
    crosshair: {
      zIndex: 7
    }
  },
  yAxis: {
    labels: {
      formatter: function () {
        return `${this.value}%`
      }
    }
  },
  tooltip: {
    enabled: true,
    useHTML: true,
    padding: 0,
    borderWidth: 0,
    backgroundColor: 'white',
    formatter: function () {
      return `
        <div style="padding: 8px; background-color: white">
          <p style="color: var(--grey-400); font-weight: 500; font-size: 10px">
            ${moment(new Date(this.x)).format('dddd, lll')}
          </p>
          <p style="font-size: 10px" >${this.y.toFixed(2)}%</p>
        </div>
      `
    }
  },
  plotOptions: {
    area: {
      color: Utils.getRealCSSColor(Color.PRIMARY_3),
      marker: {
        enabled: false
      }
    }
  }
})

export const getDataPointsWithMinMaxXLimit = (
  data: Point[]
): {
  dataPoints: number[][]
  minXLimit: number
  maxXLimit: number
} => {
  const divider = 10
  const dataPoints = data.map(point => [Number(point.timestamp) || 0, Number(point.value) || 0])

  const minPoint = minBy(dataPoints, point => point[1]) ?? [0, 0]
  const maxPoint = maxBy(dataPoints, point => point[1]) ?? [0, 0]

  const minValue = Math.floor(minPoint[1])
  const maxValue = Math.ceil(maxPoint[1])

  const minValueReminder = minValue % divider
  const maxValueReminder = maxValue % divider

  const minXLimit = minValue - minValueReminder
  const maxXLimit = maxValueReminder ? maxValue + divider - maxValueReminder : maxValue

  return {
    dataPoints,
    minXLimit: minXLimit === maxXLimit ? minXLimit - divider : minXLimit,
    maxXLimit
  }
}

export const getSLIGraphData = ({
  sliGraphData,
  isRatioBased,
  goodRequestMetric,
  validRequestMetric,
  SLIMetricType
}: {
  sliGraphData?: TimeGraphResponse
  isRatioBased: boolean
  goodRequestMetric?: string
  validRequestMetric: string
  SLIMetricType?: ServiceLevelIndicatorSpec['type']
}): TimeGraphResponse | undefined => {
  let areaChartData = sliGraphData
  if (isRatioBased) {
    if (!(Boolean(goodRequestMetric) && Boolean(validRequestMetric))) {
      areaChartData = undefined
    }
  } else if (SLIMetricType === SLIMetricTypes.THRESHOLD) {
    if (!validRequestMetric) {
      areaChartData = undefined
    }
  }
  return areaChartData
}

export const getMetricAndAreaChartCustomProps = (
  isRatioBased: boolean,
  goodRequestMetric: string | undefined,
  validRequestMetric: string
): {
  showSLIAreaChart: boolean
  validRequestGraphColor?:
    | {
        graphColor: string
      }
    | {
        graphColor?: undefined
      }
} => {
  const showSLIAreaChart = isRatioBased
    ? Boolean(goodRequestMetric) || Boolean(validRequestMetric)
    : Boolean(validRequestMetric)

  const validRequestGraphColor = isRatioBased ? { graphColor: Utils.getRealCSSColor(Color.MAGENTA_800) } : {}
  return { showSLIAreaChart, validRequestGraphColor }
}

export const getMetricTitleAndLoading = ({
  getString,
  eventType,
  metricGraphs,
  goodRequestMetric,
  validRequestMetric,
  metricLoading,
  activeGoodMetric,
  activeValidMetric
}: GetMetricTitleAndLoadingProps): GetMetricTitleAndLoadingValues => {
  const goodOrBadRequestMetricLabel =
    eventType === SLIEventTypes.BAD
      ? getString('cv.slos.slis.ratioMetricType.badRequestsMetrics')
      : getString('cv.slos.slis.ratioMetricType.goodRequestsMetrics')

  const goodMetricHasData = metricGraphs?.[goodRequestMetric || '']?.dataPoints
  const validMetricHasData = metricGraphs?.[validRequestMetric || '']?.dataPoints
  const goodRequestMetricLoading = !goodMetricHasData && metricLoading
  const validRequestMetricLoading = !validMetricHasData && metricLoading
  const goodRequestMetricTitle = `${goodOrBadRequestMetricLabel} ( ${activeGoodMetric?.label || goodRequestMetric} )`
  const validRequestMetricTitle = `${getString('cv.slos.slis.ratioMetricType.validRequestsMetrics')} ( ${
    activeValidMetric?.label || validRequestMetric
  } )`
  const metricPercentageGraphTitle = `${
    eventType === SLIEventTypes.BAD
      ? getString('cv.slos.slis.ratioMetricType.badRequestsByValidRequest')
      : getString('cv.slos.slis.ratioMetricType.goodRequestsByValidRequest')
  } ( ${activeGoodMetric?.label || goodRequestMetric} / ${activeValidMetric?.label || validRequestMetric} )`
  return {
    goodRequestMetricLoading,
    goodRequestMetricTitle,
    validRequestMetricLoading,
    validRequestMetricTitle,
    metricPercentageGraphTitle
  }
}
