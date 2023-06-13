/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
import type { Column } from 'react-table'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import { Text, TableV2, Layout, Card, NoDataCard, SelectOption, PageSpinner } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import moment from 'moment'
import { useGetUsageAndLimit } from '@common/hooks/useGetUsageAndLimit'
import { ModuleName } from 'framework/types/ModuleName'
import { String, useStrings, StringKeys } from 'framework/strings'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import {
  PageActiveServiceDTO,
  LicenseUsageDTO,
  useDownloadActiveServiceCSVReport,
  ActiveServiceDTO
} from 'services/cd-ng'
import OrgDropdown from '@common/OrgDropdown/OrgDropdown'
import ProjectDropdown from '@common/ProjectDropdown/ProjectDropdown'
import ServiceDropdown from '@common/ServiceDropdown/ServiceDropdown'

import type { SortBy } from './types'
import {
  ServiceNameCell,
  OrganizationCell,
  ProjectCell,
  LastModifiedServiceIdCell,
  ServiceInstancesCell,
  LastDeployedCell,
  LicenseConsumedCell
} from './ServiceLicenseTableCells'
import { getInfoIcon } from './UsageInfoCard'
import pageCss from '../SubscriptionsPage.module.scss'

export const DEFAULT_PAGE_INDEX = 0
export const DEFAULT_PAGE_SIZE = 10
export interface ServiceLicenseTableProps {
  data: PageActiveServiceDTO
  gotoPage: (pageNumber: number) => void
  setSortBy: (sortBy: string[]) => void
  sortBy: string[]
  updateFilters: (
    orgId: SelectOption | undefined,
    projId: SelectOption | undefined,
    serviceId: SelectOption | undefined
  ) => void
  servicesLoading: boolean
  licenseType: string
}

export const tableV2 = (
  columns: Column<LicenseUsageDTO>[],
  content: ActiveServiceDTO[],
  totalElements: number,
  size: number,
  totalPages: number,
  number: number,
  gotoPage: (pageNumber: number) => void
) => {
  return (
    <TableV2
      className={pageCss.table}
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
  )
}

export const NameHeader = (getString: any, headerName: StringKeys, tooltip?: StringKeys) => {
  return (
    <Layout.Horizontal spacing="xsmall" flex={{ alignItems: 'baseline' }}>
      <Text font={{ size: 'small' }} color={Color.GREY_700}>
        {getString(headerName)}
      </Text>
      {tooltip && getInfoIcon(getString(tooltip))}
    </Layout.Horizontal>
  )
}

