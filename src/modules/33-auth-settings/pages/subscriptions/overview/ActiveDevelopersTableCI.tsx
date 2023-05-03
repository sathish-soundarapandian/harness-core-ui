/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import type { Column } from 'react-table'
import { Text, Layout, Card, Heading, NoDataCard, SelectOption, PageSpinner } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import OrgDropdown from '@common/OrgDropdown/OrgDropdown'
import ProjectDropdown from '@common/ProjectDropdown/ProjectDropdown'
import DeveloperDropdown from '@common/DeveloperDropdown/DeveloperDropdown'
import type { PageActiveServiceDTO, LicenseUsageDTO } from 'services/cd-ng'
import type { SortBy } from './types'
import { DeveloperNameCell, OrganizationCell, ProjectCell, LastBuildCell } from './CIusageTableCells'
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE, tableV2, NameHeader } from './ServiceLicenseTable'
import pageCss from '../SubscriptionsPage.module.scss'

export interface ActiveDevelopersTableCIProps {
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
}: ActiveDevelopersTableCIProps): React.ReactElement {
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
        isServerSortedDesc: currentOrder === 'ASC',
        getSortedColumn: ({ sort }: SortBy) => {
          setSortBy([sort, currentOrder === 'ASC' ? 'DESC' : 'ASC'])
        }
      }
    }
    return [
      {
        Header: NameHeader(getString, 'common.purpose.developer'),
        accessor: 'name',
        width: '14%',
        disableSortBy: true,
        Cell: DeveloperNameCell
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
        Header: NameHeader(getString, 'common.lastBuildDate'),
        accessor: 'lastBuild',
        width: '12%',
        Cell: LastBuildCell,
        serverSortProps: getServerSortProps('common.lastBuild')
      }
    ] as unknown as Column<LicenseUsageDTO>[]
  }, [currentOrder, currentSort])
  const [selectedOrg, setSelectedOrg] = useState<SelectOption | undefined>()
  const [selectedProj, setSelectedProj] = useState<SelectOption | undefined>()
  const [selectedDeveloper, setSelectedDeveloper] = useState<SelectOption | undefined>()

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
          tableV2(columns, content, totalElements, size, totalPages, number, gotoPage)
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
