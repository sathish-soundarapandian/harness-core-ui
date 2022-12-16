import type { SeriesLineOptions } from 'highcharts'
import type { TimeSeries } from 'services/cv'

export const getOptionsForChart = (timeSeriesData: TimeSeries[] | null): SeriesLineOptions[] => {
  let seriesData: SeriesLineOptions[] = []
  if (timeSeriesData?.some(el => el?.data?.length)) {
    seriesData = timeSeriesData.map(el => {
      const timeSeries = el?.data
      const updatedTimeSeries = timeSeries?.map(element => {
        return [element?.timestamp, element?.value]
      })
      return {
        name: el?.timeseriesName,
        data: updatedTimeSeries,
        type: 'line'
      }
    }) as SeriesLineOptions[]
  }
  return seriesData
}
