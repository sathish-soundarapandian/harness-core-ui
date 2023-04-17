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
import DeveloperDropdown from '@common/DeveloperDropdown/DeveloperDropdown'

import type { SortBy } from './types'
import { DeveloperNameCell, OrganizationCell, ProjectCell, LastBuildCell } from './CIusageTableCells'
import { getInfoIcon } from './UsageInfoCard'
import pageCss from '../SubscriptionsPage.module.scss'

const DEFAULT_PAGE_INDEX = 0
const DEFAULT_PAGE_SIZE = 10
export interface ActiveDevelopersTableCI {
  data: PageActiveServiceDTO
  gotoPage: (pageNumber: number) => void
  setSortBy: (sortBy: string[]) => void
  sortBy: string[]
  updateFilters: (
    orgId: SelectOption | undefined,
    projId: SelectOption | undefined,
    developerId: SelectOption | undefined
  ) => void
  servicesLoading: boolean
}

export function ActiveDevelopersTableCI({
  data,
  gotoPage,
  sortBy,
  setSortBy,
  updateFilters,
  servicesLoading
}: ActiveDevelopersTableCI): React.ReactElement {
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
        Header: NameHeader('common.purpose.developer'),
        accessor: 'name',
        width: '14%',
        disableSortBy: true,
        Cell: DeveloperNameCell
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
        Header: NameHeader('common.lastBuildDate'),
        accessor: 'lastBuildDate',
        width: '12%',
        Cell: LastBuildCell,
        serverSortProps: getServerSortProps('common.lastBuildDate')
      }
    ] as unknown as Column<LicenseUsageDTO>[]
  }, [currentOrder, currentSort])
  const [selectedOrg, setSelectedOrg] = useState<SelectOption | undefined>()
  const [selectedProj, setSelectedProj] = useState<SelectOption | undefined>()
  const [selectedDeveloper, setSelectedDeveloper] = useState<SelectOption | undefined>()
  const timeValue = moment(content[0]?.timestamp).format('DD-MM-YYYY h:mm:ss')

  const formattedTime = moment(timeValue).format('MMM DD YYYY hh:mm:ss')
  return (
    <Card className={pageCss.outterCard}>
      <Layout.Vertical spacing="xxlarge" flex={{ alignItems: 'stretch' }}>
        <Layout.Horizontal spacing="small" flex={{ justifyContent: 'space-between' }} width={'100%'}>
          <Layout.Vertical>
            <Heading color={Color.BLACK} font={{ size: 'medium' }}>
              {getString('common.subscriptions.usage.activeDevelopers')}
            </Heading>
          </Layout.Vertical>
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
          <DeveloperDropdown
            value={selectedDeveloper}
            className={pageCss.orgDropdown}
            onChange={developer => {
              setSelectedDeveloper(developer)
            }}
          />
          <Text
            className={pageCss.fetchButton}
            font={{ variation: FontVariation.LEAD }}
            color={Color.PRIMARY_7}
            onClick={() => {
              updateFilters(selectedOrg, selectedProj, selectedDeveloper)
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
            message={getString('common.noActiveDeveloperData')}
            className={pageCss.noDataCard}
            containerClassName={pageCss.noDataCardContainer}
          />
        )}
      </Layout.Vertical>
    </Card>
  )
}
