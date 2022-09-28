/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Color, HarnessDocTooltip, Page, PageSpinner, Text } from '@harness/uicore'
import { noop } from 'lodash-es'
import React from 'react'
import { useParams } from 'react-router-dom'
import { getScopeFromDTO } from '@common/components/EntityReference/EntityReference'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { useUpdateQueryParams } from '@common/hooks'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import { useQueryParams } from '@common/hooks/useQueryParams'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getLinkForAccountResources } from '@common/utils/BreadcrumbUtils'
import { FreezeWindowListTable } from '@freeze-windows/components/FreezeWindowList/FreezeWindowListTable'
import { useStrings } from 'framework/strings'
import { GetFreezeListQueryParams, useGetFreezeList } from 'services/cd-ng'
import { NoResultsView } from '@freeze-windows/components/NoResultsView/NoResultsView'
import {
  FreezeWindowSubHeader,
  ProcessedFreezeListPageQueryParams,
  queryParamOptions
} from '@freeze-windows/components/FreezeWindowSubHeader/FreezeWindowSubHeader'
import css from './FreezeWindowsPage.module.scss'

export default function FreezeWindowsPage(): React.ReactElement {
  const { getString } = useStrings()
  const { projectIdentifier = 'defaultproject', orgIdentifier = 'default', accountId } = useParams<ProjectPathProps>()
  const scope = getScopeFromDTO({ projectIdentifier, orgIdentifier, accountId })
  const { updateQueryParams, replaceQueryParams } = useUpdateQueryParams<Partial<GetFreezeListQueryParams>>()
  const queryParams = useQueryParams<ProcessedFreezeListPageQueryParams>(queryParamOptions)
  const { searchTerm, page, size, sort } = queryParams

  const resetFilter = (): void => {
    replaceQueryParams({})
  }

  const { data, error, loading, refetch } = useGetFreezeList({
    queryParams: {
      page,
      size,
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      searchTerm,
      sort
    }
  })

  useDocumentTitle([getString('common.freezeWindows')])

  return (
    <div className={css.main}>
      <Page.Header
        title={
          <div className="ng-tooltip-native">
            <h2 data-tooltip-id="freezeWindowsPageHeading"> {getString('common.freezeWindows')}</h2>
            <HarnessDocTooltip tooltipId="freezeWindowsPageHeading" useStandAlone={true} />
          </div>
        }
        breadcrumbs={
          <NGBreadcrumbs
            links={getLinkForAccountResources({ accountId, orgIdentifier, projectIdentifier, getString })}
          />
        }
      />

      <Page.SubHeader className={css.freezeWindowsPageSubHeader}>
        <FreezeWindowSubHeader />
      </Page.SubHeader>

      <Page.Body loading={loading} error={error?.message} retryOnError={() => refetch()}>
        {loading ? (
          <PageSpinner />
        ) : data?.data?.content?.length ? (
          <div className={css.listView}>
            <Text color={Color.GREY_800} font={{ weight: 'bold' }} margin={{ bottom: 'large' }}>
              {`${getString('total')}: ${data?.data?.totalItems}`}
            </Text>
            <FreezeWindowListTable
              gotoPage={pageNumber => updateQueryParams({ page: pageNumber })}
              data={data?.data}
              onViewFreezeWindow={noop}
              onDeleteFreezeWindow={noop}
              getViewFreezeWindowLink={() => ''}
              setSortBy={sortArray => {
                updateQueryParams({ sort: sortArray })
              }}
              sortBy={sort}
            />
          </div>
        ) : (
          <NoResultsView
            hasSearchParam={!!searchTerm} //  || !!quick filter
            onReset={resetFilter}
            text={getString('freezeWindows.freezeWindowsPage.noFreezeWindows', { scope })}
          />
        )}
      </Page.Body>
    </div>
  )
}
