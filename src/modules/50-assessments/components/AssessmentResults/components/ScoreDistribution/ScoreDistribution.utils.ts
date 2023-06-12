import type Highcharts from 'highcharts'
import type { SectionScore } from 'services/assessments'
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

export const getBarChart = (sectionScores: SectionScore[]): Highcharts.Options => {
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
        text: 'SDLC Categories'
      }
    },
    yAxis: {
      min: 0,
      max: 100,
      title: {
        text: 'scores in %'
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
        name: 'YOUR SCORE',
        type: 'column',
        color: '#3DC7F6',
        data: selfScores
      },
      {
        name: 'Company Score',
        type: 'column',
        color: '#FFA86B',
        data: organizationScores
      },
      {
        name: 'EXTERNAL BENCHMARK SCORE',
        type: 'column',
        color: '#FDD13B',
        data: benchmarkScores
      }
    ]
  }
}
