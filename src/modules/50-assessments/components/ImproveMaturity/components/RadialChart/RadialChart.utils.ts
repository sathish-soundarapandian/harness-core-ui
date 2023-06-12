import type Highcharts from 'highcharts'
import type { StringsMap } from 'stringTypes'
import { calculatePercentage } from '../../../utils'
import { ScoreColor } from './RadialChart.constants'

const getChartText = (score: number, maxScore: number, improvementScore: number): string => {
  return `
    <span style="font-size:40px;font-weight:bold;font-family:Inter;color:#4F5162">${calculatePercentage(
      score + improvementScore,
      maxScore
    )} %</span>
    <br>
    ${
      improvementScore > 0
        ? `<div style="display:flex;margin-top: 8px">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 15L12 9L16 15H8Z" fill="#4DC952"/>
      </svg>
      <span style="font-size:14px;font-family:Inter;color:#5FB34E"> ${calculatePercentage(
        improvementScore,
        maxScore
      )}%</span>
    </div>`
        : ''
    }
  `
}

export const getRadialChartOptions = (
  score = 0,
  maxScore = 1,
  improvementScore = 0,
  getString: (key: keyof StringsMap) => string
): Highcharts.Options => {
  return {
    chart: {
      renderTo: 'container',
      type: 'pie',
      margin: [0, 0, 0, 0],
      height: 200
    },
    credits: { enabled: false },
    title: {
      text: ''
    },
    subtitle: {
      useHTML: true,
      text: getChartText(score, maxScore, improvementScore),
      floating: true,
      verticalAlign: 'middle',
      y: 15
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
          {
            name: `${getString ? getString('assessments.currentScore') : ''} ${score}`,
            y: score,
            color: ScoreColor.YOUR_SCORE
          },
          {
            name: `${getString ? getString('assessments.increment') : ''} +${calculatePercentage(
              improvementScore,
              maxScore
            )}`,
            y: improvementScore,
            color: ScoreColor.IMPROVEMENT
          },
          { y: maxScore - (score + improvementScore), color: '#EFFBFF' }
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
