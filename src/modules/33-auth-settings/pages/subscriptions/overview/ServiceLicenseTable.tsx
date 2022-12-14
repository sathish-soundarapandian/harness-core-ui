/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { Column } from 'react-table'
import cx from 'classnames'
import { isEmpty } from 'lodash-es'
import { Text, TableV2, Layout, Card, Heading, Button } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { String, useStrings } from 'framework/strings'
import { DEFAULT_PAGE_INDEX } from '@pipeline/utils/constants'
import type { SortBy } from '../../../../70-pipeline/pages/pipeline-list/types'
import {
  LastModifiedNameCell,
  OrganizationCell,
  ProjectCell,
  LastModifiedServiceIdCell,
  ServiceInstancesCell,
  LastDeployedCell,
  LicenseConsumedCell
} from './ServiceLicenseTableCells'
import type { ResponsePageLicenseUsageDTO, PageLicenseUsageDTO, LicenseUsageDTO } from 'services/cd-ng'
import css from '../../../../70-pipeline/pages/pipeline-list/PipelineListTable/PipelineListTable.module.scss'
import pageCss from '../SubscriptionsPage.module.scss'
import moment from 'moment'

export interface ServiceLicenseTableProps {
  data: PageLicenseUsageDTO
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
  const { getString } = useStrings()
  const { content = [], totalElements = 2, totalPages = 2, number = DEFAULT_PAGE_INDEX, size = 1 } = data
  const [currentSort, currentOrder] = sortBy

  const columns: Column<LicenseUsageDTO>[] = React.useMemo(() => {
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
        Cell: LastModifiedNameCell
      },
      {
        Header: getString('common.organizations'),
        accessor: 'storeType',
        width: '16%',
        Cell: OrganizationCell
      },
      {
        Header: getString('common.projects'),
        accessor: 'storeType1',
        width: '16%',
        Cell: ProjectCell
      },
      {
        Header: getString('common.serviceId'),
        accessor: 'executionSummaryInfo.lastExecutionTs',
        width: '10%',
        Cell: LastModifiedServiceIdCell
      },
      {
        Header: getString('common.servicesInstances'),
        accessor: 'servicesInstances',
        width: '15%',
        Cell: ServiceInstancesCell,
        serverSortProps: getServerSortProps('common.servicesInstances')
      },
      {
        Header: getString('common.lastDeployed'),
        accessor: 'lastDeployed',
        width: '16%',
        Cell: LastDeployedCell,
        serverSortProps: getServerSortProps('common.lastDeployed')
      },
      {
        Header: getString('common.licensesConsumed'),
        accessor: 'licensesConsumed',
        width: '10%',
        Cell: LicenseConsumedCell,
        serverSortProps: getServerSortProps('licensesConsumed')
      }
    ] as unknown as Column<LicenseUsageDTO>[]
  }, [currentOrder, currentSort])
  const activeServiceText = `${content.length}`
  const timeValue = moment(content[0]?.timestamp).format('DD-MM-YYYY h:mm:ss')
  return (
    <Card className={pageCss.outterCard}>
      {isEmpty(data) ? (
        <p>No active ServiceFound</p>
      ) : (
        <Layout.Vertical spacing="xxlarge" flex={{ alignItems: 'stretch' }}>
          <Layout.Horizontal spacing="small" flex={{ justifyContent: 'space-between' }} width={'100%'}>
            <Layout.Vertical>
              <Heading color={Color.BLACK} font={{ size: 'medium' }}>
                {getString('common.activeServices')}
              </Heading>
              <p className={pageCss.activeServiceLink}>{getString('common.whatIsActiveService')}</p>
            </Layout.Vertical>
            {/* <Button intent="primary" onClick={() => console.log('hello')}>
              {getString('common.downloadCSV')}
            </Button> */}
          </Layout.Horizontal>
          <Layout.Horizontal spacing="small" flex={{ justifyContent: 'space-between' }} width={'100%'}>
            <Layout.Vertical className={pageCss.badgesContainer}>
              <div className={cx(pageCss.badge, pageCss.runningExecutions)}>
                <Text className={pageCss.badgeText}>{activeServiceText}&nbsp;</Text>
                <String stringID={'common.activeServices'} />
                <Text className={pageCss.badgeText}>{timeValue}</Text>
              </div>
            </Layout.Vertical>
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
          />
        </Layout.Vertical>
      )}
    </Card>
  )
}
