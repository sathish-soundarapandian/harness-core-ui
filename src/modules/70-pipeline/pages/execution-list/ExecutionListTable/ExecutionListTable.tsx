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
import { useExecutionListFilterContext } from '../ExecutionListFilterContext/ExecutionListFilterContext'
import css from './ExecutionListTable.module.scss'

export interface ExecutionListColumnActions {
  onViewCompiledYaml: (pipelineExecutionSummary: PipelineExecutionSummary) => void
  isPipelineInvalid?: boolean
}

export interface ExecutionListTableProps extends ExecutionListColumnActions {
  executionList: PagePipelineExecutionSummary
}

export function ExecutionListTable({
  executionList,
  isPipelineInvalid,
  onViewCompiledYaml
}: ExecutionListTableProps): React.ReactElement {
  const history = useHistory()
  const { updateQueryParams } = useUpdateQueryParams<Partial<GetListOfExecutionsQueryParams>>()
  const {
    queryParams: { sort }
  } = useExecutionListFilterContext()
  const { getString } = useStrings()
  const { isCompareMode } = useExecutionCompareContext()
  const [currentSort, currentOrder] = sort

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
        width: '3%',
        Cell: isCompareMode ? RowSelectCell : ToggleAccordionCell,
        disableSortBy: true
      },
      {
        Header: getString('filters.executions.pipelineName'),
        accessor: 'pipelineIdentifier',
        width: '19%',
        Cell: PipelineNameCell,
        serverSortProps: getServerSortProps('name')
      },
      {
        Header: 'status',
        accessor: 'status',
        width: '10%',
        Cell: StatusCell,
        serverSortProps: getServerSortProps('status')
      },
      {
        Header: '',
        accessor: 'moduleInfo',
        width: '41%',
        Cell: TriggerInfoCell,
        disableSortBy: true
      },
      {
        Header: getString('common.executedBy').toUpperCase(),
        accessor: 'startTs',
        width: '20%',
        Cell: ExecutionCell,
        serverSortProps: getServerSortProps('startTs')
      },
      {
        Header: '',
        id: 'endTs',
        width: '4%',
        Cell: DurationCell,
        disableSortBy: true
      },
      {
        Header: '',
        id: 'menu',
        width: '3%',
        Cell: MenuCell,
        isPipelineInvalid,
        onViewCompiledYaml,
        disableSortBy: true
      }
    ]
  }, [isCompareMode, isPipelineInvalid, onViewCompiledYaml, currentOrder, currentSort])

  const renderRowSubComponent = React.useCallback(({ row }) => <ExecutionStageList row={row} />, [])

  const pathParams = useParams<PipelineType<PipelinePathProps>>()

  return (
    <TableV2<PipelineExecutionSummary>
      className={css.table}
      columns={columns}
      data={content}
      pagination={
        totalElements > size
          ? {
              itemCount: totalElements,
              pageSize: size,
              pageCount: totalPages,
              pageIndex: number,
              gotoPage: page => updateQueryParams({ page })
            }
          : undefined
      }
      sortable
      renderRowSubComponent={renderRowSubComponent}
      onRowClick={rowDetails => history.push(getExecutionPipelineViewLink(rowDetails, pathParams))}
    />
  )
}

export const MemoisedExecutionListTable = memo(ExecutionListTable, (prev, current) => {
  return isEqual(prev.executionList, current.executionList)
})
