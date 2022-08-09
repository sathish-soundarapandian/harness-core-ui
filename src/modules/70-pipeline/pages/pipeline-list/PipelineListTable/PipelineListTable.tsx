/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { TableV2 } from '@harness/uicore'
import React from 'react'
import type { Column } from 'react-table'
import { useStrings } from 'framework/strings'
import type { PagePMSPipelineSummaryResponse, PMSPipelineSummaryResponse } from 'services/pipeline-ng'
import type { SortBy } from '../types'
import {
  CodeSourceCell,
  LastExecutionCell,
  MenuCell,
  PipelineNameCell,
  RecentExecutionsCell,
  LastModifiedCell
} from './PipelineListCells'
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE } from '../PipelineListUtils'
import css from './PipelineListTable.module.scss'

interface PipelineListTableProps {
  data?: PagePMSPipelineSummaryResponse
  gotoPage: (pageNumber: number) => void
  onDeletePipeline: (commitMsg: string) => Promise<void>
  onDelete: (pipeline: PMSPipelineSummaryResponse) => void
  setSortBy: (sortBy: string[]) => void
  sortBy?: string[]
}

export function PipelineListTable({
  data,
  gotoPage,
  onDeletePipeline,
  onDelete,
  sortBy,
  setSortBy
}: PipelineListTableProps): React.ReactElement {
  const { getString } = useStrings()
  const {
    content = [],
    totalElements = 0,
    totalPages = 0,
    number = DEFAULT_PAGE_NUMBER,
    size = DEFAULT_PAGE_SIZE
  } = data || ({} as PagePMSPipelineSummaryResponse)
  const [currentSort, currentOrder] = sortBy || []

  const columns: Column<PMSPipelineSummaryResponse>[] = React.useMemo(() => {
    const getServerSortProps = (id: string) => {
      return {
        enableServerSort: true,
        isServerSorted: currentSort === id,
        isServerSortedDesc: currentOrder === 'DESC',
        getSortedColumn: ({ sort }: SortBy) => {
          setSortBy([sort, currentOrder === 'DESC' ? 'ASC' : 'DESC'])
        }
      }
    }
    return [
      {
        Header: getString('filters.executions.pipelineName'),
        accessor: 'name',
        width: '25%',
        Cell: PipelineNameCell,
        serverSortProps: getServerSortProps('name')
      },
      {
        Header: getString('pipeline.codeSource'),
        accessor: 'storeType',
        width: '12%',
        disableSortBy: true,
        Cell: CodeSourceCell
      },
      {
        Header: getString('pipeline.recentExecutions').toUpperCase(),
        accessor: 'recentExecutions',
        width: '28%',
        Cell: RecentExecutionsCell,
        disableSortBy: true
      },
      {
        Header: getString('pipeline.lastExecution').toUpperCase(),
        accessor: 'executionSummaryInfo.lastExecutionTs',
        width: '20%',
        Cell: LastExecutionCell,
        serverSortProps: getServerSortProps('executionSummaryInfo.lastExecutionTs')
      },
      {
        Header: getString('pipeline.lastModified').toUpperCase(),
        accessor: 'lastUpdatedAt',
        width: '12%',
        Cell: LastModifiedCell,
        serverSortProps: getServerSortProps('lastUpdatedAt')
      },
      {
        Header: '',
        accessor: 'menu',
        width: '3%',
        Cell: MenuCell,
        disableSortBy: true,
        onDeletePipeline,
        onDelete
      }
    ] as unknown as Column<PMSPipelineSummaryResponse>[]
  }, [currentOrder, currentSort])

  return (
    <TableV2
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
              gotoPage
            }
          : undefined
      }
      sortable
      getRowClassName={() => css.tableRow}
    />
  )
}
