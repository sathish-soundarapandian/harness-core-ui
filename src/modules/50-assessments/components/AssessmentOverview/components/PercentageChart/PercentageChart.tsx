import Highcharts from 'highcharts'
import more from 'highcharts/highcharts-more'
import HighchartsReact from 'highcharts-react-official'
import React from 'react'
import { getPercentageChartOptions } from './PercentageChart.utils'

interface PercentageChartProps {
  score?: number
  maxScore?: number
}
const PercentageChart = (props: PercentageChartProps): JSX.Element => {
  const { score, maxScore } = props
  return <HighchartsReact highcharts={more(Highcharts)} options={getPercentageChartOptions(score, maxScore)} />
}

export default PercentageChart
