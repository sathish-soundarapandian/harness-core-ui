/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { Column } from 'react-table'
import cx from 'classnames'
import { Text, TableV2, Icon, Layout, Card, Heading, Button } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useHistory, useParams } from 'react-router-dom'
import { String, useStrings } from 'framework/strings'
import type { PagePMSPipelineSummaryResponse, PMSPipelineSummaryResponse } from 'services/pipeline-ng'
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@pipeline/utils/constants'
import routes from '@common/RouteDefinitions'
import type { PipelineListPagePathParams, SortBy } from '../../../../70-pipeline/pages/pipeline-list/types'
import { LastModifiedCell } from './ServiceLicenseTableCells'
import { getRouteProps } from '../../../../70-pipeline/pages/pipeline-list/PipelineListUtils'

import css from '../../../../70-pipeline/pages/pipeline-list/PipelineListTable/PipelineListTable.module.scss'
import pageCss from '../SubscriptionsPage.module.scss'

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
  const { content = [], totalElements = 100, totalPages = 0, number = DEFAULT_PAGE_INDEX, size = 10 } = data
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
        Header: getString('common.service'),
        accessor: 'name',
        width: '16%',
        Cell: LastModifiedCell,
        serverSortProps: getServerSortProps('name')
      },
      {
        Header: getString('common.organizations'),
        accessor: 'storeType',
        width: '16%',
        disableSortBy: true,
        Cell: LastModifiedCell
      },
      {
        Header: getString('common.projects'),
        accessor: 'storeType1',
        width: '16%',
        disableSortBy: true,
        Cell: LastModifiedCell
      },
      {
        Header: getString('common.serviceId'),
        accessor: 'executionSummaryInfo.lastExecutionTs',
        width: '16%',
        Cell: LastModifiedCell,
        serverSortProps: getServerSortProps('executionSummaryInfo.lastExecutionTs')
      },
      {
        Header: getString('common.servicesInstances'),
        accessor: 'executionSummaryInfo.lastExecutionTs3',
        width: '10%',
        Cell: LastModifiedCell,
        serverSortProps: getServerSortProps('executionSummaryInfo.lastExecutionTs')
      },
      {
        Header: getString('common.lastDeployed'),
        accessor: 'executionSummaryInfo.lastExecutionTs2',
        width: '16%',
        Cell: LastModifiedCell,
        serverSortProps: getServerSortProps('executionSummaryInfo.lastExecutionTs')
      },
      {
        Header: getString('common.licensesConsumed'),
        accessor: 'lastUpdatedAt',
        width: '10%',
        Cell: LastModifiedCell,
        serverSortProps: getServerSortProps('lastUpdatedAt')
      }
    ] as unknown as Column<PMSPipelineSummaryResponse>[]
  }, [currentOrder, currentSort])

  return (
    <Card className={pageCss.outterCard}>
      <Layout.Vertical spacing="xxlarge" flex={{ alignItems: 'stretch' }}>
        <Layout.Horizontal spacing="small" flex={{ justifyContent: 'space-between' }} width={'100%'}>
          <Layout.Vertical>
            <Heading color={Color.BLACK} font={{ size: 'medium' }}>
              {getString('common.activeServices')}
            </Heading>
            <p className={pageCss.activeServiceLink}>{getString('common.whoIsActiveService')}</p>
          </Layout.Vertical>
          <Button intent="primary" onClick={() => console.log('hello')}>
            {getString('common.downloadCSV')}
          </Button>
        </Layout.Horizontal>
        <Layout.Horizontal spacing="small" flex={{ justifyContent: 'space-between' }} width={'100%'}>
          <Layout.Vertical className={pageCss.badgesContainer}>
            <div className={cx(pageCss.badge, pageCss.runningExecutions)}>
              <Text className={pageCss.badgeText}>
                <String stringID={'pipeline.dashboardDeploymentsWidget.runningPipeline.singular'} />
              </Text>
            </div>
          </Layout.Vertical>
          <Layout.Horizontal spacing="small" flex={{ justifyContent: 'space-between' }} width={'100%'}>
            <p>Filter</p>
          </Layout.Horizontal>
        </Layout.Horizontal>
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
      </Layout.Vertical>
    </Card>
  )
}
