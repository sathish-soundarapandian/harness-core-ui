import React from 'react'
import Highcharts from 'highcharts'
import more from 'highcharts/highcharts-more'
import HighchartsReact from 'highcharts-react-official'
import { useStrings } from 'framework/strings'
import { getRadialChartOptions } from './RadialChart.utils'

interface PercentageChartProps {
  score?: number
  improvementScore?: number
  maxScore?: number
}
const RadialChart = (props: PercentageChartProps): JSX.Element => {
  const { score, improvementScore, maxScore } = props
  const { getString } = useStrings()
  return (
    <HighchartsReact
      highcharts={more(Highcharts)}
      options={getRadialChartOptions(score, maxScore, improvementScore, getString)}
    />
  )
}

export default RadialChart
