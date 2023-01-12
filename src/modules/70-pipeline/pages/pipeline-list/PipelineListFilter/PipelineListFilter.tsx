/* eslint-disable @typescript-eslint/explicit-function-return-type */
/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useRef } from 'react'
import { Layout, SelectOption } from '@harness/uicore'
import type { FormikProps } from 'formik'
import { isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'
import type { FilterDataInterface, FilterInterface } from '@common/components/Filter/Constants'
import { Filter, FilterRef } from '@common/components/Filter/Filter'
import type { CrudOperation } from '@common/components/Filter/FilterCRUD/FilterCRUD'
import FilterSelector from '@common/components/Filter/FilterSelector/FilterSelector'
import { isObjectEmpty, UNSAVED_FILTER } from '@common/components/Filter/utils/FilterUtils'
import { StringUtils, useToaster } from '@common/exports'
import { useBooleanStatus, useQueryParams, useUpdateQueryParams } from '@common/hooks'
import { deploymentTypeLabel } from '@pipeline/utils/DeploymentTypeUtils'
import { getBuildType, getFilterByIdentifier } from '@pipeline/utils/PipelineExecutionFilterRequestUtils'
import {
  createRequestBodyPayload,
  getMultiSelectFormOptions,
  getValidFilterArguments,
  PipelineFormType
} from '@pipeline/utils/PipelineFilterRequestUtils'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useStrings } from 'framework/strings'
import {
  useGetEnvironmentListForProject,
  useGetServiceDefinitionTypes,
  useGetServiceListForProject
} from 'services/cd-ng'
import type { FilterDTO, PipelineFilterProperties } from 'services/pipeline-ng'
import { useDeleteFilter, useGetFilterList, usePostFilter, useUpdateFilter } from 'services/pipeline-ng'
import { killEvent } from '@common/utils/eventUtils'
import {
  useFilterWithValidFieldsWithMetaInfo,
  usePipelineListFilterFieldToLabelMapping
} from '@pipeline/pages/utils/Filters/filters'
import { ExecutionListFilterForm } from '../../execution-list/ExecutionListFilterForm/ExecutionListFilterForm'
import type {
  PipelineListPagePathParams,
  PipelineListPageQueryParams,
  ProcessedPipelineListPageQueryParams
} from '../types'
import { queryParamOptions } from '../PipelineListUtils'

const UNSAVED_FILTER_IDENTIFIER = StringUtils.getIdentifierFromName(UNSAVED_FILTER)

