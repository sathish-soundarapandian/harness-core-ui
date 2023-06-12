import { TableV2 } from '@harness/uicore'
import React, { useCallback, useMemo } from 'react'
import { useStrings } from 'framework/strings'
import type { SectionScore } from 'services/assessments'
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
  const { getString } = useStrings()
  const renderRowSubComponent = useCallback(
    ({ row }) => <QuestionsSection currentSection={row.original.sectionId} benchmarkId={benchmarkId} />,
    [benchmarkId]
  )

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
      className={css.surveyTable}
      renderRowSubComponent={renderRowSubComponent}
      autoResetExpanded={false}
    />
  )
}

export default ResultTable
