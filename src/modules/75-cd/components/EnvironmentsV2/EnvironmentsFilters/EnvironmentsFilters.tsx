/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import type { FormikProps } from 'formik'
import { isEmpty, pick } from 'lodash-es'

import type { SelectOption, MultiSelectOption} from '@harness/uicore';
import { useToaster, Layout } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type {
  FilterDTO} from 'services/cd-ng';
import {
  usePostFilter,
  useUpdateFilter,
  useDeleteFilter,
  useGetEnvironmentListForProject
} from 'services/cd-ng'

import { StringUtils } from '@common/exports'
import { useBooleanStatus, useUpdateQueryParams } from '@common/hooks'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { FilterRef } from '@common/components/Filter/Filter';
import { Filter } from '@common/components/Filter/Filter'
import type { CrudOperation } from '@common/components/Filter/FilterCRUD/FilterCRUD'
import {
  isObjectEmpty,
  UNSAVED_FILTER,
  removeNullAndEmpty,
  flattenObject
} from '@common/components/Filter/utils/FilterUtils'
import type { FilterInterface, FilterDataInterface } from '@common/components/Filter/Constants'
import FilterSelector from '@common/components/Filter/FilterSelector/FilterSelector'

import { useFiltersContext } from '@cd/context/FiltersContext'

import EnvironmentsFilterForm from './EnvironmentsFilterForm'
import type {
  EnvironmentsFilterFormType} from './filterUtils';
import {
  createRequestBodyPayload,
  getFilterByIdentifier,
  getMultiSelectFromOptions
} from './filterUtils'
import type { PageQueryParams} from '../PageTemplate/utils';
import { PAGE_TEMPLATE_DEFAULT_PAGE_INDEX } from '../PageTemplate/utils'

const UNSAVED_FILTER_IDENTIFIER = StringUtils.getIdentifierFromName(UNSAVED_FILTER)

