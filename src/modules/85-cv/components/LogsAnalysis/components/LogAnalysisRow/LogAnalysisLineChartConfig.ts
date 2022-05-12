/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Color } from '@harness/design-system'
import type { SeriesColumnOptions } from 'highcharts'

export default function getLogAnalysisLineChartOptions(series: SeriesColumnOptions[]): Highcharts.Options {
  return {
    chart: {
      type: 'column',
      backgroundColor: 'transparent',
      style: {
        fontFamily: 'var(--font-family)'
      }
    },
    credits: undefined,
    title: {
      text: ''
    },
    legend: {
      enabled: false
    },
    xAxis: {
      labels: { enabled: false },
      tickLength: 1,
      gridLineWidth: 0,
      min: 0.25,
      title: {
        text: ''
      },
      startOnTick: true,
      endOnTick: true
    },
    yAxis: {
      labels: { enabled: false },
      lineWidth: 0,
      tickLength: 0,
      gridLineWidth: 0,
      title: {
        text: ''
      }
    },
    plotOptions: {
      series: {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        pointWidth: 10
      },
      column: {},
      bar: {
        groupPadding: 0,
        pointPadding: 0,
        dataLabels: {
          enabled: true
        }
      }
    },
    tooltip: {
      outside: true,
      useHTML: true,
      formatter: function () {
        return `${this.y}`
      },
      backgroundColor: Color.WHITE,
      borderColor: Color.GREY_300,
      borderRadius: 10,
      shadow: {
        color: 'rgba(96, 97, 112, 0.56)'
      },
      shape: 'square'
    },
    subtitle: undefined,
    series
  }
}
