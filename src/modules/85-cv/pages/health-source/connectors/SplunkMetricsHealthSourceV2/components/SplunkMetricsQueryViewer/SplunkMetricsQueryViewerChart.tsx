/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import HighchartsReact from 'highcharts-react-official'
import Highcharts from 'highcharts'
import type { TimeSeriesSampleDTO } from 'services/cv'
import { transformSplunkMetricSampleData } from './SplunkMetricQueryViewerChart.utils'

interface SplunkMetricQueryChartProps {
  data?: TimeSeriesSampleDTO[]
}

export default function SplunkMetricsQueryViewerChart(props: SplunkMetricQueryChartProps): React.ReactElement | null {
  const { data } = props

  const highchartsOptions = useMemo(() => {
    return transformSplunkMetricSampleData(data)
  }, [data])

  if (!data?.length) {
    return null
  }

  return <HighchartsReact highcharts={Highcharts} options={highchartsOptions} />
}
