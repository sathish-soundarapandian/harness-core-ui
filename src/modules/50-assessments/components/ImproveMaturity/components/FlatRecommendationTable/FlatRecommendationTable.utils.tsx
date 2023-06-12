import { Container, Layout, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import React from 'react'
import type { CellProps, Renderer } from 'react-table'
import { useStrings } from 'framework/strings'
import type { QuestionMaturity } from 'services/assessments'
import ImprovementImage from '@assessments/assets/EngineeringBenchmarks.svg'
import { getSectionImage } from '../../../utils'
import css from './FlatRecommendationTable.module.scss'

export const RenderRecommendation: Renderer<CellProps<QuestionMaturity>> = ({ row }) => {
  return (
    <Container className={css.recommendationContainer}>
      <Text font={{ weight: 'bold' }} color={Color.GREY_1000} margin={{ bottom: 'small' }}>
        {row.original.capability}
      </Text>
      <Text font="small" lineClamp={3}>
        {row.original.recommendation?.recommendationText}
      </Text>
    </Container>
  )
}
export const RenderCategory: Renderer<CellProps<QuestionMaturity>> = ({ row }) => {
  const sectionName = row?.original?.sectionText || row?.original?.sectionId || ''
  const sectionImage = getSectionImage(sectionName)
  return (
    <Layout.Horizontal flex={{ justifyContent: 'left', alignItems: 'center' }} margin={{ left: 'medium' }}>
      <img src={sectionImage} width="30" height="30" alt="" />
      <Text padding={'medium'} font={{ weight: 'bold', size: 'medium' }} color={Color.GREY_600}>
        {sectionName}
      </Text>
    </Layout.Horizontal>
  )
}

export const RenderProjection: Renderer<CellProps<QuestionMaturity>> = ({ row }) => {
  const { getString } = useStrings()
  const { currentScore, projectedScore } = row?.original || {}

  return (
    <Layout.Horizontal flex={{ justifyContent: 'left', alignItems: 'center' }} padding={{ right: 'medum' }}>
      <Layout.Vertical margin="medium">
        <Text font={{ size: 'medium', weight: 'bold' }} margin={{ bottom: 'medium' }}>
          {currentScore}
        </Text>
        <Text margin={{ bottom: 'medium' }}>{getString('assessments.currentScore')}</Text>
        <Text>{`${getString('assessments.levelString')} 2`}</Text>
      </Layout.Vertical>
      <img src={ImprovementImage} width="42" height="42" alt="" className={css.iconMargin} />
      <Layout.Vertical margin="medium">
        <Text font={{ size: 'medium', weight: 'bold' }} margin={{ bottom: 'medium' }}>
          {projectedScore}
        </Text>
        <Text margin={{ bottom: 'medium' }}>{getString('assessments.projectedScore')}</Text>
        <Text>{`${getString('assessments.levelString')} 3`}</Text>
      </Layout.Vertical>
    </Layout.Horizontal>
  )
}
