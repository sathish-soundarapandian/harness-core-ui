import type { TimeSeriesSampleDTO } from 'services/cv'
import { chartsConfig } from '../../../GCOMetricsHealthSource/GCOWidgetChartConfig'

export function transformSplunkMetricSampleData(sampleData?: TimeSeriesSampleDTO[]): Highcharts.Options {
  if (!sampleData?.length) {
    return {}
  }

  const data: Highcharts.SeriesLineOptions[] = []
  const option: Highcharts.SeriesLineOptions = {
    name: '',
    data: [],
    type: 'line',
    color: '#25A6F7'
  }

  for (const sample of sampleData) {
    if (sample?.timestamp && sample.metricValue) {
      option.data?.push([sample.timestamp, sample.metricValue])
    }

    data.push(option)
  }

  const transformedValue = chartsConfig(data)
  return transformedValue
}
