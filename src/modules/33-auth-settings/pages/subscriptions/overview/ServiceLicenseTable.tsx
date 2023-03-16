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
import { Text, TableV2, Layout, Card, Heading, NoDataCard, SelectOption, PageSpinner } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import moment from 'moment'
import { String, useStrings, StringKeys } from 'framework/strings'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { PageActiveServiceDTO, LicenseUsageDTO, useDownloadActiveServiceCSVReport } from 'services/cd-ng'
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

const DEFAULT_PAGE_INDEX = 0
const DEFAULT_PAGE_SIZE = 30
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
  const NameHeader = (headerName: StringKeys, tooltip?: StringKeys) => {
    return (
      <Layout.Horizontal spacing="xsmall" flex={{ alignItems: 'baseline' }}>
        <Text font={{ size: 'small' }} color={Color.GREY_700}>
          {getString(headerName)}
        </Text>
        {tooltip && getInfoIcon(getString(tooltip))}
      </Layout.Horizontal>
    )
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
        Header: NameHeader('common.purpose.service', 'common.subscriptions.usage.cdServiceTooltip'),
        accessor: 'name',
        width: '14%',
        disableSortBy: true,
        Cell: ServiceNameCell
      },
      {
        Header: NameHeader('common.organizations'),
        accessor: 'storeType',
        disableSortBy: true,
        width: '13%',
        Cell: OrganizationCell
      },
      {
        Header: NameHeader('common.projects', 'common.trialInProgressDescription'),
        accessor: 'storeType1',
        disableSortBy: true,
        width: '15%',
        Cell: ProjectCell
      },
      {
        Header: NameHeader('common.serviceId'),
        accessor: 'identifier',
        disableSortBy: true,
        width: '18%',
        Cell: LastModifiedServiceIdCell
      },
      {
        Header: NameHeader('common.servicesInstances'),
        accessor: 'serviceInstances',
        width: '15%',
        Cell: ServiceInstancesCell,
        serverSortProps: getServerSortProps('common.servicesInstances')
      },
      {
        Header: NameHeader('common.lastDeployed'),
        accessor: 'lastDeployed',
        width: '12%',
        Cell: LastDeployedCell,
        serverSortProps: getServerSortProps('common.lastDeployed')
      },
      ...(licenseType === 'SERVICES'
        ? [
            {
              Header: NameHeader('common.licensesConsumed'),
              accessor: 'licensesConsumed',
              width: '15%',
              Cell: LicenseConsumedCell,
              serverSortProps: getServerSortProps('licensesConsumed')
            }
          ]
        : [])
    ] as unknown as Column<LicenseUsageDTO>[]
  }, [currentOrder, currentSort])
  const { accountId } = useParams<AccountPathProps>()
  const [selectedOrg, setSelectedOrg] = useState<SelectOption | undefined>()
  const [selectedProj, setSelectedProj] = useState<SelectOption | undefined>()
  const [selectedService, setSelectedService] = useState<SelectOption | undefined>()
  const activeServiceText = `${totalElements}`
  const [initialContent, setInitialContent] = useState<string>('')
  const timeValue = moment(content[0]?.timestamp).format('DD-MM-YYYY h:mm:ss')
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
  const formattedTime = moment(timeValue).format('MMM DD YYYY hh:mm:ss')
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
          <div>
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
          {licenseType === 'SERVICES' ? (
            <Layout.Vertical className={pageCss.badgesContainer}>
              <div className={cx(pageCss.badge, pageCss.runningExecutions)}>
                <Text className={pageCss.badgeText}>{activeServiceText}&nbsp;</Text>
                <String stringID={'common.subscriptions.usage.services'} />
                <Text>(</Text>
                <Text>{getString('common.lastUpdatedAt')} -</Text>
                <Text className={pageCss.badgeText}>{formattedTime}</Text>
                <Text>)</Text>
              </div>
            </Layout.Vertical>
          ) : null}
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
