import React, { useEffect, useRef } from 'react'
import { Layout, SelectOption } from '@harness/uicore'
import type { FormikProps } from 'formik'
import { isEmpty, isArray } from 'lodash-es'
import { useParams } from 'react-router-dom'
import type { FilterDataInterface, FilterInterface } from '@common/components/Filter/Constants'
import { Filter, FilterRef } from '@common/components/Filter/Filter'
import type { CrudOperation } from '@common/components/Filter/FilterCRUD/FilterCRUD'
import FilterSelector from '@common/components/Filter/FilterSelector/FilterSelector'

import { isObjectEmpty, UNSAVED_FILTER } from '@common/components/Filter/utils/FilterUtils'
import { StringUtils, useToaster } from '@common/exports'
import { useBooleanStatus, useQueryParams, useUpdateQueryParams } from '@common/hooks'
import { getFilterByIdentifier } from '@pipeline/utils/PipelineExecutionFilterRequestUtils'
import { useStrings } from 'framework/strings'
import type { FilterDTO } from 'services/pipeline-ng'
import {
  useDeleteFilter,
  useGetFilterList,
  usePostFilter,
  useUpdateFilter,
  TemplateFilterProperties,
  NGTag
} from 'services/template-ng'
import { killEvent } from '@common/utils/eventUtils'
import { useQueryParamsOptions } from '@common/hooks/useQueryParams'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { UseQueryParamsOptions } from '@common/hooks/useQueryParams'

import {
  useFilterWithValidFieldsWithMetaInfo,
  usePipelineListFilterFieldToLabelMapping
} from '@pipeline/pages/utils/Filters/filters'
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE, DEFAULT_PIPELINE_LIST_TABLE_SORT } from '@pipeline/utils/constants'
import { TemplateFilterFields } from './TemplateFilterFields'
import type { TemplateListPageQueryParams, ProcessedTemplateListPageQueryParams } from './types'

const UNSAVED_FILTER_IDENTIFIER = StringUtils.getIdentifierFromName(UNSAVED_FILTER)

interface TemplateListFilterProps {
  onFilterListUpdate: (filterList: FilterDTO[] | undefined) => void
}

type NgTagAcc = Record<string, string>

export const useTemplateQueryParamOptions = (): UseQueryParamsOptions<ProcessedTemplateListPageQueryParams> => {
  return useQueryParamsOptions({
    page: DEFAULT_PAGE_INDEX,
    size: DEFAULT_PAGE_SIZE,
    sort: DEFAULT_PIPELINE_LIST_TABLE_SORT
  })
}

