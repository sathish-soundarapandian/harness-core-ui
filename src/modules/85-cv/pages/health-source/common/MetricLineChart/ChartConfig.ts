/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import moment from 'moment'
export function chartsConfig(
  series: Highcharts.SeriesLineOptions[],
  chartConfig?: Highcharts.Options
): Highcharts.Options {
  return {
    chart: {
      backgroundColor: 'transparent',
      height: 200,
      type: 'line',
      zoomType: 'xy',
      spacing: [5, 2, 5, 2],
      ...(chartConfig?.chart ?? chartConfig?.chart)
    },
    credits: undefined,
    title: {
      text: ''
    },
    legend: {
      enabled: false
    },
    xAxis: {
      labels: {
        formatter: function () {
          return moment(this.value).format('h:mm a')
        }
      },
      lineWidth: 1,
      showFirstLabel: false,
      showLastLabel: false,
      tickLength: 5,
      tickAmount: 7,
      gridLineWidth: 1,
      gridLineDashStyle: 'Dash',
      title: {
        text: ''
      },
      ...(chartConfig?.xAxis ?? chartConfig?.xAxis)
    },
    yAxis: {
      lineWidth: 1,
      tickLength: 5,
      tickAmount: 5,
      showFirstLabel: false,
      showLastLabel: false,
      gridLineDashStyle: 'Dash',
      gridLineWidth: 1,
      title: {
        text: ''
      },
      ...(chartConfig?.yAxis ?? chartConfig?.yAxis)
    },
    plotOptions: {
      series: {
        stickyTracking: false,
        lineWidth: 2,
        turboThreshold: 50000
      },
      line: {
        marker: {
          enabled: false
        }
      }
    },
    tooltip: {
      formatter: function tooltipFormatter(this: any): string {
        const title = this.series?.name ? `<p>${this.series?.name}</p><br/>` : ''
        return `<section class="serviceGuardTimeSeriesTooltip">${title}<p>${moment(this.x).format(
          'M/D/YYYY h:m a'
        )}</p><br/><p>Value: ${this.y.toFixed(2)}</p></section>`
      },
      outside: true
    },
    subtitle: undefined,
    series
  }
}
