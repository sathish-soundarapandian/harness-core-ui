/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactNode, useMemo, PropsWithChildren, useState, useRef } from 'react'
import { flushSync } from 'react-dom'
import { useParams } from 'react-router-dom'
import { defaultTo } from 'lodash-es'

import {
  Page,
  Heading,
  HarnessDocTooltip,
  getErrorInfoFromErrorObject,
  Views,
  Container,
  Layout,
  ExpandingSearchInput,
  ExpandingSearchInputHandle,
  GridListToggle,
  Pagination,
  SelectOption,
  Text,
  DropDown,
  useToaster
} from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'

import { useStrings } from 'framework/strings'
import { GetFilterListQueryParams, useGetFilterList, useGetSettingValue } from 'services/cd-ng'

import { useMutateAsGet, useQueryParams, useUpdateQueryParams } from '@common/hooks'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useDefaultPaginationProps } from '@common/hooks/useDefaultPaginationProps'
import { SettingType } from '@common/constants/Utils'

import RbacButton, { ButtonProps } from '@rbac/components/Button/Button'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'

import { FilterContextProvider } from '@cd/context/FiltersContext'

import { usePageStore } from './PageContext'
import NoData from './NoData'
import { getHasFilterIdentifier, getHasFilters } from '../EnvironmentsFilters/filterUtils'
import {
  PageQueryParams,
  PageQueryParamsWithDefaults,
  PAGE_TEMPLATE_DEFAULT_PAGE_INDEX,
  usePageQueryParamOptions
} from './utils'

import css from './PageTemplate.module.scss'

interface CreateButtonProps {
  text: string
  dataTestid: string
  permission: ButtonProps['permission']
  onClick: () => void
}

export interface PageTemplateProps {
  title: string
  titleTooltipId?: string
  headerContent?: ReactNode
  headerToolbar?: ReactNode
  createButtonProps: CreateButtonProps
  useGetListHook: any
  emptyContent: ReactNode
  ListComponent: React.VoidFunctionComponent<{ response: any; refetch: () => void; isForceDeleteEnabled: boolean }>
  GridComponent: React.VoidFunctionComponent<{ response: any; refetch: () => void; isForceDeleteEnabled: boolean }>
  sortOptions: SelectOption[]
  defaultSortOption: string[]
  handleCustomSortChange: (value: string) => string[]
  filterType: GetFilterListQueryParams['type']
  FilterComponent: React.VoidFunctionComponent
  isForceDeleteAllowed?: boolean
}

