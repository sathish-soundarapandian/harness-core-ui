/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState } from 'react'
import type { Column } from 'react-table'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import { Text, TableV2, Layout, Card, Heading, NoDataCard, DropDown, SelectOption, PageSpinner } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import moment from 'moment'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { String, useStrings, StringKeys } from 'framework/strings'
import { PageActiveServiceDTO, LicenseUsageDTO, useGetProjectList, useGetOrganizationList } from 'services/cd-ng'
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

enum OrgFilter {
  ALL = '$$ALL$$'
}
const DEFAULT_PAGE_INDEX = 0
const DEFAULT_PAGE_SIZE = 30
export interface ServiceLicenseTableProps {
  data: PageActiveServiceDTO
  gotoPage: (pageNumber: number) => void
  setSortBy: (sortBy: string[]) => void
  sortBy: string[]
  updateFilters: (orgId: string, projId: string) => void
  servicesLoading: boolean
}

export function ServiceLicenseTable({
  data,
  gotoPage,
  sortBy,
  setSortBy,
  updateFilters,
  servicesLoading
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
      {
        Header: NameHeader('common.licensesConsumed'),
        accessor: 'licensesConsumed',
        width: '15%',
        Cell: LicenseConsumedCell,
        serverSortProps: getServerSortProps('licensesConsumed')
      }
    ] as unknown as Column<LicenseUsageDTO>[]
  }, [currentOrder, currentSort])
  const { accountId } = useParams<AccountPathProps>()
  const [orgName, setOrgName] = useState<string>('')
  const [projName, setProjName] = useState<string>('')
  const activeServiceText = `${totalElements}`
  const timeValue = moment(content[0]?.timestamp).format('DD-MM-YYYY h:mm:ss')
  const { data: projectListData, loading: projLoading } = useGetProjectList({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const allOrgsSelectOption: SelectOption = useMemo(
    () => ({
      label: getString('all'),
      value: OrgFilter.ALL
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )
  const { data: orgsData, loading: orgLoading } = useGetOrganizationList({
    queryParams: {
      accountIdentifier: accountId
    }
  })
  const projectsMapped: SelectOption[] = useMemo(() => {
    return [
      allOrgsSelectOption,
      ...(projectListData?.data?.content?.map(proj => {
        return {
          label: proj.project.name,
          value: proj.project.identifier
        }
      }) || [])
    ]
  }, [projectListData?.data?.content, allOrgsSelectOption])
  const organizations: SelectOption[] = useMemo(() => {
    return [
      allOrgsSelectOption,
      ...(orgsData?.data?.content?.map(org => {
        return {
          label: org.organization.name,
          value: org.organization.identifier
        }
      }) || [])
    ]
  }, [orgsData?.data?.content, allOrgsSelectOption])
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
              <Text>&nbsp;{getString('auditTrail.actions.updated')} -</Text>
              <Text className={pageCss.badgeText}>{timeValue}</Text>
            </div>
          </Layout.Vertical>
          <Layout.Vertical>
            <DropDown
              disabled={orgLoading}
              filterable={false}
              className={pageCss.orgDropdown}
              items={organizations}
              value={orgName || OrgFilter.ALL}
              onChange={item => {
                if (item.value === OrgFilter.ALL) {
                  setOrgName(OrgFilter.ALL)
                } else {
                  setOrgName(item.value as string)
                }
              }}
              getCustomLabel={item => getString('common.tabOrgs', { name: item.label })}
            />
          </Layout.Vertical>
          <DropDown
            disabled={projLoading}
            filterable={false}
            className={pageCss.orgDropdown}
            items={projectsMapped}
            value={projName || OrgFilter.ALL}
            onChange={item => {
              if (item.value === OrgFilter.ALL) {
                setProjName(OrgFilter.ALL)
              } else {
                setProjName(item.value as string)
              }
            }}
            getCustomLabel={item => getString('common.tabProjects', { name: item.label })}
          />
          <Text
            className={pageCss.fetchButton}
            font={{ variation: FontVariation.LEAD }}
            color={Color.PRIMARY_7}
            lineClamp={1}
            onClick={() => {
              updateFilters(orgName, projName)
            }}
          >
            Fetch
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
