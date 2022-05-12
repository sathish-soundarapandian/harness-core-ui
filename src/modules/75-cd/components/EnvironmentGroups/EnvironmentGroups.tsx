/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import { defaultTo } from 'lodash-es'

import {
  ButtonVariation,
  Dialog,
  ExpandingSearchInput,
  HarnessDocTooltip,
  Heading,
  Page,
  SelectOption,
  Container,
  Layout,
  Text,
  DropDown,
  Pagination,
  getErrorInfoFromErrorObject
} from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useModalHook } from '@harness/use-modal'
import { useStrings } from 'framework/strings'
import { GetEnvironmentGroupListQueryParams, useGetEnvironmentGroupList, useGetFilterList } from 'services/cd-ng'

import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'

import { useMutateAsGet, useQueryParams, useUpdateQueryParams } from '@common/hooks'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'

import { FilterContextProvider } from '@cd/context/FiltersContext'

import CreateEnvironmentGroupModal from './CreateEnvironmentGroupModal'
import EnvironmentGroupsList from './EnvironmentGroupsList/EnvironmentGroupsList'
import NoEnvironmentGroups from './NoEnvironmentGroups'
import EnvironmentTabs from '../EnvironmentsV2/EnvironmentTabs'
import { EnvironmentGroupsFilters } from './EnvironmentGroupsFilters/EnvironmentGroupsFilters'
import { getHasFilterIdentifier, getHasFilters } from './EnvironmentGroupsFilters/filterUtils'
import { EnvironmentGroupListQueryParams, Sort, SortFields } from './utils'

import css from './EnvironmentGroups.module.scss'

export default function EnvironmentGroupsPage(): React.ReactElement {
  const { accountId, orgIdentifier, projectIdentifier, module } = useParams<ProjectPathProps & ModulePathParams>()
  const { getString } = useStrings()

  /* #region Sort changes */
  const sortOptions: SelectOption[] = [
    {
      label: getString('lastUpdatedSort'),
      value: SortFields.LastUpdatedAt
    },
    {
      label: getString('AZ09'),
      value: SortFields.AZ09
    },
    {
      label: getString('ZA90'),
      value: SortFields.ZA90
    }
  ]
  const [sort, setSort] = useState<string[]>([SortFields.LastUpdatedAt, Sort.DESC])
  const [sortOption, setSortOption] = useState<SelectOption>(sortOptions[0])

  const handleSortChange = (item: SelectOption) => {
    const sortArray =
      item.value === SortFields.AZ09
        ? [SortFields.Name, Sort.ASC]
        : item.value === SortFields.ZA90
        ? [SortFields.Name, Sort.DESC]
        : [SortFields.LastUpdatedAt, Sort.DESC]
    setSort(sortArray)
    setSortOption(item)
  }
  /* #endregion */

  const handleSearchTermChange = (query: string) => {
    if (query) {
      updateQueryParams({ searchTerm: query })
    } else {
      updateQueryParams({ searchTerm: [] as any }) // removes the param
    }
  }

  const handlePageIndexChange = /* istanbul ignore next */ (index: number) => updateQueryParams({ page: index + 1 })

  const queryParams = useQueryParams<EnvironmentGroupListQueryParams>({
    processQueryParams(params: Partial<Record<keyof EnvironmentGroupListQueryParams, string>>) {
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

  const { updateQueryParams, replaceQueryParams } = useUpdateQueryParams<Partial<GetEnvironmentGroupListQueryParams>>()

  const { page, size, filterIdentifier, searchTerm } = queryParams
  const hasFilterIdentifier = getHasFilterIdentifier(filterIdentifier)

  const { data, loading, refetch, error } = useMutateAsGet(useGetEnvironmentGroupList, {
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      size,
      page: page ? page - 1 : 0,
      filterIdentifier: hasFilterIdentifier ? filterIdentifier : undefined,
      searchTerm,
      sort
    },
    queryParamStringifyOptions: {
      arrayFormat: 'comma'
    },
    body: hasFilterIdentifier
      ? null
      : {
          ...queryParams.filters,
          filterType: 'EnvironmentGroup'
        }
  })

  const {
    data: filterData,
    loading: isFetchingFilters,
    refetch: refetchFilters
  } = useGetFilterList({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      type: 'EnvironmentGroup'
    }
  })

  const response = data?.data
  const hasContent = Boolean(!loading && !response?.empty)
  const emptyContent = Boolean(!loading && response?.empty)
  const filters = filterData?.data?.content || []

  const hasFilters = getHasFilters({
    queryParams,
    filterIdentifier
  })

  const clearFilters = (): void => {
    replaceQueryParams({})
  }

  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen={true}
        enforceFocus={false}
        canEscapeKeyClose
        canOutsideClickClose
        onClose={hideModal}
        title={getString('common.environmentGroup.createNew')}
        isCloseButtonShown
        className={cx('padded-dialog', css.dialogStyles)}
      >
        <CreateEnvironmentGroupModal closeModal={hideModal} />
      </Dialog>
    ),
    [orgIdentifier, projectIdentifier]
  )

  return (
    <FilterContextProvider
      savedFilters={filters}
      isFetchingFilters={isFetchingFilters}
      refetchFilters={refetchFilters}
      queryParams={queryParams}
    >
      <Page.Header
        size={'standard'}
        breadcrumbs={<NGBreadcrumbs customPathParams={{ module }} />}
        title={
          <Heading level={4} font={{ variation: FontVariation.H4 }} data-tooltip-id={'ff_env_group_heading'}>
            {getString('common.environmentGroups.label')}
            <HarnessDocTooltip tooltipId={'ff_env_group_heading'} useStandAlone />
          </Heading>
        }
        toolbar={<EnvironmentTabs />}
      />
      <Page.SubHeader>
        <RbacButton
          variation={ButtonVariation.PRIMARY}
          data-testid="add-environment-group"
          icon="plus"
          text={getString('common.environmentGroup.new')}
          onClick={showModal}
          permission={{
            permission: PermissionIdentifier.EDIT_ENVIRONMENT_GROUP,
            resource: {
              resourceType: ResourceType.ENVIRONMENT_GROUP
            }
          }}
        />
        <Layout.Horizontal spacing={'small'} flex={{ alignItems: 'center' }}>
          <ExpandingSearchInput
            defaultValue={queryParams.searchTerm}
            alwaysExpanded
            width={200}
            placeholder={getString('search')}
            onChange={handleSearchTermChange}
          />
          <EnvironmentGroupsFilters />
        </Layout.Horizontal>
      </Page.SubHeader>
      <Page.Body
        error={getErrorInfoFromErrorObject(error as any)}
        retryOnError={/*istanbul ignore next*/ () => refetch()}
        loading={loading}
      >
        {hasContent && (
          <Container padding={{ top: 'medium', right: 'xlarge', left: 'xlarge' }}>
            <Layout.Horizontal flex={{ justifyContent: 'space-between' }}>
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
            <EnvironmentGroupsList environmentGroups={response?.content} refetch={refetch} />
            <Pagination
              itemCount={defaultTo(response?.totalItems, 0)}
              pageSize={defaultTo(response?.pageSize, 10)}
              pageCount={defaultTo(response?.totalPages, -1)}
              pageIndex={defaultTo(response?.pageIndex, 0)}
              gotoPage={handlePageIndexChange}
            />
          </Container>
        )}
        {emptyContent && (
          <NoEnvironmentGroups
            searchTerm={searchTerm}
            hasFilters={hasFilters}
            clearFilters={clearFilters}
            showModal={showModal}
          />
        )}
      </Page.Body>
    </FilterContextProvider>
  )
}
