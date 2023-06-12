import { Button, ButtonVariation, Container, Layout, Text } from '@harness/uicore'
import React from 'react'
import type { CellProps, Renderer, UseExpandedRowProps } from 'react-table'
import Highcharts from 'highcharts'
import { Color } from '@harness/design-system'
import HighchartsReact from 'highcharts-react-official'
import { killEvent } from '@common/utils/eventUtils'
import thumpsUpImage from '@assessments/assets/Thumpsup.svg'
import L3Image from '@assessments/assets/L3.svg'
import L2Image from '@assessments/assets/L2.svg'
import L1Image from '@assessments/assets/L1.svg'
import type { ScoreOverviewDTO, SectionScore } from 'services/assessments'
import { useStrings } from 'framework/strings'
import { calculatePercentage, getScoreComparisonChartOptions, getSectionImage } from '../../../utils'
import { SURVEY_CHART_OPTIONS } from './ResultTable.constants'
import css from './ResultTable.module.scss'

export const RenderCategory: Renderer<CellProps<SectionScore>> = ({ row }) => {
  const sectionName = row.original.sectionText
  const sectionImage = getSectionImage(sectionName)
  return (
    <Layout.Horizontal flex={{ justifyContent: 'left', alignItems: 'center' }}>
      <img src={sectionImage} width="30" height="30" alt="" />
      <Text padding={'medium'} font={{ weight: 'bold', size: 'medium' }} color={Color.GREY_600}>
        {sectionName}
      </Text>
    </Layout.Horizontal>
  )
}

export const RenderLevelForSection: Renderer<CellProps<SectionScore>> = ({ row }) => {
  const { getString } = useStrings()
  const level = row.original.sectionScore?.maturityLevel
  let renderLevelImage = L3Image
  switch (level) {
    case 'LEVEL_2':
      renderLevelImage = L2Image
      break
    case 'LEVEL_1':
      renderLevelImage = L1Image
      break
    default:
      renderLevelImage = L3Image
  }
  return (
    <Layout.Horizontal flex={{ justifyContent: 'left', alignItems: 'center' }}>
      <img src={renderLevelImage} width="42" height="42" alt="" />
      <Text padding={'medium'} font={{ weight: 'bold', size: 'medium' }} color={Color.GREY_900}>
        {`${getString('assessments.levelString')} ${level?.slice(-1)}`}
      </Text>
    </Layout.Horizontal>
  )
}

export const renderComparizionGraph = (sectionScore: ScoreOverviewDTO): JSX.Element => {
  const { benchmarkScore, organizationScore, selfScore } = sectionScore
  return (
    <Layout.Horizontal flex={{ justifyContent: 'left', alignItems: 'center' }}>
      <Layout.Vertical padding={{ top: 'small' }} width={120}>
        <Text className={css.scoreLabels}>{'Your score'}</Text>
        <Text className={css.scoreLabels}>{'Company score'}</Text>
        {benchmarkScore ? <Text className={css.scoreLabels}>{'Benchmark'}</Text> : null}
      </Layout.Vertical>
      <Container flex={{ alignItems: 'center' }}>
        <HighchartsReact
          highcharts={Highcharts}
          options={getScoreComparisonChartOptions(
            {
              userScore: calculatePercentage(selfScore?.score, selfScore?.maxScore),
              questionOrgScore: calculatePercentage(organizationScore?.score, organizationScore?.maxScore),
              questionBenchMarkScore: benchmarkScore
                ? calculatePercentage(benchmarkScore?.score, benchmarkScore?.maxScore)
                : undefined
            },
            SURVEY_CHART_OPTIONS
          )}
        />
      </Container>
    </Layout.Horizontal>
  )
}

export const RenderComparison: Renderer<CellProps<SectionScore>> = ({ row }) => {
  const data = row.original.sectionScore as ScoreOverviewDTO
  return renderComparizionGraph(data)
}

export const RenderRecommendations: Renderer<CellProps<SectionScore>> = ({ row }) => {
  const recommendationsCount = row.original.numRecommendations
  if (recommendationsCount && recommendationsCount > 0) {
    return (
      <Container
        flex={{ justifyContent: 'left', alignItems: 'center' }}
        background={Color.PRIMARY_1}
        className={css.recommendationContainer}
        margin={{ left: 'small' }}
      >
        <Text
          font={{ weight: 'semi-bold', size: 'normal' }}
          color={Color.PRIMARY_7}
          padding={{ left: 'xsmall' }}
        >{`${recommendationsCount} Recommendations`}</Text>
      </Container>
    )
  } else {
    return (
      <Layout.Horizontal padding={{ left: 'medium' }}>
        <img src={thumpsUpImage} width="24" height="24" alt="" />
        <Text padding={{ left: 'small' }}>{'You are at the highest level in this category'}</Text>
      </Layout.Horizontal>
    )
  }
}

export const ToggleAccordionCell: Renderer<{ row: UseExpandedRowProps<SectionScore> }> = ({ row }) => {
  return (
    <Layout.Horizontal onClick={killEvent}>
      <Button
        {...row.getToggleRowExpandedProps()}
        color={Color.GREY_600}
        icon={row.isExpanded ? 'chevron-down' : 'chevron-right'}
        variation={ButtonVariation.ICON}
        iconProps={{ size: 19 }}
        className={css.toggleAccordion}
      />
    </Layout.Horizontal>
  )
}
