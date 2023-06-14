import React from 'react'
import { Layout, Button, ButtonVariation, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import type { CellProps, Renderer, UseExpandedRowProps } from 'react-table'
import type { QuestionMaturity } from 'services/assessments'
import { killEvent } from '@common/utils/eventUtils'
import { getSectionImage } from '../../../utils'
import css from './GroupRecommendationTable.module.scss'

export interface Sections {
  sectionText: string
  sectionId: string
}

export const getSections = (questionMaturityList: QuestionMaturity[]): Sections[] => {
  const sect = questionMaturityList.reduce(
    (acc: any, currentVal: QuestionMaturity) => ({
      ...acc,
      [currentVal.sectionId || '']: currentVal.sectionText
    }),
    {}
  )
  const sections: Sections[] = Object.keys(sect).map((sectionId: string) => ({
    sectionId,
    sectionText: sect[sectionId]
  }))
  return sections
}

export const ToggleAccordionCell: Renderer<{ row: UseExpandedRowProps<Sections> }> = ({ row }) => {
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

export const RenderSection: Renderer<CellProps<Sections>> = ({ row }) => {
  const sectionName = row.original?.sectionText || ''
  const sectionImage = getSectionImage(sectionName)
  return (
    <Layout.Horizontal flex={{ justifyContent: 'left', alignItems: 'center' }} margin={{ left: 'medium' }}>
      <img src={sectionImage} width="45" height="45" alt="" />
      <Text font={{ weight: 'bold', size: 'medium' }} color={Color.GREY_1000}>
        {sectionName}
      </Text>
    </Layout.Horizontal>
  )
}
