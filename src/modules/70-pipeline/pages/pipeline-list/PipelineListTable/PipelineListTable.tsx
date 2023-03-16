/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { Column } from 'react-table'
import { Text, TableV2, Icon, Layout, PaginationProps } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useHistory, useParams } from 'react-router-dom'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import { moduleToModuleNameMapping } from 'framework/types/ModuleName'
import type { PagePMSPipelineSummaryResponse, PMSPipelineSummaryResponse } from 'services/pipeline-ng'
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@pipeline/utils/constants'
import routes from '@common/RouteDefinitions'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { useDefaultPaginationProps } from '@common/hooks/useDefaultPaginationProps'
import type { PipelineListPagePathParams, SortBy } from '../types'
import {
  CodeSourceCell,
  LastExecutionCell,
  MenuCell,
  PipelineNameCell,
  RecentExecutionsCell,
  LastModifiedCell,
  RunPipelineCell
} from './PipelineListCells'
import { getRouteProps } from '../PipelineListUtils'
import css from './PipelineListTable.module.scss'

export interface PipelineListColumnActions {
  onDeletePipeline?: (commitMsg: string, pipeline: PMSPipelineSummaryResponse) => Promise<void>
  onClonePipeline?: (pipeline: PMSPipelineSummaryResponse) => void
  refetchList?: () => void
}

export interface PipelineListTableProps extends PipelineListColumnActions {
  data: PagePMSPipelineSummaryResponse
  gotoPage: (pageNumber: number) => void
  onPageSizeChange?: PaginationProps['onPageSizeChange']
  setSortBy: (sortBy: string[]) => void
  sortBy: string[]
  minimal?: boolean
}

export function PipelineListTable({
  data,
  gotoPage,
  onPageSizeChange,
  onDeletePipeline,
  onClonePipeline,
  refetchList,
  sortBy,
  setSortBy,
  minimal
}: PipelineListTableProps): React.ReactElement {
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
  const { CI_YAML_VERSIONING } = useFeatureFlags()

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
        Cell: PipelineNameCell,
        serverSortProps: getServerSortProps('name')
      },
      {
        Header: getString('pipeline.codeSource'),
        accessor: 'storeType',
        disableSortBy: true,
        Cell: CodeSourceCell
      },
      !minimal && {
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
        Cell: RecentExecutionsCell,
        disableSortBy: true
      },
      {
        Header: getString('pipeline.lastExecution'),
        accessor: 'executionSummaryInfo.lastExecutionTs',
        Cell: LastExecutionCell,
        serverSortProps: getServerSortProps('executionSummaryInfo.lastExecutionTs')
      },
      !minimal && {
        Header: getString('common.lastModified'),
        accessor: 'lastUpdatedAt',
        Cell: LastModifiedCell,
        serverSortProps: getServerSortProps('lastUpdatedAt')
      },
      !minimal && {
        Header: '',
        accessor: 'menu',
        Cell: MenuCell,
        disableSortBy: true,
        onDeletePipeline,
        onClonePipeline,
        refetchList
      },
      minimal && {
        Header: '',
        accessor: 'runPipeline',
        Cell: RunPipelineCell,
        disableSortBy: true
      }
    ].filter(Boolean) as unknown as Column<PMSPipelineSummaryResponse>[]
  }, [currentOrder, currentSort, minimal, getString, onClonePipeline, onDeletePipeline, refetchList])

  const paginationProps = useDefaultPaginationProps({
    itemCount: totalElements,
    pageSize: size,
    pageCount: totalPages,
    pageIndex: number,
    gotoPage,
    onPageSizeChange
  })

  return (
    <TableV2
      className={cx(css.table, minimal && css.minimal)}
      columns={columns}
      data={content}
      pagination={paginationProps}
      sortable
      getRowClassName={() => css.tableRow}
      onRowClick={rowDetails =>
        CI_YAML_VERSIONING &&
        pathParams.module?.valueOf().toLowerCase() === moduleToModuleNameMapping.ci.valueOf().toLowerCase()
          ? history.push(routes.toPipelineStudioV1(getRouteProps(pathParams, rowDetails)))
          : history.push(routes.toPipelineStudio(getRouteProps(pathParams, rowDetails)))
      }
    />
  )
}
