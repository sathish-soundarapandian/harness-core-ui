import { getScoreComparisonChartOptions } from '../AssessmentResults.utils'

describe('getScoreComparisonChartOptions', () => {
  test('overrides default chart options with provided options', () => {
    const options = getScoreComparisonChartOptions(
      {
        userScore: 50,
        questionOrgScore: 60,
        questionBenchMarkScore: 70,
        questionMaxScore: 80
      },
      {
        chart: {
          height: 200
        },
        series: [
          {
            name: 'Test Score',
            // eslint-disable-next-line
            // @ts-ignore
            data: [90],
            color: '#ff0000'
          }
        ]
      }
    )

    expect(options).toBeDefined()
    expect(options.series).toHaveLength(4)
    expect(options.chart?.height).toBe(200)
    expect(options?.series?.[0]?.name).toBe('Test Score')
    expect(options?.series?.[0].color).toBe('#ff0000')
  })

  test('sets default values if some arguments are missing', () => {
    const options = getScoreComparisonChartOptions({ userScore: 50 })
    const { series = [] } = options
    expect(options).toBeDefined()
    expect(series).toHaveLength(4)
  })
})
