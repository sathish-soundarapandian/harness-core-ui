import type Highcharts from 'highcharts'
import { merge } from 'lodash-es'

export const getScoreComparisonChartOptions = (
  {
    userScore,
    questionOrgScore,
    questionBenchMarkScore,
    questionMaxScore
  }: {
    userScore?: number
    questionOrgScore?: number
    questionBenchMarkScore?: number
    questionMaxScore?: number
  },
  options?: Highcharts.Options
): Highcharts.Options => {
  const defautOptions = {
    chart: {
      type: 'bar',
      spacing: [0, 0, 0, 0],
      height: 130,
      width: 500
    },
    credits: undefined,
    title: {
      text: ''
    },
    legend: {
      enabled: false
    },
    plotOptions: {
      series: {
        marker: {
          states: {
            hover: {
              enabled: false
            }
          },
          enabled: false,
          radius: 1
        }
      },
      bar: {
        pointWidth: 18,
        pointPadding: 0.1,
        dataLabels: {
          enabled: true, // Enable data labels
          format: '{y}' // Set the format of the data labels
        },
        states: {
          hover: {
            enabled: false // Disable the hover effect
          }
        }
      }
    },
    tooltip: {
      enabled: false
    },
    xAxis: {
      title: {
        text: ''
      },
      labels: {
        enabled: false
      },
      gridLineWidth: 0,
      lineWidth: 0,
      tickLength: 0,
      categories: ['Your Score', 'Company score', 'Benchmark', 'Maximum Score']
    },
    yAxis: {
      labels: { enabled: false },
      title: {
        text: ''
      },
      gridLineWidth: 0,
      lineWidth: 0,
      tickLength: 0
    },
    series: [
      {
        name: 'Your Score',
        data: [userScore],
        color: '#3DC7F6'
      },
      {
        name: 'Company score',
        data: [questionOrgScore],
        color: '#CDF4FE'
      },
      {
        name: 'Maximum Score',
        data: [questionMaxScore],
        color: '#C5E1A5'
      },
      {
        name: 'Benchmark',
        data: [questionBenchMarkScore],
        color: '#E8E8FF'
      }
    ]
  }

  const completeOptions = merge(defautOptions, options)
  return completeOptions
}
