import { TableV2 } from '@harness/uicore'
import React, { useCallback, useMemo } from 'react'
import type { QuestionMaturity } from 'services/assessments'
import { useStrings } from 'framework/strings'
import {
  CheckboxCell,
  RenderCategory,
  RenderHeader,
  RenderHeaderCheckbox,
  RenderProjection
} from './FlatRecommendationTable.utils'
import HarnessRecommendation from '../HarnessRecommendation/HarnessRecommendation'
import css from './FlatRecommendationTable.module.scss'

interface CapabilitiesContainerProps {
  questionMaturityList: QuestionMaturity[]
  onSelectionChange?: (questionId: string, sectionId: string, value: boolean) => void
  groupSelection?: (value: boolean, sectionId?: string) => void
  sectionId?: string
  harnessComponent?: string
}

const FlatRecommendationTable = ({
  questionMaturityList,
  onSelectionChange,
  groupSelection,
  sectionId,
  harnessComponent
}: CapabilitiesContainerProps): JSX.Element => {
  const { getString } = useStrings()
  const renderRowSubComponent = useCallback(({ row }) => <HarnessRecommendation row={row} />, [])

  const selectionState: 'CHECKED' | 'INDETERMINATE' | 'UNCHECKED' = useMemo(() => {
    const selected = questionMaturityList.filter(quest => quest.selected).length
    const total = questionMaturityList.length
    if (selected === 0) return 'UNCHECKED'
    if (selected === total) return 'CHECKED'
    return 'INDETERMINATE'
  }, [questionMaturityList])

  const selectedRows = useMemo(
    () =>
      harnessComponent
        ? {}
        : questionMaturityList.reduce((acc: Record<string, boolean>, question: QuestionMaturity, currentIndex) => {
            if (question.selected) {
              acc = {
                ...acc,
                [currentIndex.toString()]: true
              }
            }
            return acc
          }, {}),
    [questionMaturityList, harnessComponent]
  )

  const columns = useMemo(
    () => [
      {
        Header: RenderHeaderCheckbox(
          selectionState,
          getString('assessments.recommendations').toUpperCase(),
          getString('assessments.improveMaturityBySelection'),
          groupSelection,
          sectionId
        ),
        id: 'rowSelect',
        Cell: CheckboxCell(onSelectionChange),
        disableSortBy: true,
        width: sectionId ? '60%' : '40%'
      },
      {
        Header: RenderHeader(getString('common.category').toUpperCase()),
        id: 'category',
        Cell: RenderCategory,
        disableSortBy: true,
        width: '36%'
      },
      {
        Header: RenderHeader(getString('assessments.projectedScoreWithRec').toUpperCase()),
        id: 'projection',
        Cell: RenderProjection,
        disableSortBy: true,
        width: '26%'
      }
    ],
    [getString, groupSelection, onSelectionChange, sectionId, selectionState]
  )
  const hiddenColumns = sectionId ? ['category'] : harnessComponent ? ['rowSelect'] : []
  return (
    <TableV2
      data={questionMaturityList}
      initialState={{
        expanded: selectedRows,
        hiddenColumns
      }}
      columns={columns}
      renderRowSubComponent={renderRowSubComponent}
      getRowClassName={() => css.noPadding}
    />
  )
}

export default FlatRecommendationTable
