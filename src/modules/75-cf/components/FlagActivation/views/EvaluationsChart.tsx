/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import HighchartsReact from 'highcharts-react-official'
import type { PlotOptions } from 'highcharts';
import Highcharts from 'highcharts'
import { clone, merge } from 'lodash-es'

const chartDefaultOptions: Highcharts.Options = {
  chart: {
    type: 'column'
  },
  legend: {
    layout: 'vertical',
    align: 'left',
    verticalAlign: 'top',
    x: 80,
    y: 40,
    floating: true,
    borderWidth: 1
  },
  xAxis: {
    crosshair: {
      width: 2,
      dashStyle: 'ShortDash',
      color: '#0092E4',
      zIndex: 10
    },
    tickmarkPlacement: 'on',
    startOnTick: true,
    plotLines: [
      {
        value: -1,
        width: 1,
        color: '#D9DAE5',
        zIndex: 10
      }
    ]
  },
  yAxis: {
    title: undefined,
    gridLineColor: 'transparent'
  },
  tooltip: {
    // shared: true,
    useHTML: true
    // Custom tooltip will be implemented with https://harness.atlassian.net/browse/FFM-802
    // formatter: function formatter(): string {
    //   const th = this as any // eslint-disable-line
    //   return th.points[0]?.point?.series?.userOptions?.tooltips?.[th.x]
    // },
    // hideDelay: 1500,
    // style: {
    //   pointerEvents: 'auto'
    // }
  },
  credits: {
    enabled: false
  },
  plotOptions: {
    column: {
      stacking: 'normal',
      dataLabels: {
        enabled: false
      },
      borderColor: undefined
    }
  }
}

export const EvaluationsChart: React.FC<{ series: PlotOptions; categories: string[]; title: string }> = ({
  series,
  categories,
  title
}) => {
  const parsedOptions = useMemo(
    () => merge(clone(chartDefaultOptions), { title: { text: title }, series, xAxis: { categories } }),
    [series, categories, title]
  )
  return <HighchartsReact highcharts={Highcharts} options={parsedOptions} />
}
