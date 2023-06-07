import { TableV2 } from '@harness/uicore'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useStrings } from 'framework/strings'
import type { SectionScore } from 'services/assessments'
import { useQueryParams } from '@common/hooks'
import QuestionsSection from '../QuestionsSection/QuestionsSection'
import {
  RenderComparison,
  RenderRecommendations,
  ToggleAccordionCell,
  RenderCategory,
  RenderLevelForSection
} from './ResultTable.utils'
import css from './ResultTable.module.scss'

interface ResultTableProps {
  sectionScores: SectionScore[]
  benchmarkId: string
}

const ResultTable = ({ sectionScores, benchmarkId }: ResultTableProps): JSX.Element => {
  const [expandRows, setExpandRows] = useState<Record<number, boolean>>({})
  const { getString } = useStrings()
  const { focusCategory } = useQueryParams<{ focusCategory: string }>()

  const renderRowSubComponent = useCallback(
    ({ row }) => <QuestionsSection currentSection={row.original.sectionId} benchmarkId={benchmarkId} />,
    [benchmarkId]
  )

  useEffect(() => {
    if (focusCategory) {
      const rowIndex = sectionScores.findIndex(
        (score: SectionScore) => score.sectionText?.replace(/ /g, '').toLowerCase() === focusCategory
      )
      setExpandRows({
        [rowIndex]: true
      })
    }
  }, [focusCategory, sectionScores])

  useEffect(() => {
    const scroll = async (): Promise<void> => {
      await new Promise(f => setTimeout(f, 1000))
      const category = document.getElementById(focusCategory)
      category?.scrollIntoView({ behavior: 'smooth' })
    }
    if (focusCategory) {
      scroll()
    }
  }, [focusCategory])

  const columns = useMemo(
    () => [
      {
        Header: '        ',
        id: 'rowSelectOrExpander',
        Cell: ToggleAccordionCell,
        disableSortBy: true,
        width: '2%'
      },
      {
        Header: getString('common.category').toLocaleUpperCase(),
        id: 'categoryName',
        width: '30%',
        Cell: RenderCategory
      },
      {
        Header: getString('assessments.levelString').toLocaleUpperCase(),
        width: '15%',
        Cell: RenderLevelForSection
      },
      {
        Header: getString('assessments.comparison').toLocaleUpperCase(),
        width: '35%',
        Cell: RenderComparison
      },
      {
        Header: getString('assessments.recommendations').toLocaleUpperCase(),
        width: '18%',
        Cell: RenderRecommendations
      }
    ],
    [getString]
  )

  return (
    <TableV2
      sortable={true}
      columns={columns}
      data={sectionScores}
      initialState={{
        expanded: expandRows
      }}
      className={css.surveyTable}
      renderRowSubComponent={renderRowSubComponent}
    />
  )
}

export default ResultTable