export default function EnvironmentsFilters(): React.ReactElement {
  const [loading, setLoading] = React.useState(false)
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { state: isFiltersDrawerOpen, open: openFilterDrawer, close: hideFilterDrawer } = useBooleanStatus()
  const { getString } = useStrings()
  const { showError } = useToaster()
  const { updateQueryParams, replaceQueryParams } = useUpdateQueryParams<Partial<PageQueryParams>>()
  const filterRef = React.useRef<FilterRef<FilterDTO> | null>(null)
  const { savedFilters: filters, isFetchingFilters, refetchFilters, queryParams } = useFiltersContext()

  const { mutate: createFilter } = usePostFilter({
    queryParams: { accountIdentifier: accountId }
  })

  const { mutate: updateFilter } = useUpdateFilter({
    queryParams: { accountIdentifier: accountId }
  })

  const { mutate: deleteFilter } = useDeleteFilter({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      type: 'Environment'
    }
  })

  const { data: environmentsResponse, loading: isFetchingEnvironments } = useGetEnvironmentListForProject({
    queryParams: { accountId, orgIdentifier, projectIdentifier },
    lazy: isFiltersDrawerOpen
  })

  const appliedFilter =
    queryParams.filterIdentifier && queryParams.filterIdentifier !== UNSAVED_FILTER_IDENTIFIER
      ? getFilterByIdentifier(queryParams.filterIdentifier, filters)
      : queryParams.filters && !isEmpty(queryParams.filters)
      ? {
          name: UNSAVED_FILTER,
          identifier: UNSAVED_FILTER_IDENTIFIER,
          filterProperties: queryParams.filters,
          filterVisibility: undefined
        }
      : null

  const { environmentNames, description, tags, environmentTypes, environmentIdentifiers } =
    (appliedFilter?.filterProperties as EnvironmentsFilterFormType) || {}
  const { name = '', filterVisibility, identifier = '' } = appliedFilter || {}
  const fieldToLabelMapping = React.useMemo(
    () =>
      new Map<string, string>([
        ['environmentNames', getString('cd.environment.filters.environmentNamePlaceholder')],
        ['description', getString('description')],
        ['environmentTags', getString('tagsLabel')],
        ['environmentTypes', getString('envType')],
        ['environmentIdentifiers', getString('environments')]
      ]),
    [getString]
  )

  const filterWithValidFields = removeNullAndEmpty(
    pick(flattenObject(appliedFilter?.filterProperties || {}), ...fieldToLabelMapping.keys())
  )

  const handleFilterSelection = (
    option: SelectOption,
    event?: React.SyntheticEvent<HTMLElement, Event> | undefined
  ): void => {
    event?.stopPropagation()
    event?.preventDefault()

    updateQueryParams({
      filterIdentifier: option.value ? option.value.toString() : undefined,
      filters: undefined,
      page: PAGE_TEMPLATE_DEFAULT_PAGE_INDEX
    })
  }

  const onApply = (inputFormData: FormikProps<EnvironmentsFilterFormType>['values']): void => {
    if (!isObjectEmpty(inputFormData)) {
      const filterFromFormData = {
        ...(inputFormData.environmentName && {
          environmentNames: [inputFormData.environmentName]
        }),
        ...(inputFormData.description && {
          description: inputFormData.description
        }),
        ...(inputFormData.environmentTags && {
          tags: inputFormData.environmentTags
        }),
        ...(inputFormData.environmentTypes && {
          environmentTypes: inputFormData.environmentTypes?.map((environmentType: any) => environmentType?.value)
        }),
        ...(inputFormData.environments?.length && {
          environmentIdentifiers: inputFormData.environments?.map((env: MultiSelectOption) => env?.value)
        })
      }
      updateQueryParams({ page: undefined, filterIdentifier: undefined, filters: filterFromFormData })
      hideFilterDrawer()
    } else {
      showError(getString('filters.invalidCriteria'))
    }
  }

  const handleSaveOrUpdate = async (
    isUpdate: boolean,
    data: FilterDataInterface<EnvironmentsFilterFormType, FilterInterface>
  ): Promise<void> => {
    setLoading(true)
    const requestBodyPayload = createRequestBodyPayload({
      isUpdate,
      data,
      projectIdentifier,
      orgIdentifier
    })

    const saveOrUpdateHandler = filterRef.current?.saveOrUpdateFilterHandler
    if (saveOrUpdateHandler && typeof saveOrUpdateHandler === 'function') {
      const updatedFilter = await saveOrUpdateHandler(isUpdate, requestBodyPayload)
      updateQueryParams({ filters: updatedFilter?.filterProperties ?? {} })
    }

    setLoading(false)
    refetchFilters()
  }

  const handleDelete = async (filterIdentifier: string): Promise<void> => {
    setLoading(true)
    const deleteHandler = filterRef.current?.deleteFilterHandler
    if (deleteHandler && typeof deleteFilter === 'function') {
      await deleteHandler(filterIdentifier)
    }
    setLoading(false)

    if (filterIdentifier === appliedFilter?.identifier) {
      reset()
    }
    refetchFilters()
  }

  const handleFilterClick = (filterIdentifier: string): void => {
    if (filterIdentifier !== UNSAVED_FILTER_IDENTIFIER) {
      updateQueryParams({
        filterIdentifier,
        filters: undefined,
        page: PAGE_TEMPLATE_DEFAULT_PAGE_INDEX
      })
    }
  }

  const reset = (): void => {
    replaceQueryParams({})
  }

  return (
    <Layout.Horizontal padding={{ left: 'medium', right: 'small' }}>
      <FilterSelector<FilterDTO>
        appliedFilter={appliedFilter}
        filters={filters}
        onFilterBtnClick={openFilterDrawer}
        onFilterSelect={handleFilterSelection}
        fieldToLabelMapping={fieldToLabelMapping}
        filterWithValidFields={filterWithValidFields}
      />
      <Filter<EnvironmentsFilterFormType, FilterDTO>
        isOpen={isFiltersDrawerOpen}
        formFields={
          <EnvironmentsFilterForm environments={getMultiSelectFromOptions(environmentsResponse?.data?.content)} />
        }
        initialFilter={{
          formValues: {
            environmentName: environmentNames?.[0],
            description,
            environmentTags: tags,
            environmentTypes: getMultiSelectFromOptions(environmentTypes),
            environments: getMultiSelectFromOptions(environmentIdentifiers)
          },
          metadata: { name, filterVisibility, identifier, filterProperties: {} }
        }}
        filters={filters}
        isRefreshingFilters={isFetchingFilters || isFetchingEnvironments || loading}
        onApply={onApply}
        onClose={() => hideFilterDrawer()}
        onSaveOrUpdate={handleSaveOrUpdate}
        onDelete={handleDelete}
        onFilterSelect={handleFilterClick}
        onClear={reset}
        ref={filterRef}
        dataSvcConfig={
          new Map<CrudOperation, (...rest: any[]) => Promise<any>>([
            ['ADD', createFilter],
            ['UPDATE', updateFilter],
            ['DELETE', deleteFilter]
          ])
        }
        onSuccessfulCrudOperation={() => refetchFilters()}
      />
    </Layout.Horizontal>
  )
}
