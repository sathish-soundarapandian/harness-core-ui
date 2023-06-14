import type Highcharts from 'highcharts'
import { calculatePercentage } from '../../../utils'
import { ScoreColor } from './PercentageChart.constants'

const getChartColor = (score: number, maxScore: number): string => {
  const avg = calculatePercentage(score, maxScore)
  if (avg < 40) return ScoreColor.BAD
  if (avg < 80) return ScoreColor.AVERAGE
  return ScoreColor.GOOD
}

const getChartText = (score: number, maxScore: number): string => {
  return `
    <span style="font-size:40px;font-weight:bold;font-family:Inter;color:#4F5162">${calculatePercentage(
      score,
      maxScore
    )}%</span>
  `
}

export const getPercentageChartOptions = (score = 0, maxScore = 1): Highcharts.Options => {
  return {
    chart: {
      renderTo: 'container',
      type: 'pie',
      margin: [0, 0, 0, 0],
      height: 200
    },
    credits: undefined,
    title: {
      text: ''
    },
    subtitle: {
      useHTML: true,
      text: getChartText(score, maxScore),
      floating: true,
      verticalAlign: 'middle'
    },
    plotOptions: {
      pie: {
        shadow: false,
        enableMouseTracking: false
      }
    },
    series: [
      {
        name: 'Browsers',
        type: 'pie',
        data: [
          { y: score, color: getChartColor(score, maxScore) },
          { y: maxScore - score, color: '#EFFBFF' }
        ],
        size: '100%',
        innerSize: '80%',
        dataLabels: {
          enabled: false
        }
      }
    ]
  }
}
