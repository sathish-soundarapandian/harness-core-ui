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
import { Text, TableV2, Layout, Card, Heading } from '@harness/uicore'
import { Color } from '@harness/design-system'
import moment from 'moment'
import { String, useStrings } from 'framework/strings'
import type { PageActiveServiceDTO, LicenseUsageDTO } from 'services/cd-ng'
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
import css from '../../../../70-pipeline/pages/pipeline-list/PipelineListTable/PipelineListTable.module.scss'
import pageCss from '../SubscriptionsPage.module.scss'

const DEFAULT_PAGE_INDEX = 0
const DEFAULT_PAGE_SIZE = 30
export interface ServiceLicenseTableProps {
  data: PageActiveServiceDTO
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
  const {
    content = [],
    totalElements = 0,
    totalPages = 0,
    number = DEFAULT_PAGE_INDEX,
    size = DEFAULT_PAGE_SIZE
  } = data
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
        Header: getString('common.purpose.service'),
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
      <Layout.Vertical spacing="xxlarge" flex={{ alignItems: 'stretch' }}>
        <Layout.Horizontal spacing="small" flex={{ justifyContent: 'space-between' }} width={'100%'}>
          <Layout.Vertical>
            <Heading color={Color.BLACK} font={{ size: 'medium' }}>
              {getString('common.subscriptions.usage.services')}
            </Heading>
            <Text
              color={Color.PRIMARY_7}
              tooltip={getString('common.subscriptions.usage.cdServiceTooltip')}
              font={{ size: 'xsmall' }}
            >
              {getString('common.whatIsActiveService')}
            </Text>
          </Layout.Vertical>
        </Layout.Horizontal>
        <Layout.Horizontal spacing="small" flex={{ justifyContent: 'space-between' }} width={'100%'}>
          <Layout.Vertical className={pageCss.badgesContainer}>
            <div className={cx(pageCss.badge, pageCss.runningExecutions)}>
              <Text className={pageCss.badgeText}>{activeServiceText}&nbsp;</Text>
              <String stringID={'common.subscriptions.usage.services'} />
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
    </Card>
  )
}
