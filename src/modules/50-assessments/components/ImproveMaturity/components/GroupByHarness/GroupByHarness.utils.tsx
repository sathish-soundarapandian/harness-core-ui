import { Button, ButtonVariation, Container, Layout, Text } from '@harness/uicore'
import type { CellProps, Renderer, UseExpandedRowProps } from 'react-table'
import { Color, FontVariation } from '@harness/design-system'
import React from 'react'
import { killEvent } from '@common/utils/eventUtils'
import type { QuestionMaturity } from 'services/assessments'
import { StringKeys, useStrings } from 'framework/strings'
import css from './GroupByHarness.module.scss'

export interface ModuleCount {
  module: string
  count: number
}

export const getHarnessComponents = (questionMaturityList: QuestionMaturity[]): ModuleCount[] => {
  const moduleCount = questionMaturityList.reduce((acc: Record<string, number>, questionMaturity: QuestionMaturity) => {
    if (questionMaturity.recommendation?.harnessModule) {
      acc[questionMaturity.recommendation.harnessModule] = (acc[questionMaturity.recommendation.harnessModule] || 0) + 1
    }
    return acc
  }, {})

  return Object.keys(moduleCount).map((module: string) => ({
    module,
    count: moduleCount[module]
  }))
}

export const ToggleAccordionCell: Renderer<{ row: UseExpandedRowProps<ModuleCount> } & CellProps<ModuleCount>> = ({
  row
}) => {
  const { getString } = useStrings()
  const { module } = row.original
  return (
    <Layout.Horizontal onClick={killEvent}>
      <Button
        {...row.getToggleRowExpandedProps()}
        icon={row.isExpanded ? 'chevron-down' : 'chevron-right'}
        variation={ButtonVariation.ICON}
        iconProps={{ size: 19, color: Color.PRIMARY_7 }}
        className={css.toggleAccordion}
        margin={{ top: 'xsmall' }}
      />
      <Text className={css.toggleText} font={{ variation: FontVariation.FORM_TITLE }}>
        {getString(`assessments.modules.${module.toLowerCase()}` as StringKeys)}
      </Text>
    </Layout.Horizontal>
  )
}

export const RecommendationCell: Renderer<CellProps<ModuleCount>> = ({ row }) => {
  const { getString } = useStrings()
  const recommendationsCount = row?.original?.count || 0
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
        padding={{ left: 'small' }}
      >{`${recommendationsCount} ${getString('assessments.recommendations')}`}</Text>
    </Container>
  )
}