export function PipelineListFilter(): React.ReactElement {
  const { getString } = useStrings()
  const filterRef = useRef<FilterRef<FilterDTO> | null>(null)
  const { showError } = useToaster()
  const { updateQueryParams, replaceQueryParams } = useUpdateQueryParams<Partial<PipelineListPageQueryParams>>()
  const { projectIdentifier, orgIdentifier, accountId } = useParams<PipelineListPagePathParams>()
  const { state: isFiltersDrawerOpen, open: openFilterDrawer, close: hideFilterDrawer } = useBooleanStatus()
  const filterDrawerOpenedRef = useRef(false)
  const queryParams = useQueryParams<ProcessedPipelineListPageQueryParams>(queryParamOptions)
  const { selectedProject } = useAppStore()
  const isCDEnabled = !!selectedProject?.modules?.includes('CD')
  const isCIEnabled = !!selectedProject?.modules?.includes('CI')

  /**Start Data hooks */

  const { data: deploymentTypeResponse, loading: isDeploymentTypesLoading } = useGetServiceDefinitionTypes({
    queryParams: { accountId },
    lazy: !filterDrawerOpenedRef.current
  })
  const { data: servicesResponse, loading: isServicesLoading } = useGetServiceListForProject({
    queryParams: { accountId, orgIdentifier, projectIdentifier },
    lazy: !filterDrawerOpenedRef.current
  })
  const { data: environmentsResponse, loading: isEnvironmentsLoading } = useGetEnvironmentListForProject({
    queryParams: { accountId, orgIdentifier, projectIdentifier },
    lazy: !filterDrawerOpenedRef.current
  })
  const { mutate: createFilter, loading: isCreateFilterLoading } = usePostFilter({
    queryParams: { accountIdentifier: accountId }
  })
  const { mutate: updateFilter, loading: isUpdateFilterLoading } = useUpdateFilter({
    queryParams: { accountIdentifier: accountId }
  })
  const { mutate: deleteFilter, loading: isDeleteFilterLoading } = useDeleteFilter({
    queryParams: { accountIdentifier: accountId, projectIdentifier, orgIdentifier, type: 'PipelineSetup' }
  })
  const {
    data: filterListData,
    loading: isFilterListLoading,
    refetch: refetchFilterList
  } = useGetFilterList({
    queryParams: { accountIdentifier: accountId, projectIdentifier, orgIdentifier, type: 'PipelineSetup' },
    lazy: !filterDrawerOpenedRef.current && !queryParams.filterIdentifier
  })

  /**End Data hooks */

  const deploymentTypeSelectOptions = useMemo(() => {
    const options: SelectOption[] =
      deploymentTypeResponse?.data
        ?.filter(deploymentType => deploymentType in deploymentTypeLabel)
        .map(type => ({
          label: getString(deploymentTypeLabel[type]),
          value: type as string
        })) || ([] as SelectOption[])
    return options
  }, [deploymentTypeResponse])

  const filterList = filterListData?.data?.content
  const isMetaDataLoading = isDeploymentTypesLoading || isEnvironmentsLoading || isServicesLoading
  const isFilterCrudLoading =
    isCreateFilterLoading || isUpdateFilterLoading || isDeleteFilterLoading || isFilterListLoading
  const appliedFilter =
    queryParams.filterIdentifier && queryParams.filterIdentifier !== UNSAVED_FILTER_IDENTIFIER
      ? getFilterByIdentifier(queryParams.filterIdentifier, filterList)
      : !isEmpty(queryParams.filters)
      ? ({
          name: UNSAVED_FILTER,
          identifier: UNSAVED_FILTER_IDENTIFIER,
          filterProperties: queryParams.filters,
          filterVisibility: undefined
        } as FilterDTO)
      : null
  const { name = '', filterVisibility, identifier = '', filterProperties } = appliedFilter || {}
  const {
    name: pipelineName,
    pipelineTags: _pipelineTags,
    moduleProperties,
    description
  } = (filterProperties as PipelineFilterProperties) || {}
  const { ci, cd } = moduleProperties || {}
  const { branch, tag, ciExecutionInfoDTO, repoName } = ci || {}
  const { deploymentTypes, environmentNames, infrastructureTypes, serviceNames } = cd || {}
  const { sourceBranch, targetBranch } = ciExecutionInfoDTO?.pullRequest || {}
  const buildType = getBuildType(moduleProperties || {})
  const fieldToLabelMapping = usePipelineListFilterFieldToLabelMapping()
  const filterWithValidFieldsWithMetaInfo = useFilterWithValidFieldsWithMetaInfo(
    appliedFilter?.filterProperties,
    fieldToLabelMapping
  )

  /**Start Handlers */

  const handleFilterSelection = (
    option: SelectOption,
    event?: React.SyntheticEvent<HTMLElement, Event> | undefined
  ) => {
    killEvent(event)
    updateQueryParams({
      filterIdentifier: option.value ? option.value.toString() : undefined,
      filters: undefined
    })
  }

  const handleFilterClick = (filterIdentifier: string) => {
    if (filterIdentifier !== UNSAVED_FILTER_IDENTIFIER) {
      updateQueryParams({
        filterIdentifier,
        filters: undefined
      })
    }
  }

  const onApply = (inputFormData: FormikProps<PipelineFormType>['values']): void => {
    if (!isObjectEmpty(inputFormData)) {
      const filterFromFormData = getValidFilterArguments({ ...inputFormData })
      updateQueryParams({ page: undefined, filterIdentifier: undefined, filters: filterFromFormData || {} })
      hideFilterDrawer()
    } else {
      showError(getString('filters.invalidCriteria'), undefined, 'pipeline.invalid.criteria.error')
    }
  }

  const handleSaveOrUpdate = async (
    isUpdate: boolean,
    data: FilterDataInterface<PipelineFormType, FilterInterface>
  ) => {
    const saveOrUpdateHandler = filterRef.current?.saveOrUpdateFilterHandler
    if (typeof saveOrUpdateHandler === 'function') {
      const requestBodyPayload = createRequestBodyPayload({
        isUpdate,
        data,
        projectIdentifier,
        orgIdentifier
      })
      const updatedFilter = await saveOrUpdateHandler(isUpdate, requestBodyPayload)
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

  /**End Handlers */

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
      <Filter<PipelineFormType, FilterDTO>
        isOpen={isFiltersDrawerOpen}
        formFields={
          <ExecutionListFilterForm<PipelineFormType>
            isCDEnabled={isCDEnabled}
            isCIEnabled={isCIEnabled}
            initialValues={{
              environments: getMultiSelectFormOptions(environmentsResponse?.data?.content),
              services: getMultiSelectFormOptions(servicesResponse?.data?.content),
              deploymentType: deploymentTypeSelectOptions
            }}
            type="PipelineSetup"
          />
        }
        initialFilter={{
          formValues: {
            name: pipelineName,
            pipelineTags: _pipelineTags?.reduce((obj, item) => Object.assign(obj, { [item.key]: item.value }), {}),
            description,
            branch,
            tag,
            sourceBranch,
            targetBranch,
            buildType,
            repositoryName: repoName ? repoName[0] : undefined,
            deploymentType: deploymentTypes,
            infrastructureType: infrastructureTypes ? infrastructureTypes[0] : undefined,
            services: getMultiSelectFormOptions(serviceNames),
            environments: getMultiSelectFormOptions(environmentNames)
          },
          metadata: { name, filterVisibility, identifier, filterProperties: {} }
        }}
        filters={filterList}
        isRefreshingFilters={isFilterCrudLoading || isMetaDataLoading}
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