export function TemplateListFilter({ onFilterListUpdate }: TemplateListFilterProps): React.ReactElement {
  const { getString } = useStrings()
  const filterRef = useRef<FilterRef<FilterDTO> | null>(null)
  const { showError } = useToaster()
  const { updateQueryParams, replaceQueryParams } =
    useUpdateQueryParams<Partial<ProcessedTemplateListPageQueryParams>>()
  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps>()
  const { state: isFiltersDrawerOpen, open: openFilterDrawer, close: hideFilterDrawer } = useBooleanStatus()
  const filterDrawerOpenedRef = useRef(false)
  const queryParamOptions = useTemplateQueryParamOptions()
  const queryParams = useQueryParams<TemplateListPageQueryParams>(queryParamOptions)

  const { mutate: createFilter, loading: isCreateFilterLoading } = usePostFilter({
    queryParams: { accountIdentifier: accountId }
  })
  const { mutate: updateFilter, loading: isUpdateFilterLoading } = useUpdateFilter({
    queryParams: { accountIdentifier: accountId }
  })
  const { mutate: deleteFilter, loading: isDeleteFilterLoading } = useDeleteFilter({
    queryParams: { accountIdentifier: accountId, projectIdentifier, orgIdentifier, type: 'Template' }
  })
  const {
    data: filterListData,
    loading: isFilterListLoading,
    refetch: refetchFilterList
  } = useGetFilterList({
    queryParams: { accountIdentifier: accountId, projectIdentifier, orgIdentifier, type: 'Template' },
    lazy: !filterDrawerOpenedRef.current && !queryParams.filterIdentifier
  })

  const filterList = filterListData?.data?.content

  useEffect(() => {
    onFilterListUpdate(filterList)
  }, [filterList, onFilterListUpdate])

  const isFilterCrudLoading =
    isCreateFilterLoading || isUpdateFilterLoading || isDeleteFilterLoading || isFilterListLoading
  const appliedFilter =
    queryParams.filterIdentifier && queryParams.filterIdentifier !== UNSAVED_FILTER_IDENTIFIER
      ? getFilterByIdentifier(queryParams.filterIdentifier, filterList)
      : !isEmpty(queryParams.filters)
      ? ({
          name: UNSAVED_FILTER,
          identifier: UNSAVED_FILTER_IDENTIFIER,
          filterProperties: {
            ...queryParams.filters,
            tags: isArray(queryParams.filters?.tags)
              ? queryParams.filters?.tags.reduce((acc: NgTagAcc, cur: NGTag) => {
                  return { ...acc, [cur.key]: '' }
                }, {})
              : {}
          },
          filterVisibility: undefined
        } as FilterDTO)
      : null
  const { name = '', filterVisibility, identifier = '', filterProperties } = appliedFilter || {}
  const { templateNames, tags: templateTags, description } = (filterProperties as TemplateFilterProperties) || {}

  const fieldToLabelMapping = usePipelineListFilterFieldToLabelMapping()
  const filterWithValidFieldsWithMetaInfo = useFilterWithValidFieldsWithMetaInfo(
    appliedFilter?.filterProperties,
    fieldToLabelMapping
  )

  const handleFilterSelection = (
    option: SelectOption,
    event?: React.SyntheticEvent<HTMLElement, Event> | undefined
  ) => {
    killEvent(event)
    updateQueryParams({
      filterIdentifier: option.value ? option.value.toString() : undefined,
      filters: undefined,
      page: DEFAULT_PAGE_INDEX
    })
  }

  const handleFilterClick = (filterIdentifier: string) => {
    if (filterIdentifier !== UNSAVED_FILTER_IDENTIFIER) {
      updateQueryParams({
        filterIdentifier,
        filters: undefined,
        page: DEFAULT_PAGE_INDEX
      })
    }
  }

  const onApply = (inputFormData: FormikProps<any>['values']): void => {
    if (!isObjectEmpty(inputFormData)) {
      const templateTagsValid = Object.keys(inputFormData.tags || {})?.map((key: string) => {
        return { key, value: inputFormData.tags[key] } as NGTag
      })

      updateQueryParams({
        page: undefined,
        filterIdentifier: undefined,
        filters:
          { ...inputFormData, templateNames: [inputFormData.templateNames], tags: { ...templateTagsValid } } || {}
      })

      hideFilterDrawer()
    } else {
      showError(getString('filters.invalidCriteria'), undefined, 'pipeline.invalid.criteria.error')
    }
  }

  const handleSaveOrUpdate = async (isUpdate: boolean, data: FilterDataInterface<any, FilterInterface>) => {
    const saveOrUpdateHandler = filterRef.current?.saveOrUpdateFilterHandler
    if (typeof saveOrUpdateHandler === 'function') {
      const {
        metadata: { name: _name, filterVisibility: _filterVisibility, identifier: _identifier },
        formValues
      } = data

      const requestBodyPayload = {
        name: _name,
        identifier: isUpdate ? _identifier : StringUtils.getIdentifierFromName(_name),
        filterVisibility: _filterVisibility,
        projectIdentifier,
        orgIdentifier,
        filterProperties: {
          filterType: 'Template',
          tags: formValues.tags || [],
          description: formValues.description,
          templateNames: [formValues.templateNames]
        }
      }

      const updatedFilter = await saveOrUpdateHandler(isUpdate, requestBodyPayload as any)
      updateQueryParams({ filters: updatedFilter?.filterProperties || {} })
      refetchFilterList()
    }
  }

  const handleDelete = async (deleteIdentifier: string) => {
    const deleteHandler = filterRef.current?.deleteFilterHandler
    if (deleteHandler && typeof deleteFilter === 'function') {
      await deleteHandler(deleteIdentifier)
      reset()
      refetchFilterList()
    }
  }

  const reset = () => replaceQueryParams({})

  return (
    <Layout.Horizontal>
      <FilterSelector<FilterDTO>
        appliedFilter={appliedFilter}
        filters={filterList}
        refetchFilters={refetchFilterList}
        onFilterBtnClick={() => {
          filterDrawerOpenedRef.current = true
          openFilterDrawer()
        }}
        onFilterSelect={handleFilterSelection}
        fieldToLabelMapping={fieldToLabelMapping}
        filterWithValidFields={filterWithValidFieldsWithMetaInfo}
      />
      <Filter<any, FilterDTO>
        isOpen={isFiltersDrawerOpen}
        formFields={<TemplateFilterFields />}
        initialFilter={{
          formValues: {
            templateNames: isArray(templateNames) ? templateNames[0] : templateNames,
            tags: templateTags,
            description
          },
          metadata: { name, filterVisibility, identifier, filterProperties: {} }
        }}
        filters={filterList}
        isRefreshingFilters={isFilterCrudLoading}
        onApply={onApply}
        onClose={hideFilterDrawer}
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
        onSuccessfulCrudOperation={refetchFilterList}
      />
    </Layout.Horizontal>
  )
}
