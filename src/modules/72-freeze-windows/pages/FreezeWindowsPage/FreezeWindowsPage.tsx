/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import {
  Color,
  DropDown,
  ExpandingSearchInput,
  ExpandingSearchInputHandle,
  HarnessDocTooltip,
  Layout,
  Page,
  PageSpinner,
  Text
} from '@harness/uicore'
import { noop } from 'lodash-es'
import React from 'react'
import { useParams } from 'react-router-dom'
import { getScopeFromDTO } from '@common/components/EntityReference/EntityReference'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { useUpdateQueryParams } from '@common/hooks'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import { queryParamDecodeAll, useQueryParams } from '@common/hooks/useQueryParams'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getLinkForAccountResources } from '@common/utils/BreadcrumbUtils'
import { FreezeWindowListTable } from '@freeze-windows/components/FreezeWindowList/FreezeWindowListTable'
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE, DEFAULT_PIPELINE_LIST_TABLE_SORT } from '@pipeline/utils/constants'
import type { PartiallyRequired } from '@pipeline/utils/types'
import { useStrings } from 'framework/strings'
import { GetFreezeListQueryParams, useGetFreezeList } from 'services/cd-ng'
import { NewFreezeWindowButton } from './views/NewFreezeWindowButton/NewFreezeWindowButton'
import NoResultsView from './views/NoResultsView/NoResultsView'
import css from './FreezeWindowsPage.module.scss'

type ProcessedFreezeListPageQueryParams = PartiallyRequired<GetFreezeListQueryParams, 'page' | 'size' | 'sort'>
const queryParamOptions = {
  parseArrays: true,
  decoder: queryParamDecodeAll(),
  processQueryParams(params: GetFreezeListQueryParams): ProcessedFreezeListPageQueryParams {
    return {
      ...params,
      page: params.page ?? DEFAULT_PAGE_INDEX,
      size: params.size ?? DEFAULT_PAGE_SIZE,
      sort: params.sort ?? DEFAULT_PIPELINE_LIST_TABLE_SORT
    }
  }
}

export default function FreezeWindowsPage(): React.ReactElement {
  const { getString } = useStrings()
  const { projectIdentifier = 'defaultproject', orgIdentifier = 'default', accountId } = useParams<ProjectPathProps>()
  const searchRef = React.useRef<ExpandingSearchInputHandle>({} as ExpandingSearchInputHandle)
  const scope = getScopeFromDTO({ projectIdentifier, orgIdentifier, accountId })
  const { updateQueryParams, replaceQueryParams } = useUpdateQueryParams<Partial<GetFreezeListQueryParams>>()
  const queryParams = useQueryParams<ProcessedFreezeListPageQueryParams>(queryParamOptions)
  const { searchTerm, page, size, sort, status } = queryParams

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
    <>
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

      <Page.SubHeader className={css.freeeWindowsPageSubHeader}>
        <Layout.Horizontal spacing={'medium'}>
          <NewFreezeWindowButton />
          <DropDown
            value={status}
            onChange={() => {
              // todo
            }}
            items={[]}
            filterable={false}
            addClearBtn={true}
            placeholder={getString('all')}
            popoverClassName={css.dropdownPopover}
          />
        </Layout.Horizontal>
        <Layout.Horizontal spacing="small" style={{ alignItems: 'center' }}>
          <ExpandingSearchInput
            alwaysExpanded
            width={200}
            placeholder={getString('search')}
            onChange={text => {
              updateQueryParams({ searchTerm: text ?? undefined, page: DEFAULT_PAGE_INDEX })
            }}
            defaultValue={searchTerm}
            ref={searchRef}
            className={css.expandSearch}
          />
        </Layout.Horizontal>
      </Page.SubHeader>

      <Page.Body
        loading={loading}
        error={error?.message}
        className={css.freezeWindowsPageBody}
        retryOnError={() => refetch()}
      >
        {loading ? (
          <PageSpinner />
        ) : data?.data?.content?.length ? (
          <>
            <Text color={Color.GREY_800} font={{ weight: 'bold' }}>
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
          </>
        ) : (
          <NoResultsView
            hasSearchParam={!!searchTerm} //  || !!quick filter
            onReset={resetFilter}
            text={getString('freezeWindows.freezeWindowsPage.noFreezeWindows', { scope })}
          />
        )}
      </Page.Body>
    </>
  )
}
