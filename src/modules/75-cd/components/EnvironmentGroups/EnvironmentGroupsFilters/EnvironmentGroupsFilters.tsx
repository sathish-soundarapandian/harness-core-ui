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

import { SelectOption, useToaster, MultiSelectOption } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import {
  usePostFilter,
  useUpdateFilter,
  useDeleteFilter,
  FilterDTO,
  useGetEnvironmentListForProject,
  NGTag
} from 'services/cd-ng'

import { StringUtils } from '@common/exports'
import { useBooleanStatus, useUpdateQueryParams } from '@common/hooks'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { Filter, FilterRef } from '@common/components/Filter/Filter'
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

import EnvironmentGroupsFilterForm from './EnvironmentGroupsFilterForm'
import type { EnvironmentGroupListQueryParams } from '../utils'
import {
  createRequestBodyPayload,
  EnvironmentGroupFilterFormType,
  getFilterByIdentifier,
  getMultiSelectFromOptions
} from './filterUtils'

const UNSAVED_FILTER_IDENTIFIER = StringUtils.getIdentifierFromName(UNSAVED_FILTER)

export function EnvironmentGroupsFilters(): React.ReactElement {
  const [loading, setLoading] = React.useState(false)
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { state: isFiltersDrawerOpen, open: openFilterDrawer, close: hideFilterDrawer } = useBooleanStatus()
  const { getString } = useStrings()
  const { showError } = useToaster()
  const { updateQueryParams, replaceQueryParams } =
    useUpdateQueryParams<Partial<Record<keyof EnvironmentGroupListQueryParams, string>>>()
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
      type: 'EnvironmentGroup'
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

  const { envGroupName, description, envGroupTags, envIdentifiers } =
    (appliedFilter?.filterProperties as EnvironmentGroupFilterFormType) || {}
  const { name = '', filterVisibility, identifier = '' } = appliedFilter || {}
  const fieldToLabelMapping = React.useMemo(
    () =>
      new Map<string, string>([
        ['envGroupName', getString('common.environmentGroup.label')],
        ['description', getString('description')],
        ['envGroupTags', getString('tagsLabel')],
        ['envIdentifiers', getString('environments')]
      ]),
    [getString]
  )

  const filterWithValidFields = removeNullAndEmpty(
    pick(flattenObject(appliedFilter?.filterProperties || {}), ...fieldToLabelMapping.keys())
  )

  const handleFilterSelection = (
    option: SelectOption,
    event?: React.SyntheticEvent<HTMLElement, Event> | undefined
  ) => {
    event?.stopPropagation()
    event?.preventDefault()

    if (option.value) {
      updateQueryParams({
        filterIdentifier: option.value.toString(),
        filters: [] as any /* this will remove the param */
      })
    } else {
      updateQueryParams({
        filterIdentifier: [] as any /* this will remove the param */,
        filters: [] as any /* this will remove the param */
      })
    }
  }

  const onApply = (inputFormData: FormikProps<EnvironmentGroupFilterFormType>['values']) => {
    if (!isObjectEmpty(inputFormData)) {
      const filterFromFormData = {
        ...(inputFormData.envGroupName && {
          envGroupName: inputFormData.envGroupName
        }),
        ...(inputFormData.description && {
          description: inputFormData.description
        }),
        ...(inputFormData.envGroupTags && {
          envGroupTags: Object.keys(inputFormData.envGroupTags || {})?.map((key: string) => {
            return { key, value: inputFormData?.envGroupTags?.[key] } as NGTag
          })
        }),
        ...(inputFormData.environments?.length && {
          envIdentifiers: inputFormData.environments?.map((env: MultiSelectOption) => env?.value)
        })
      }
      updateQueryParams({ page: [] as any, filters: JSON.stringify({ ...(filterFromFormData || {}) }) })
      hideFilterDrawer()
    } else {
      showError(getString('filters.invalidCriteria'))
    }
  }

  const handleSaveOrUpdate = async (
    isUpdate: boolean,
    data: FilterDataInterface<EnvironmentGroupFilterFormType, FilterInterface>
  ) => {
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
      updateQueryParams({ filters: JSON.stringify({ ...(updatedFilter || {}) }) })
    }

    setLoading(false)
    refetchFilters()
  }

  const handleDelete = async (filterIdentifier: string) => {
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

  const handleFilterClick = (filterIdentifier: string) => {
    if (filterIdentifier !== UNSAVED_FILTER_IDENTIFIER) {
      updateQueryParams({
        filterIdentifier,
        filters: [] as any
      })
    }
  }

  const reset = () => {
    replaceQueryParams({})
  }

  return (
    <React.Fragment>
      <FilterSelector<FilterDTO>
        appliedFilter={appliedFilter}
        filters={filters}
        onFilterBtnClick={openFilterDrawer}
        onFilterSelect={handleFilterSelection}
        fieldToLabelMapping={fieldToLabelMapping}
        filterWithValidFields={filterWithValidFields}
      />
      <Filter<EnvironmentGroupFilterFormType, FilterDTO>
        isOpen={isFiltersDrawerOpen}
        formFields={
          <EnvironmentGroupsFilterForm environments={getMultiSelectFromOptions(environmentsResponse?.data?.content)} />
        }
        initialFilter={{
          formValues: {
            envGroupName,
            description,
            envGroupTags: envGroupTags?.reduce(
              (obj: Record<string, any>, item: NGTag) => Object.assign(obj, { [item.key]: item.value }),
              {}
            ),
            environments: getMultiSelectFromOptions(envIdentifiers)
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
    </React.Fragment>
  )
}