export function ServiceLicenseTable({
  data,
  gotoPage,
  sortBy,
  setSortBy,
  updateFilters,
  servicesLoading,
  licenseType
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
  function getLabel(value: number | undefined): string | number | undefined {
    if (value && value >= 1000000) {
      let roundValue = Math.round(value / 10000)
      roundValue = Math.trunc(roundValue) / 100
      return `${roundValue}M`
    }
    if (value && value >= 1000) {
      let roundValue = Math.round(value / 10)
      roundValue = Math.trunc(roundValue) / 100
      return `${roundValue}K`
    }
    if (value === -1) {
      return getString('common.unlimited')
    }
    return value
  }

  const columns: Column<LicenseUsageDTO>[] = React.useMemo(() => {
    const getServerSortProps = (id: string) => {
      return {
        enableServerSort: true,
        isServerSorted: currentSort === id,
        isServerSortedDesc: currentOrder === 'ASC',
        getSortedColumn: ({ sort }: SortBy) => {
          setSortBy([sort, currentOrder === 'ASC' ? 'DESC' : 'ASC'])
        }
      }
    }
    return [
      {
        Header: NameHeader(getString, 'common.purpose.service', 'common.subscriptions.usage.cdServiceTooltip'),
        accessor: 'name',
        width: '14%',
        disableSortBy: true,
        Cell: ServiceNameCell
      },
      {
        Header: NameHeader(getString, 'common.organizations'),
        accessor: 'storeType',
        disableSortBy: true,
        width: '13%',
        Cell: OrganizationCell
      },
      {
        Header: NameHeader(getString, 'common.projects', 'common.trialInProgressDescription'),
        accessor: 'storeType1',
        disableSortBy: true,
        width: '15%',
        Cell: ProjectCell
      },
      {
        Header: NameHeader(getString, 'common.serviceId'),
        accessor: 'identifier',
        disableSortBy: true,
        width: '18%',
        Cell: LastModifiedServiceIdCell
      },
      {
        Header: NameHeader(getString, 'common.servicesInstances'),
        accessor: 'serviceInstances',
        width: '15%',
        Cell: ServiceInstancesCell,
        serverSortProps: getServerSortProps('common.servicesInstances')
      },
      {
        Header: NameHeader(getString, 'common.lastDeployed'),
        accessor: 'lastDeployed',
        width: '12%',
        Cell: LastDeployedCell,
        serverSortProps: getServerSortProps('common.lastDeployed')
      },
      ...(licenseType === 'SERVICES'
        ? [
            {
              Header: NameHeader(getString, 'common.licensesConsumed'),
              accessor: 'licensesConsumed',
              width: '15%',
              Cell: LicenseConsumedCell,
              serverSortProps: getServerSortProps('licensesConsumed')
            }
          ]
        : [])
    ] as unknown as Column<LicenseUsageDTO>[]
  }, [currentOrder, currentSort])
  const { usageData } = useGetUsageAndLimit(ModuleName.CD)
  const { usage } = usageData
  const { accountId } = useParams<AccountPathProps>()
  const [selectedOrg, setSelectedOrg] = useState<SelectOption | undefined>()
  const [selectedProj, setSelectedProj] = useState<SelectOption | undefined>()
  const [selectedService, setSelectedService] = useState<SelectOption | undefined>()
  const activeServiceText = `${totalElements}`

  const licenseText = `${getLabel(
    licenseType === 'SERVICES' ? usage?.cd?.serviceLicenses?.count : usage?.cd?.activeServiceInstances?.count || 0
  )}`
  const [initialContent, setInitialContent] = useState<string>('')

  const { data: dataInCsv, refetch } = useDownloadActiveServiceCSVReport({
    queryParams: {
      accountIdentifier: accountId
    },
    lazy: true
  })
  useEffect(() => {
    if (dataInCsv) {
      ;(dataInCsv as unknown as Response)
        .clone()
        .text()
        .then((cont: string) => {
          setInitialContent(cont)
        })
    }
  }, [dataInCsv])

  useEffect(() => {
    refetch()
  }, [refetch])
  const formattedTime = moment(new Date().getTime()).format('MMM DD YYYY hh:mm:ss')
  return (
    <Card className={pageCss.outterCard}>
      <Layout.Vertical spacing="xxlarge" flex={{ alignItems: 'stretch' }}>
        <Layout.Horizontal spacing="small" flex={{ justifyContent: 'space-between' }} width={'100%'}>
          {licenseType === 'SERVICES' ? (
            <Layout.Vertical className={pageCss.badgesContainer}>
              <div className={cx(pageCss.badge, pageCss.runningExecutions)}>
                <Text className={pageCss.badgeText}>{activeServiceText}&nbsp;</Text>
                <String stringID={'common.subscriptions.usage.servicesConsumed'} />
                <Text className={pageCss.badgeText}>{licenseText}&nbsp;</Text>
                <String stringID={'common.subscriptions.usage.serviceLicenses'} />
                <Text>(</Text>
                <Text>{getString('common.lastUpdatedAt')} -</Text>
                <Text className={pageCss.badgeText}>{formattedTime}</Text>
                <Text>)</Text>
              </div>
            </Layout.Vertical>
          ) : null}
          <div className={pageCss.exportButtonAlign}>
            {' '}
            <a
              href={`data:text/csv;charset=utf-8,${escape(initialContent || '')}`}
              download="serviceLicensesData.csv"
              className={pageCss.exportButton}
            >
              {'Export CSV'}
            </a>
          </div>
        </Layout.Horizontal>
        <Layout.Horizontal spacing="small" flex={{ justifyContent: 'flex-end' }} width={'100%'}>
          <Layout.Vertical>
            <OrgDropdown
              value={selectedOrg}
              className={pageCss.orgDropdown}
              onChange={org => {
                setSelectedOrg(org)
              }}
            />
          </Layout.Vertical>
          <div></div>
          <ProjectDropdown
            value={selectedProj}
            className={pageCss.orgDropdown}
            onChange={proj => {
              setSelectedProj(proj)
            }}
          />
          <ServiceDropdown
            value={selectedService}
            className={pageCss.orgDropdown}
            onChange={service => {
              setSelectedService(service)
            }}
          />
          <Text
            className={pageCss.fetchButton}
            font={{ variation: FontVariation.LEAD }}
            color={Color.PRIMARY_7}
            onClick={() => {
              updateFilters(selectedOrg, selectedProj, selectedService)
            }}
          >
            Update
          </Text>
        </Layout.Horizontal>
        {servicesLoading && <PageSpinner />}
        {content.length > 0 ? (
          tableV2(columns, content, totalElements, size, totalPages, number, gotoPage)
        ) : (
          <NoDataCard
            message={getString('common.noActiveServiceData')}
            className={pageCss.noDataCard}
            containerClassName={pageCss.noDataCardContainer}
          />
        )}
      </Layout.Vertical>
    </Card>
  )
}
