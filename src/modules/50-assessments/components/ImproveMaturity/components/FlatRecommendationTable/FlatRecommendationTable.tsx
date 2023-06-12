import { Checkbox, Container, TableV2 } from '@harness/uicore'
import React, { useCallback, useMemo } from 'react'
import type { CellProps, HeaderProps, Renderer } from 'react-table'
import type { QuestionMaturity } from 'services/assessments'
import { killEvent } from '@common/utils/eventUtils'
import { useStrings } from 'framework/strings'
import HarnessRecommendation from '../HarnessRecommendation/HarnessRecommendation'
import { RenderCategory, RenderProjection, RenderRecommendation } from './FlatRecommendationTable.utils'
import css from './FlatRecommendationTable.module.scss'

interface CapabilitiesContainerProps {
  questionMaturityList: QuestionMaturity[]
  onSelectionChange: (questionId: string, sectionId: string, value: boolean) => void
  groupSelection: (value: boolean, sectionId?: string) => void
  sectionId?: string
}

const FlatRecommendationTable = ({
  questionMaturityList,
  onSelectionChange,
  groupSelection,
  sectionId
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
      questionMaturityList.reduce((acc: Record<string, boolean>, question: QuestionMaturity, currentIndex) => {
        if (question.selected) {
          acc = {
            ...acc,
            [currentIndex.toString()]: true
          }
        }
        return acc
      }, {}),
    [questionMaturityList]
  )

  const RenderHeaderCheckbox: Renderer<HeaderProps<QuestionMaturity>> = useCallback(() => {
    return (
      <Checkbox
        checked={selectionState === 'CHECKED'}
        indeterminate={selectionState === 'INDETERMINATE'}
        className={css.noPadding}
        onChange={() => groupSelection(selectionState !== 'CHECKED', sectionId)}
        data-testid="header-checkbox"
      />
    )
  }, [selectionState, groupSelection, sectionId])

  const CheckboxCell: Renderer<CellProps<QuestionMaturity>> = useCallback(
    ({ row }) => {
      return (
        <Container height={90} padding={{ left: 'medium' }}>
          <Checkbox
            checked={row?.original?.selected}
            className={css.noPadding}
            data-testid="row-checkbox"
            onClick={e => {
              killEvent(e)
              onSelectionChange(
                row?.original?.questionId || '',
                row?.original?.sectionId || '',
                !row?.original?.selected
              )
            }}
          ></Checkbox>
        </Container>
      )
    },
    [onSelectionChange]
  )

  const columns = useMemo(
    () => [
      {
        Header: RenderHeaderCheckbox,
        id: 'rowSelect',
        Cell: CheckboxCell,
        disableSortBy: true,
        width: '4%'
      },
      {
        Header: getString('assessments.recommendations'),
        id: 'rowRecommandation',
        Cell: RenderRecommendation,
        disableSortBy: true,
        width: sectionId ? '60%' : '32%'
      },
      {
        Header: getString('common.category'),
        id: 'category',
        Cell: RenderCategory,
        disableSortBy: true,
        width: '36%'
      },
      {
        Header: getString('assessments.projectedScoreWithRec'),
        id: 'projection',
        Cell: RenderProjection,
        disableSortBy: true,
        width: '30%'
      }
    ],
    [CheckboxCell, RenderHeaderCheckbox, getString, sectionId]
  )
  const hiddenColumns = sectionId ? ['category'] : []
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
