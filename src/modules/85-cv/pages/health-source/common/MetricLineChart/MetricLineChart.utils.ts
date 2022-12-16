import { isEmpty } from 'lodash-es'
import { chartsConfig } from './ChartConfig'

export function getChartSeriesValues(
  series?: Highcharts.SeriesLineOptions[],
  options?: number[],
  chartConfig?: Highcharts.Options
): Highcharts.Options {
  return !isEmpty(series) && series
    ? chartsConfig(series, chartConfig)
    : chartsConfig(
        [
          {
            name: '',
            data: options,
            type: 'line'
          }
        ],
        chartConfig
      )
}
