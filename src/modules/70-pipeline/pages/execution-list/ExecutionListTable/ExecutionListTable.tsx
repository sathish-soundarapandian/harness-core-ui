/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { memo } from 'react'
import { TableV2 } from '@harness/uicore'
import type { Column } from 'react-table'
import { isEqual } from 'lodash-es'
import { useHistory, useParams } from 'react-router-dom'
import type {
  GetListOfExecutionsQueryParams,
  PagePipelineExecutionSummary,
  PipelineExecutionSummary
} from 'services/pipeline-ng'
import { useUpdateQueryParams } from '@common/hooks'
import { useStrings } from 'framework/strings'
import { useExecutionCompareContext } from '@pipeline/components/ExecutionCompareYaml/ExecutionCompareContext'
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@pipeline/utils/constants'
import type { PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { useDefaultPaginationProps } from '@common/hooks/useDefaultPaginationProps'
import {
  DurationCell,
  ExecutionCell,
  getExecutionPipelineViewLink,
  MenuCell,
  PipelineNameCell,
  RowSelectCell,
  StatusCell,
  ToggleAccordionCell,
  TriggerInfoCell
} from './ExecutionListCells'
import { ExecutionStageList } from './ExecutionStageList'
import type { SortBy } from '../types'
import { useExecutionListQueryParams } from '../utils/executionListUtil'
import css from './ExecutionListTable.module.scss'

export interface ExecutionListColumnActions {
  onViewCompiledYaml: (pipelineExecutionSummary: PipelineExecutionSummary) => void
  isPipelineInvalid?: boolean
}

export interface ExecutionListTableProps extends ExecutionListColumnActions {
  executionList: PagePipelineExecutionSummary
}

function ExecutionListTable({
  executionList,
  isPipelineInvalid,
  onViewCompiledYaml
}: ExecutionListTableProps): React.ReactElement {
  const history = useHistory()
  const { updateQueryParams } = useUpdateQueryParams<Partial<GetListOfExecutionsQueryParams>>()
  const pathParams = useParams<PipelineType<PipelinePathProps>>()
  const queryParams = useExecutionListQueryParams()
  const { getString } = useStrings()
  const { isCompareMode } = useExecutionCompareContext()
  const [currentSort, currentOrder] = queryParams.sort

  const {
    content = [],
    totalElements = 0,
    totalPages = 0,
    number = DEFAULT_PAGE_INDEX,
    size = DEFAULT_PAGE_SIZE
  } = executionList

  const columns: Column<PipelineExecutionSummary>[] = React.useMemo(() => {
    const getServerSortProps = (id: string) => {
      return {
        enableServerSort: true,
        isServerSorted: currentSort === id,
        isServerSortedDesc: currentOrder === 'DESC',
        getSortedColumn: ({ sort: sortedColumn }: SortBy) => {
          updateQueryParams({ sort: [sortedColumn, currentOrder === 'DESC' ? 'ASC' : 'DESC'] })
        }
      }
    }

    return [
      {
        Header: '',
        id: 'rowSelectOrExpander',
        Cell: isCompareMode ? RowSelectCell : ToggleAccordionCell,
        disableSortBy: true
      },
      {
        Header: getString('filters.executions.pipelineName'),
        accessor: 'name',
        Cell: PipelineNameCell,
        serverSortProps: getServerSortProps('name')
      },
      {
        Header: 'status',
        accessor: 'status',
        Cell: StatusCell,
        serverSortProps: getServerSortProps('status')
      },
      {
        Header: '',
        accessor: 'moduleInfo',
        Cell: TriggerInfoCell,
        disableSortBy: true
      },
      {
        Header: getString('common.executedBy').toUpperCase(),
        accessor: 'startTs',
        Cell: ExecutionCell,
        serverSortProps: getServerSortProps('startTs')
      },
      {
        Header: '',
        id: 'endTs',
        Cell: DurationCell,
        disableSortBy: true
      },
      {
        Header: '',
        id: 'menu',
        Cell: MenuCell,
        isPipelineInvalid,
        onViewCompiledYaml,
        disableSortBy: true
      }
    ]
  }, [isCompareMode, isPipelineInvalid, onViewCompiledYaml, currentOrder, currentSort])

  const renderRowSubComponent = React.useCallback(({ row }) => <ExecutionStageList row={row} />, [])

  const paginationProps = useDefaultPaginationProps({
    itemCount: totalElements,
    pageSize: size,
    pageCount: totalPages,
    pageIndex: number
  })

  return (
    <TableV2<PipelineExecutionSummary>
      className={css.table}
      columns={columns}
      data={content}
      pagination={paginationProps}
      sortable
      renderRowSubComponent={renderRowSubComponent}
      onRowClick={rowDetails => history.push(getExecutionPipelineViewLink(rowDetails, pathParams, queryParams))}
      autoResetExpanded={false}
    />
  )
}

export const MemoisedExecutionListTable = memo(ExecutionListTable, (prev, current) => {
  return isEqual(prev.executionList, current.executionList)
})
