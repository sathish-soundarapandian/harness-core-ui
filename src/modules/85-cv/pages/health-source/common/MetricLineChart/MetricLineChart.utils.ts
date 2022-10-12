import { isEmpty } from 'lodash-es'
import { chartsConfig } from './ChartConfig'

export function getChartSeriesValues(series?: Highcharts.SeriesLineOptions[], options?: number[]): Highcharts.Options {
  return !isEmpty(series) && series
    ? chartsConfig(series)
    : chartsConfig([
        {
          name: '',
          data: options,
          type: 'line'
        }
      ])
}
