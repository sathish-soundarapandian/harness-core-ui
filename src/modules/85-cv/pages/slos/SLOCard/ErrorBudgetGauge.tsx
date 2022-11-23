/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { merge } from 'lodash-es'
import Highcharts from 'highcharts'
import highchartsMore from 'highcharts/highcharts-more'
import solidGauge from 'highcharts/modules/solid-gauge'
import HighchartsReact from 'highcharts-react-official'
import { Utils } from '@harness/uicore'
import { Color } from '@harness/design-system'
interface GaugeChartProps {
  customChartOptions?: Highcharts.Options
}

highchartsMore(Highcharts)
solidGauge(Highcharts)

const getDefaultChartOptions = (): Highcharts.Options => ({
  chart: { type: 'solidgauge', height: 200, spacing: [20, 0, 0, 0], width: 175 },
  title: { text: '' },
  tooltip: { enabled: false },
  pane: {
    startAngle: -135,
    endAngle: 135,
    background: [
      {
        outerRadius: '115%',
        innerRadius: '88%',
        backgroundColor: Utils.getRealCSSColor(Color.GREY_100),
        borderWidth: 0,
        shape: 'arc'
      }
    ]
  },
  yAxis: { min: 0, max: 100, lineWidth: 0 },
  credits: { enabled: false },
  plotOptions: {
    solidgauge: { linecap: 'round', stickyTracking: false, rounded: true }
  },
  series: [
    {
      type: 'solidgauge',
      data: [
        {
          color: Utils.getRealCSSColor(Color.GREEN_500),
          radius: '115',
          innerRadius: '88%'
        }
      ],
      dataLabels: {
        enabled: true,
        useHTML: true,
        borderWidth: 0,
        y: 55,
        style: { fontWeight: '600', color: Utils.getRealCSSColor(Color.GREY_800) }
      }
    }
  ]
})

const ErrorBudgetGauge: React.FC<GaugeChartProps> = ({ customChartOptions }) => {
  const finalChartOptions = useMemo(() => merge(getDefaultChartOptions(), customChartOptions), [customChartOptions])

  return <HighchartsReact highcharts={Highcharts} options={finalChartOptions} />
}

export default ErrorBudgetGauge
