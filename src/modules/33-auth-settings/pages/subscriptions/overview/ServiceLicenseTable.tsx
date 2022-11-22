/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { Column } from 'react-table'
import { Text, TableV2, Icon, Layout } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useHistory, useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import type { PagePMSPipelineSummaryResponse, PMSPipelineSummaryResponse } from 'services/pipeline-ng'
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@pipeline/utils/constants'
import routes from '@common/RouteDefinitions'
import type { PipelineListPagePathParams, SortBy } from '../../../../70-pipeline/pages/pipeline-list/types'
import {
  CodeSourceCell,
  LastExecutionCell,
  MenuCell,
  PipelineNameCell,
  RecentExecutionsCell,
  LastModifiedCell
} from '../../../../70-pipeline/pages/pipeline-list/PipelineListTable/PipelineListCells'
import { getRouteProps } from '../../../../70-pipeline/pages/pipeline-list/PipelineListUtils'
import css from '../../../../70-pipeline/pages/pipeline-list/PipelineListTable/PipelineListTable.module.scss'

export interface ServiceLicenseTableProps {
  data?: PagePMSPipelineSummaryResponse
  gotoPage: (pageNumber: number) => void
  setSortBy: (sortBy: string[]) => void
  sortBy: string[]
}

export function ServiceLicenseTable({
  data,
  gotoPage,
  sortBy,
  setSortBy
}: ServiceLicenseTableProps): React.ReactElement {
  const history = useHistory()
  const { getString } = useStrings()
  const pathParams = useParams<PipelineListPagePathParams>()
  const {
    content = [],
    totalElements = 0,
    totalPages = 0,
    number = DEFAULT_PAGE_INDEX,
    size = DEFAULT_PAGE_SIZE
  } = data
  const [currentSort, currentOrder] = sortBy

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
        Header: (
          <div className={css.recentExecutionHeader}>
            <Layout.Horizontal spacing="xsmall" className={css.latestExecutionText} flex={{ alignItems: 'center' }}>
              <Text color={Color.GREY_400} font={{ variation: FontVariation.TINY }}>
                {`${getString('pipeline.mostRecentDirection')} `}
              </Text>
              <Icon size={10} name="arrow-right" color={Color.GREY_400} />
            </Layout.Horizontal>

            {getString('pipeline.recentExecutions')}
          </div>
        ),
        accessor: 'recentExecutions',
        width: '28%',
        Cell: RecentExecutionsCell,
        disableSortBy: true
      },
      {
        Header: getString('pipeline.lastExecution'),
        accessor: 'executionSummaryInfo.lastExecutionTs',
        width: '20%',
        Cell: LastExecutionCell,
        serverSortProps: getServerSortProps('executionSummaryInfo.lastExecutionTs')
      },
      {
        Header: getString('common.lastModified'),
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
        disableSortBy: true
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
      onRowClick={rowDetails => history.push(routes.toPipelineStudio(getRouteProps(pathParams, rowDetails)))}
    />
  )
}
