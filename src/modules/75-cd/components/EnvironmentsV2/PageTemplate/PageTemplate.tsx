/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactNode, useMemo, PropsWithChildren, useState } from 'react'
import { useParams } from 'react-router-dom'
import { defaultTo } from 'lodash-es'

import {
  Page,
  FontVariation,
  Heading,
  HarnessDocTooltip,
  getErrorInfoFromErrorObject,
  Views,
  Container,
  Layout,
  ExpandingSearchInput,
  GridListToggle,
  Pagination,
  SelectOption,
  Text,
  DropDown
} from '@harness/uicore'
import { Color } from '@harness/design-system'

import { useStrings } from 'framework/strings'
import { FilterProperties, GetFilterListQueryParams, useGetFilterList } from 'services/cd-ng'

import RbacButton, { ButtonProps } from '@rbac/components/Button/Button'

import { useMutateAsGet, useQueryParams, useUpdateQueryParams } from '@common/hooks'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'

import { FilterContextProvider } from '@cd/context/FiltersContext'

import { usePageStore } from './PageContext'
import NoData from './NoData'
import { getHasFilterIdentifier, getHasFilters } from '../EnvironmentsFilters/filterUtils'

import css from './PageTemplate.module.scss'

interface CreateButtonProps {
  text: string
  dataTestid: string
  permission: ButtonProps['permission']
  onClick: () => void
}

export interface PageQueryParams {
  page?: number
  size?: number
  searchTerm?: string
  filterIdentifier?: string
  filters?: FilterProperties
}

export interface PageTemplateProps {
  title: string
  titleTooltipId?: string
  headerContent?: ReactNode
  headerToolbar?: ReactNode
  createButtonProps: CreateButtonProps
  useGetListHook: any
  emptyContent: ReactNode
  ListComponent: React.VoidFunctionComponent<{ response: any; refetch: () => void }>
  GridComponent: React.VoidFunctionComponent<{ response: any; refetch: () => void }>
  sortOptions: SelectOption[]
  defaultSortOption: string[]
  handleCustomSortChange: (value: string) => string[]
  filterType: GetFilterListQueryParams['type']
  FilterComponent: React.VoidFunctionComponent
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
  FilterComponent
}: PropsWithChildren<PageTemplateProps>) {
  useDocumentTitle(title)
  const { accountId, orgIdentifier, projectIdentifier, module } = useParams<ProjectPathProps & ModulePathParams>()

  const { view, setView } = usePageStore()
  const { getString } = useStrings()

  const [sort, setSort] = useState<string[]>(defaultSortOption)
  const [sortOption, setSortOption] = useState<SelectOption>(sortOptions[0])

  const { updateQueryParams, replaceQueryParams } = useUpdateQueryParams<Partial<PageQueryParams>>()

  const queryParams = useQueryParams<PageQueryParams>({
    processQueryParams(params: Partial<Record<keyof PageQueryParams, string>>) {
      let filtersInQueryParams = {}

      try {
        filtersInQueryParams = params.filters ? JSON.parse(params.filters) : undefined
      } catch (_e) {
        // do nothing
      }

      return {
        ...params,
        page: parseInt(params.page || '1', 10),
        size: parseInt(params.size || '10', 10),
        searchTerm: params.searchTerm,
        filters: filtersInQueryParams
      }
    }
  })

  const { page, size, searchTerm, filterIdentifier } = queryParams
  const hasFilterIdentifier = getHasFilterIdentifier(filterIdentifier)

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
    } else if (loading) {
      return STATUS.loading
    }

    return STATUS.ok
  }, [error, loading, STATUS])

  const handleSearchTermChange = (query: string) => {
    if (query) {
      updateQueryParams({ searchTerm: query })
    } else {
      updateQueryParams({ searchTerm: [] as any }) // removes the param
    }
  }

  const handleSortChange = (item: SelectOption) => {
    const sortValue = handleCustomSortChange(item.value as string)
    setSort(sortValue)
    setSortOption(item)
  }

  const handlePageIndexChange = /* istanbul ignore next */ (index: number) => updateQueryParams({ page: index + 1 })

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
    replaceQueryParams({})
  }

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
          <RbacButton
            intent="primary"
            icon="plus"
            iconProps={{ size: 12 }}
            font={{ weight: 'bold' }}
            {...createButtonProps}
          />
          <Layout.Horizontal flex={{ justifyContent: 'flex-end', alignItems: 'center' }}>
            <ExpandingSearchInput
              alwaysExpanded
              width={200}
              placeholder={getString('search')}
              onChange={handleSearchTermChange}
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
                    <ListComponent response={response} refetch={refetch} />
                  </Container>
                ) : (
                  <GridComponent response={response} refetch={refetch} />
                )
              ) : null}
            </>
          ) : null}
        </div>

        {state === STATUS.ok && (
          <div className={css.footer}>
            <Pagination
              itemCount={defaultTo(data?.data?.totalItems, 0)}
              pageSize={defaultTo(data?.data?.pageSize, 0)}
              pageCount={defaultTo(data?.data?.totalPages, 0)}
              pageIndex={defaultTo(data?.data?.pageIndex, 0)}
              gotoPage={handlePageIndexChange}
            />
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
