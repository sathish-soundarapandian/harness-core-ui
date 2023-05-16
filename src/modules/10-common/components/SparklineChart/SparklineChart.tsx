/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import HighchartsReact from 'highcharts-react-official'
import type { SeriesLineOptions } from 'highcharts';
import Highcharts from 'highcharts'
import { merge, noop } from 'lodash-es'
import cx from 'classnames'

import css from './Sparkline.module.scss'

export interface SparklineChartProps {
  title?: string
  data: SeriesLineOptions['data']
  options?: Highcharts.Options
  sparklineChartContainerStyles?: string
  titleStyles?: string
  onClick?: () => void
}

const getSparklineDefaultOptions = (
  data: SparklineChartProps['data'],
  isTitlePresent: boolean
): Highcharts.Options => ({
  title: {
    text: ''
  },
  credits: {
    enabled: false
  },
  xAxis: {
    visible: false,
    startOnTick: false,
    endOnTick: false
  },
  yAxis: {
    visible: false,
    startOnTick: false,
    endOnTick: false
  },
  legend: {
    enabled: false
  },
  series: [
    {
      name: '',
      type: 'line',
      data
    }
  ],
  tooltip: {
    enabled: false
  },
  plotOptions: {
    series: {
      animation: false,
      lineWidth: 1.5,
      color: 'var(--primary-6)',
      shadow: false,
      marker: {
        enabled: false
      },
      enableMouseTracking: false
    }
  },
  chart: { backgroundColor: '', width: 100, height: 54, margin: [isTitlePresent ? 24 : 10, 6, 10, 6] }
})

const getParsedOptions = (defaultOptions: Highcharts.Options, options: Highcharts.Options): Highcharts.Options =>
  merge(defaultOptions, options)

export const SparklineChart: React.FC<SparklineChartProps> = props => {
  const { title, data, options = {}, sparklineChartContainerStyles = '', titleStyles = '', onClick } = props
  const defaultOptions = useMemo(() => getSparklineDefaultOptions(data, !!title), [data, title])
  const parsedOptions = useMemo(() => getParsedOptions(defaultOptions, options), [defaultOptions, options])
  return (
    <div
      className={cx(css.sparklineChartContainer, sparklineChartContainerStyles, { [css.hover]: onClick })}
      onClick={onClick || noop}
    >
      {title ? <div className={cx(css.title, titleStyles)}>{title}</div> : <></>}
      <HighchartsReact highcharts={Highcharts} options={parsedOptions} />
    </div>
  )
}
