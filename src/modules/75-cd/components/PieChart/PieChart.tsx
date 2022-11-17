/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import HighchartsReact from 'highcharts-react-official'
import Highcharts from 'highcharts'
import { Layout, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { merge } from 'lodash-es'

interface PieChartItem {
  label: string
  value: number
  formattedValue?: string
  color?: Color
}

export interface PieChartProps {
  items: PieChartItem[]
  size: number
  options?: Highcharts.Options
  showLabels?: boolean
  showInRevOrder?: boolean
  customCls?: string
  labelContainerStyles?: string
  labelStyles?: string
  labelsContent?: React.ReactElement
}

const getParsedOptions = (defaultOptions: Highcharts.Options, options: Highcharts.Options): Highcharts.Options =>
  merge(defaultOptions, options)

export const PieChart: React.FC<PieChartProps> = props => {
  const {
    size,
    items,
    options = {},
    showLabels = true,
    labelContainerStyles = '',
    labelStyles = '',
    showInRevOrder,
    customCls,
    labelsContent
  } = props
  const defaultOptions: Highcharts.Options = useMemo(
    () => ({
      chart: {
        type: 'pie',
        width: size,
        height: size,
        margin: [0, 0, 0, 0],
        spacing: [0, 0, 0, 0]
      },
      title: {
        text: ''
      },
      credits: { enabled: false },
      tooltip: {
        useHTML: true,
        padding: 4,
        outside: true,
        formatter: function () {
          const { point } = this as { point: { name: string; y: number } }
          return `${point.name}: ${point.y}`
        }
      },
      plotOptions: {
        pie: {
          size,
          dataLabels: {
            enabled: false
          },
          states: {
            hover: {
              halo: null
            }
          }
        }
      },
      series: [
        {
          animation: false,
          type: 'pie',
          colorByPoint: true,
          data: items.map(item => ({
            name: item.label,
            y: item.value,
            color: item.color
          })),
          cursor: 'pointer'
        }
      ]
    }),
    [size, items]
  )
  const parsedOptions = useMemo(() => getParsedOptions(defaultOptions, options), [defaultOptions, options])
  const className = showInRevOrder ? customCls : ''
  const labelHtml = labelsContent ? (
    labelsContent
  ) : (
    <Layout.Vertical
      flex={{ alignItems: 'flex-end' }}
      height="100%"
      padding={{ top: 'xsmall', bottom: 'xsmall', right: 'large' }}
      className={labelContainerStyles}
    >
      {items.map(({ label, formattedValue, value }) => (
        <Text font={{ size: 'xsmall' }} color={Color.GREY_500} className={labelStyles} key={label}>{`${label} (${
          formattedValue ? formattedValue : value
        })`}</Text>
      ))}
    </Layout.Vertical>
  )
  return (
    <Layout.Horizontal
      flex={{ align: 'center-center', distribution: 'space-between' }}
      height={'100%'}
      className={className}
    >
      {showLabels ? labelHtml : <></>}
      <HighchartsReact highcharts={Highcharts} options={parsedOptions}></HighchartsReact>
    </Layout.Horizontal>
  )
}
