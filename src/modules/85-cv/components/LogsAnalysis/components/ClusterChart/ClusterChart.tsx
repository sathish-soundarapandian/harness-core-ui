/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import HighchartsReact from 'highcharts-react-official'
import Highcharts from 'highcharts'
import { Container } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { chartOptions, mapRisk } from './ClusterChart.utils'
import type { ClusterChartProps } from './ClusterChart.types'

export default function ClusterChart({ data }: ClusterChartProps): JSX.Element {
  const { getString } = useStrings()
  const chartConfig = useMemo(() => {
    const dataToRender = data.length > 1000 ? data.slice(0, 1000) : data
    return chartOptions(
      [
        {
          type: 'scatter',
          marker: {
            radius: 8,
            symbol: 'circle'
          },
          data: dataToRender.map(val =>
            Object.assign(
              {},
              {
                x: val.x,
                y: val.y,
                message: val.text,
                hostname: val.hostName
              },
              mapRisk(val.risk)
            )
          )
        }
      ],
      getString
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])
  return (
    <Container padding="medium">
      <HighchartsReact highcharts={Highcharts} options={chartConfig} />
    </Container>
  )
}
