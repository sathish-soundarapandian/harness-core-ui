/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { merge } from 'lodash-es'

import HighchartsReact from 'highcharts-react-official'
import type { SeriesColumnOptions, SeriesOptionsType } from 'highcharts';
import Highcharts from 'highcharts'

type DataType = Omit<SeriesColumnOptions, 'type'>[]

const getDefaultChartOptions = (seriesData: DataType): Highcharts.Options => ({
  chart: {
    type: 'area',
    spacing: [25, 25, 25, 25]
  },
  title: {
    text: ''
  },
  xAxis: {
    labels: {
      formatter: function () {
        return `${this.pos + 1}`
      },
      style: {
        fontSize: 'var(--font-size-xsmall)',
        color: 'var(--grey-400)'
      }
    },
    tickInterval: 1
  },
  credits: {
    enabled: false
  },
  legend: {
    maxHeight: 80,
    itemStyle: {
      color: 'var(--grey-500)',
      fontSize: 'var(--font-size-small)',
      fontWeight: '500',
      textOverflow: 'ellipsis'
    }
  },
  yAxis: {
    min: 0,
    gridLineWidth: 1,
    gridLineColor: 'var(--grey-200)',
    title: {
      text: ''
    },
    labels: {
      style: {
        fontSize: 'var(--font-size-xsmall)',
        color: 'var(--grey-400)'
      }
    },
    stackLabels: {
      enabled: false,
      style: {
        fontWeight: 'bold'
      }
    }
  },
  plotOptions: {
    area: {
      connectNulls: true,
      fillOpacity: 0.85,
      lineWidth: 1,
      events: {
        legendItemClick: function () {
          return false
        }
      }
    }
  },
  series: seriesData as SeriesOptionsType[]
})

export interface TimeSeriesAreaChartProps {
  customChartOptions?: Highcharts.Options
  seriesData?: DataType
}

export const TimeSeriesAreaChart: React.FC<TimeSeriesAreaChartProps> = ({
  customChartOptions = {},
  seriesData = []
}) => {
  const defaultChartOptions = React.useMemo(() => getDefaultChartOptions(seriesData), [seriesData])
  const finalChartOptions = React.useMemo(
    () => merge(defaultChartOptions, customChartOptions),
    [defaultChartOptions, customChartOptions]
  )
  return <HighchartsReact highcharts={Highcharts} options={finalChartOptions} />
}
