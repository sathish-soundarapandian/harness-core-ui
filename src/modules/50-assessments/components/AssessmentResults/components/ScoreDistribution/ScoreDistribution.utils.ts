import type Highcharts from 'highcharts'
import type { SectionScore } from 'services/assessments'
import type { StringsMap } from 'stringTypes'
import { calculatePercentage } from '../../../utils'

const parseSectionScores = (
  sectionScores: SectionScore[]
): {
  selfScores: number[]
  organizationScores: number[]
  benchmarkScores: number[]
  sections: string[]
} => {
  const selfScores: number[] = []
  const organizationScores: number[] = []
  const benchmarkScores: number[] = []
  const sections: string[] = []
  sectionScores.forEach((sectionScore: SectionScore) => {
    sections.push(sectionScore.sectionText || '')
    selfScores.push(
      calculatePercentage(sectionScore.sectionScore?.selfScore?.score, sectionScore.sectionScore?.selfScore?.maxScore)
    )
    organizationScores.push(
      calculatePercentage(
        sectionScore.sectionScore?.organizationScore?.score,
        sectionScore.sectionScore?.organizationScore?.maxScore
      )
    )
    benchmarkScores.push(
      calculatePercentage(
        sectionScore.sectionScore?.benchmarkScore?.score,
        sectionScore.sectionScore?.benchmarkScore?.maxScore
      )
    )
  })
  return {
    selfScores,
    organizationScores,
    benchmarkScores,
    sections
  }
}

export const getBarChart = (
  sectionScores: SectionScore[],
  getString: (key: keyof StringsMap) => string
): Highcharts.Options => {
  const { selfScores, organizationScores, benchmarkScores, sections } = parseSectionScores(sectionScores)
  return {
    chart: {
      type: 'column',
      spacing: [10, 0, 0, 0]
    },
    credits: undefined,
    title: {
      text: ''
    },
    xAxis: {
      categories: sections,
      crosshair: true,
      title: {
        text: getString('assessments.sdlcCategories').toUpperCase()
      }
    },
    yAxis: {
      min: 0,
      max: 100,
      title: {
        text: getString('assessments.scoresInPercent').toUpperCase()
      }
    },
    plotOptions: {
      column: {
        pointWidth: 10,
        pointPadding: 0.2,
        enableMouseTracking: false,
        borderWidth: 0
      }
    },
    series: [
      {
        name: getString('assessments.yourScore').toUpperCase(),
        type: 'column',
        color: '#3DC7F6',
        data: selfScores
      },
      {
        name: getString('assessments.companyScore').toUpperCase(),
        type: 'column',
        color: '#FFA86B',
        data: organizationScores
      },
      {
        name: getString('assessments.externalBenchmarkScore').toUpperCase(),
        type: 'column',
        color: '#FDD13B',
        data: benchmarkScores
      }
    ]
  }
}
