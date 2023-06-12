import { calculatePercentage } from '@assessments/components/utils'
import type { StringsMap } from 'framework/strings/StringsContext'

export const getStackChart = (
  score: number,
  maxScore: number,
  improvementScore: number,
  companyScore: number,
  benchmarkScore: number,
  getString: (key: keyof StringsMap) => string
): Highcharts.Options => {
  return {
    chart: {
      type: 'column',
      spacing: [0, 0, 0, 0]
    },
    credits: undefined,
    title: {
      text: ''
    },
    xAxis: {
      categories: [
        `${getString('assessments.yourScore')} ${calculatePercentage(score + improvementScore, maxScore)}%`,
        `${getString('assessments.companyScore')} ${calculatePercentage(companyScore, maxScore)}%`,
        `${getString('assessments.benchmarkScore')} ${calculatePercentage(benchmarkScore, maxScore)}%`
      ]
    },
    yAxis: {
      min: 0,
      title: {
        text: ''
      },
      visible: false
    },
    legend: {
      enabled: false
    },
    plotOptions: {
      column: {
        pointWidth: 24,
        stacking: 'normal',
        enableMouseTracking: false,
        dataLabels: {
          enabled: false
        }
      }
    },
    series: [
      {
        type: 'column',
        data: [improvementScore],
        color: '#4DC952'
      },
      {
        data: [score],
        type: 'column',
        color: '#00ADE4'
      },
      {
        data: [0, companyScore],
        type: 'column',
        color: '#FFA86B'
      },
      {
        data: [0, 0, benchmarkScore],
        type: 'column',
        color: '#FCB519'
      }
    ]
  }
}