export default function PageTemplate({
  title,
  titleTooltipId,
  headerContent,
  headerToolbar,
  createButtonProps,
  useGetListHook,
  emptyContent,
  ListComponent,
  GridComponent,
  sortOptions,
  defaultSortOption,
  handleCustomSortChange,
  filterType,
  FilterComponent,
  isForceDeleteAllowed
}: PropsWithChildren<PageTemplateProps>): JSX.Element {
  useDocumentTitle(title)
  const { accountId, orgIdentifier, projectIdentifier, module } = useParams<ProjectPathProps & ModulePathParams>()

  const { view, setView } = usePageStore()
  const { getString } = useStrings()
  const { getRBACErrorMessage } = useRBACError()
  const { showError } = useToaster()

  const [sort, setSort] = useState<string[]>(defaultSortOption)
  const [sortOption, setSortOption] = useState<SelectOption>(sortOptions[0])

  const { updateQueryParams, replaceQueryParams } = useUpdateQueryParams<Partial<PageQueryParams>>()
  const queryParamOptions = usePageQueryParamOptions()
  const queryParams = useQueryParams<PageQueryParamsWithDefaults>(queryParamOptions)
  const { page, size, searchTerm, filterIdentifier } = queryParams

  const searchRef = useRef<ExpandingSearchInputHandle>()

  const hasFilterIdentifier = getHasFilterIdentifier(filterIdentifier)

  const {
    data: forceDeleteSettings,
    loading: forceDeleteSettingsLoading,
    error: forceDeleteSettingsError
  } = useGetSettingValue({
    identifier: SettingType.ENABLE_FORCE_DELETE,
    queryParams: {
      accountIdentifier: accountId
    },
    lazy: !isForceDeleteAllowed
  })

  React.useEffect(() => {
    if (forceDeleteSettingsError) {
      showError(getRBACErrorMessage(forceDeleteSettingsError))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceDeleteSettingsError])

  const isForceDeleteEnabled = useMemo(
    () => forceDeleteSettings?.data?.value == 'true',
    [forceDeleteSettings?.data?.value]
  )

  const { data, loading, error, refetch } = useMutateAsGet(useGetListHook, {
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      size,
      page: page ? page - 1 : 0,
      searchTerm,
      sort,
      filterIdentifier: hasFilterIdentifier ? filterIdentifier : undefined
    },
    queryParamStringifyOptions: {
      arrayFormat: 'comma'
    },
    body: hasFilterIdentifier
      ? null
      : {
          ...queryParams.filters,
          filterType: 'Environment'
        }
  })

  const response = data?.data
  const hasData = Boolean(!loading && response && !response.empty)
  const noData = Boolean(!loading && response?.empty)

  enum STATUS {
    'loading',
    'error',
    'ok'
  }

  const state = useMemo<STATUS>(() => {
    if (error) {
      return STATUS.error
    } else if (loading || forceDeleteSettingsLoading) {
      return STATUS.loading
    }

    return STATUS.ok
  }, [error, loading, STATUS])

  const handleSearchTermChange = (query: string): void => {
    if (query) {
      updateQueryParams({ searchTerm: query, page: PAGE_TEMPLATE_DEFAULT_PAGE_INDEX })
    } else {
      updateQueryParams({ searchTerm: undefined })
    }
  }

  const handleSortChange = (item: SelectOption): void => {
    const sortValue = handleCustomSortChange(item.value as string)
    setSort(sortValue)
    setSortOption(item)
  }

  const handlePageIndexChange = /* istanbul ignore next */ (index: number): void =>
    updateQueryParams({ page: index + 1 })

  const {
    data: filterData,
    loading: isFetchingFilters,
    refetch: refetchFilters
  } = useGetFilterList({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      type: filterType
    }
  })

  const filters = filterData?.data?.content || []

  const hasFilters = getHasFilters({
    queryParams,
    filterIdentifier
  })

  const clearFilters = (): void => {
    flushSync(() => searchRef.current?.clear())
    replaceQueryParams({})
  }

  const paginationProps = useDefaultPaginationProps({
    itemCount: defaultTo(data?.data?.totalItems, 0),
    pageSize: defaultTo(data?.data?.pageSize, 0),
    pageCount: defaultTo(data?.data?.totalPages, 0),
    pageIndex: defaultTo(data?.data?.pageIndex, 0),
    gotoPage: handlePageIndexChange,
    onPageSizeChange: newSize => updateQueryParams({ page: PAGE_TEMPLATE_DEFAULT_PAGE_INDEX, size: newSize })
  })

  return (
    <FilterContextProvider
      savedFilters={filters}
      isFetchingFilters={isFetchingFilters}
      refetchFilters={refetchFilters}
      queryParams={queryParams}
    >
      <main className={css.layout}>
        <Page.Header
          title={
            <Heading level={3} font={{ variation: FontVariation.H4 }} data-tooltip-id={titleTooltipId}>
              {title}
              <HarnessDocTooltip tooltipId={titleTooltipId} useStandAlone />
            </Heading>
          }
          breadcrumbs={<NGBreadcrumbs customPathParams={{ module }} />}
          className={css.header}
          content={headerContent}
          toolbar={headerToolbar}
        />
        <Page.SubHeader className={css.toolbar}>
          <RbacButton intent="primary" icon="plus" font={{ weight: 'bold' }} {...createButtonProps} />
          <Layout.Horizontal flex={{ justifyContent: 'flex-end', alignItems: 'center' }}>
            <ExpandingSearchInput
              alwaysExpanded
              width={200}
              placeholder={getString('search')}
              onChange={handleSearchTermChange}
              ref={searchRef}
            />
            <FilterComponent />
            <GridListToggle initialSelectedView={Views.LIST} onViewToggle={setView} />
          </Layout.Horizontal>
        </Page.SubHeader>

        <div className={css.content}>
          {state === STATUS.error && (
            <Page.Error message={getErrorInfoFromErrorObject(defaultTo(error, {}))} onClick={refetch} />
          )}
          {state === STATUS.ok && !noData && (
            <Layout.Horizontal
              flex={{ justifyContent: 'space-between' }}
              padding={{ top: 'large', right: 'xlarge', left: 'xlarge' }}
            >
              <Text color={Color.GREY_800} iconProps={{ size: 14 }}>
                {getString('total')}: {response?.totalItems}
              </Text>
              <DropDown
                items={sortOptions}
                value={sortOption.value.toString()}
                filterable={false}
                width={180}
                icon={'main-sort'}
                iconProps={{ size: 16, color: Color.GREY_400 }}
                onChange={handleSortChange}
              />
            </Layout.Horizontal>
          )}
          {state === STATUS.ok ? (
            <>
              {noData && (
                <NoData
                  searchTerm={searchTerm}
                  hasFilters={hasFilters}
                  emptyContent={emptyContent}
                  clearFilters={clearFilters}
                />
              )}
              {hasData ? (
                view === Views.LIST ? (
                  <Container padding={{ top: 'medium', right: 'xlarge', left: 'xlarge' }}>
                    <ListComponent response={response} refetch={refetch} isForceDeleteEnabled={isForceDeleteEnabled} />
                  </Container>
                ) : (
                  <GridComponent response={response} refetch={refetch} isForceDeleteEnabled={isForceDeleteEnabled} />
                )
              ) : null}
            </>
          ) : null}
        </div>

        {state === STATUS.ok && (
          <div className={css.footer}>
            <Pagination {...paginationProps} />
          </div>
        )}

        {state === STATUS.loading && !error && (
          <div className={css.loading}>
            <ContainerSpinner />
          </div>
        )}
      </main>
    </FilterContextProvider>
  )
}
