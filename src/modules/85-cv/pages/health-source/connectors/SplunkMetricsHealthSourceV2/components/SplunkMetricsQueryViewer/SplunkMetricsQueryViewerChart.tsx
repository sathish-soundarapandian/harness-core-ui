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
