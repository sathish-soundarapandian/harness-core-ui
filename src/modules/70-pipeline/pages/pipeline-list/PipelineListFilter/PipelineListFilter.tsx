/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useRef } from 'react'
import { SelectOption, shouldShowError } from '@harness/uicore'
import type { FormikProps } from 'formik'
import { isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'
import type { FilterDataInterface, FilterInterface } from '@common/components/Filter/Constants'
import { Filter, FilterRef } from '@common/components/Filter/Filter'
import type { CrudOperation } from '@common/components/Filter/FilterCRUD/FilterCRUD'
import FilterSelector from '@common/components/Filter/FilterSelector/FilterSelector'
import { isObjectEmpty, UNSAVED_FILTER } from '@common/components/Filter/utils/FilterUtils'
import { StringUtils, useToaster } from '@common/exports'
import { useBooleanStatus, useDeepCompareEffect, useUpdateQueryParams } from '@common/hooks'
import { deploymentTypeLabel } from '@pipeline/utils/DeploymentTypeUtils'
import { getBuildType, getFilterByIdentifier } from '@pipeline/utils/PipelineExecutionFilterRequestUtils'
import {
  createRequestBodyPayload,
  getMultiSelectFormOptions,
  getValidFilterArguments,
  PipelineFormType
} from '@pipeline/utils/PipelineFilterRequestUtils'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useStrings } from 'framework/strings'
import {
  useGetEnvironmentListForProject,
  useGetServiceDefinitionTypes,
  useGetServiceListForProject
} from 'services/cd-ng'
import {
  FilterDTO,
  PipelineFilterProperties,
  useDeleteFilter,
  useGetFilterList,
  usePostFilter,
  useUpdateFilter
} from 'services/pipeline-ng'
import { ExecutionListFilterForm } from '../../execution-list/ExecutionListFilterForm/ExecutionListFilterForm'
import type { PipelineListPagePathParams, PipelineListPageQueryParams } from '../types'
import { usePipeLineListFilterMapper } from './usePipelineListFilterMapper'

interface PipelineListFilterProps {
  queryParams: PipelineListPageQueryParams
  appliedFilter: FilterDTO | undefined
  setAppliedFilter: (appliedFilter: FilterDTO | undefined) => void
}

