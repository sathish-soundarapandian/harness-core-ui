import { Checkbox, Container, Layout, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import React from 'react'
import type { CellProps, HeaderProps, Renderer } from 'react-table'
import { useStrings } from 'framework/strings'
import type { QuestionMaturity } from 'services/assessments'
import ImprovementImage from '@assessments/assets/EngineeringBenchmarks.svg'
import { killEvent } from '@common/utils/eventUtils'
import { getSectionImage } from '../../../utils'
import css from './FlatRecommendationTable.module.scss'

export const RenderHeaderCheckbox = (
  selectionState: 'CHECKED' | 'INDETERMINATE' | 'UNCHECKED',
  title: string,
  description: string,
  groupSelection?: (value: boolean, sectionId?: string) => void,
  sectionId?: string,
  harnessComponent?: string
): Renderer<HeaderProps<QuestionMaturity>> => {
  const header: Renderer<HeaderProps<QuestionMaturity>> = () => {
    return (
      <Container flex={{ justifyContent: 'flex-start', alignItems: 'flex-start' }}>
        {!harnessComponent && (
          <Checkbox
            checked={selectionState === 'CHECKED'}
            indeterminate={selectionState === 'INDETERMINATE'}
            className={css.noPadding}
            onChange={() => groupSelection && groupSelection(selectionState !== 'CHECKED', sectionId)}
            data-testid="header-checkbox"
          />
        )}
        <Container className={css.recommendationContainer} padding={{ left: 'medium' }}>
          <Text font={{ variation: FontVariation.TABLE_HEADERS }}>{title}</Text>
          {!harnessComponent && <Text font="small">{description}</Text>}
        </Container>
      </Container>
    )
  }
  return header
}

export const RenderHeader = (title: string): Renderer<HeaderProps<QuestionMaturity>> => {
  const header: Renderer<HeaderProps<QuestionMaturity>> = () => {
    return (
      <Text font={{ variation: FontVariation.TABLE_HEADERS }} padding={{ left: 'medium' }}>
        {title}
      </Text>
    )
  }
  return header
}

export const CheckboxCell = (
  onSelectionChange?: (questionId: string, sectionId: string, value: boolean) => void,
  harnessComponent?: string
): Renderer<CellProps<QuestionMaturity>> => {
  const cell: Renderer<CellProps<QuestionMaturity>> = ({ row }) => {
    return (
      <Container flex={{ justifyContent: 'flex-start', alignItems: 'flex-start' }} padding={{ left: 'small' }}>
        {!harnessComponent && (
          <Checkbox
            margin={{ top: 'small', left: 'small' }}
            checked={row?.original?.selected}
            className={css.noPadding}
            data-testid="row-checkbox"
            onClick={e => {
              killEvent(e)
              onSelectionChange &&
                onSelectionChange(
                  row?.original?.questionId || '',
                  row?.original?.sectionId || '',
                  !row?.original?.selected
                )
            }}
          />
        )}
        <Container className={css.recommendationContainer} padding={{ left: 'medium' }}>
          <Text font={{ variation: FontVariation.CARD_TITLE }}>{row.original.capability}</Text>
          <Text font="small" lineClamp={3}>
            {row.original.recommendation?.recommendationText}
          </Text>
        </Container>
      </Container>
    )
  }
  return cell
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
