import type Highcharts from 'highcharts'
import type { SectionScore } from 'services/assessments'
import { calculatePercentage } from '../../../utils'

export const getSpiderChartOptions = (sectionScores: SectionScore[]): Highcharts.Options => {
  const categories = sectionScores.map(score => score.sectionText || score.sectionId || '')
  const data = sectionScores.map(score =>
    calculatePercentage(score.sectionScore?.selfScore?.score, score.sectionScore?.selfScore?.maxScore)
  )

  return {
    chart: {
      polar: true
    },
    credits: undefined,
    title: {
      text: ''
    },
    xAxis: {
      categories,
      tickmarkPlacement: 'on',
      lineWidth: 0
    },

    yAxis: {
      lineWidth: 0,
      min: 0,
      max: 100,
      tickInterval: 25
    },
    series: [
      {
        name: 'Performance',
        type: 'area',
        data,
        color: '#7D4DD3',
        pointPlacement: 'on',
        showInLegend: false,
        fillOpacity: 0.12,
        lineWidth: 0.75
      }
    ]
  }
}