export function PipelineListFilter({
  queryParams,
  appliedFilter,
  setAppliedFilter
}: PipelineListFilterProps): React.ReactElement {
  const { getString } = useStrings()
  const UNSAVED_FILTER_IDENTIFIER = StringUtils.getIdentifierFromName(UNSAVED_FILTER)
  const filterRef = useRef<FilterRef<FilterDTO> | null>(null)
  const { getRBACErrorMessage } = useRBACError()
  const { showError } = useToaster()
  const { selectedProject } = useAppStore()
  const { updateQueryParams, replaceQueryParams } = useUpdateQueryParams<Partial<PipelineListPageQueryParams>>()
  const { projectIdentifier, orgIdentifier, accountId } = useParams<PipelineListPagePathParams>()
  const { state: isFiltersDrawerOpen, open: openFilterDrawer, close: hideFilterDrawer } = useBooleanStatus()

  const { mutate: createFilter } = usePostFilter({
    queryParams: { accountIdentifier: accountId }
  })
  const { mutate: updateFilter } = useUpdateFilter({
    queryParams: { accountIdentifier: accountId }
  })
  const { mutate: deleteFilter } = useDeleteFilter({
    queryParams: { accountIdentifier: accountId, projectIdentifier, orgIdentifier, type: 'PipelineSetup' }
  })
  const {
    loading: isFetchingFilters,
    data: filterListResponse,
    error: errorFetchingFilters,
    refetch: refetchFilterList
  } = useGetFilterList({
    queryParams: { accountIdentifier: accountId, projectIdentifier, orgIdentifier, type: 'PipelineSetup' }
  })

  const { data: deploymentTypeResponse, loading: isFetchingDeploymentTypes } = useGetServiceDefinitionTypes({
    queryParams: { accountId },
    lazy: !isFiltersDrawerOpen
  })

  const { data: servicesResponse, loading: isFetchingServices } = useGetServiceListForProject({
    queryParams: { accountId, orgIdentifier, projectIdentifier },
    lazy: !isFiltersDrawerOpen
  })

  const { data: environmentsResponse, loading: isFetchingEnvironments } = useGetEnvironmentListForProject({
    queryParams: { accountId, orgIdentifier, projectIdentifier },
    lazy: !isFiltersDrawerOpen
  })

  const isCDEnabled = !!selectedProject?.modules?.includes('CD')
  const isCIEnabled = !!selectedProject?.modules?.includes('CI')
  const reset = (): void => {
    setAppliedFilter(undefined)
    replaceQueryParams({})
  }

  const handleSaveOrUpdate = async (
    isUpdate: boolean,
    data: FilterDataInterface<PipelineFormType, FilterInterface>
  ): Promise<void> => {
    const requestBodyPayload = createRequestBodyPayload({
      isUpdate,
      data,
      projectIdentifier,
      orgIdentifier
    })
    const saveOrUpdateHandler = filterRef.current?.saveOrUpdateFilterHandler
    if (saveOrUpdateHandler && typeof saveOrUpdateHandler === 'function') {
      const updatedFilter = await saveOrUpdateHandler(isUpdate, requestBodyPayload)
      updateQueryParams({ filters: updatedFilter || {} })
    }
    refetchFilterList()
  }

  const unsavedFilter = {
    name: UNSAVED_FILTER,
    identifier: StringUtils.getIdentifierFromName(UNSAVED_FILTER)
  }

  const deploymentTypeSelectOptions = useMemo(() => {
    if (!isEmpty(deploymentTypeResponse?.data) && deploymentTypeResponse?.data) {
      const options: SelectOption[] = deploymentTypeResponse.data
        .filter(deploymentType => deploymentType in deploymentTypeLabel)
        .map(type => ({
          label: getString(deploymentTypeLabel[type]),
          value: type as string
        }))
      return options
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deploymentTypeResponse])

  useDeepCompareEffect(() => {
    const calculatedFilter =
      queryParams.filterIdentifier && queryParams.filterIdentifier !== UNSAVED_FILTER_IDENTIFIER
        ? getFilterByIdentifier(queryParams.filterIdentifier || '', filterListResponse?.data?.content)
        : queryParams.filters && !isEmpty(queryParams.filters)
        ? ({
            name: UNSAVED_FILTER,
            identifier: UNSAVED_FILTER_IDENTIFIER,
            filterProperties: queryParams.filters,
            filterVisibility: undefined
          } as FilterDTO)
        : undefined

    setAppliedFilter(calculatedFilter)
  }, [queryParams])

  const isFetchingMetaData = isFetchingDeploymentTypes && isFetchingServices && isFetchingEnvironments

  const handleDelete = async (identifier: string): Promise<void> => {
    const deleteHandler = filterRef.current?.deleteFilterHandler
    if (deleteHandler && typeof deleteFilter === 'function') {
      await deleteHandler(identifier)
    }
    if (identifier === appliedFilter?.identifier) {
      reset()
    }
    await refetchFilterList()
  }

  const onApply = (inputFormData: FormikProps<PipelineFormType>['values']): void => {
    if (!isObjectEmpty(inputFormData)) {
      const filterFromFormData = getValidFilterArguments({ ...inputFormData })
      updateQueryParams({
        page: undefined,
        filterIdentifier: undefined,
        filters: filterFromFormData || {}
      })
      hideFilterDrawer()
    } else {
      showError(getString('filters.invalidCriteria'), undefined, 'pipeline.invalid.criteria.error')
    }
  }

  const handleFilterSelect = (filterIdentifier: string): void => {
    if (filterIdentifier !== unsavedFilter.identifier) {
      updateQueryParams({
        filterIdentifier,
        filters: undefined
      })
    }
  }

  const {
    name: pipelineName,
    pipelineTags: _pipelineTags,
    moduleProperties,
    description
  } = (appliedFilter?.filterProperties as PipelineFilterProperties) || {}
  const { name = '', filterVisibility, identifier = '' } = appliedFilter || {}
  const { ci, cd } = moduleProperties || {}
  const { branch, tag, ciExecutionInfoDTO, repoName } = ci || {}
  const { deploymentTypes, environmentNames, infrastructureTypes, serviceNames } = cd || {}
  const { sourceBranch, targetBranch } = ciExecutionInfoDTO?.pullRequest || {}
  const buildType = getBuildType(moduleProperties || {})

  if (errorFetchingFilters && shouldShowError(errorFetchingFilters)) {
    showError(getRBACErrorMessage(errorFetchingFilters), undefined, 'pipeline.fetch.filter.error')
  }

  const onFilterSelect = (option: SelectOption): void => {
    if (option.value) {
      updateQueryParams({
        filterIdentifier: option.value.toString(),
        filters: undefined
      })
    } else {
      reset()
    }
  }

  const { fieldToLabelMapping, filterWithValidFieldsWithMetaInfo } = usePipeLineListFilterMapper(
    appliedFilter?.filterProperties
  )

  return (
    <>
      <FilterSelector<FilterDTO>
        appliedFilter={appliedFilter}
        filters={filterListResponse?.data?.content}
        onFilterBtnClick={openFilterDrawer}
        onFilterSelect={onFilterSelect}
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
        filters={filterListResponse?.data?.content}
        isRefreshingFilters={isFetchingFilters || isFetchingMetaData}
        onApply={onApply}
        onClose={() => hideFilterDrawer()}
        onSaveOrUpdate={handleSaveOrUpdate}
        onDelete={handleDelete}
        onFilterSelect={handleFilterSelect}
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
    </>
  )
}
