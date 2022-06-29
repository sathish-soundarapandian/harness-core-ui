/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo, useRef } from 'react'
import { useModalHook } from '@harness/use-modal'
import {
  ExpandingSearchInput,
  ExpandingSearchInputHandle,
  Layout,
  OverlaySpinner,
  SelectOption,
  shouldShowError
} from '@wings-software/uicore'
import type { FormikProps } from 'formik'
import { isEmpty, pick } from 'lodash-es'
import { useParams } from 'react-router-dom'
import type { FilterDataInterface, FilterInterface } from '@common/components/Filter/Constants'
import { Filter, FilterRef } from '@common/components/Filter/Filter'
import type { CrudOperation } from '@common/components/Filter/FilterCRUD/FilterCRUD'
import FilterSelector from '@common/components/Filter/FilterSelector/FilterSelector'
import {
  flattenObject,
  isObjectEmpty,
  removeNullAndEmpty,
  UNSAVED_FILTER
} from '@common/components/Filter/utils/FilterUtils'
import { StringUtils, useToaster } from '@common/exports'
import { useDeepCompareEffect, useUpdateQueryParams } from '@common/hooks'
import type { PipelineType } from '@common/interfaces/RouteInterfaces'
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
  GetFilterListQueryParams,
  PipelineFilterProperties,
  useDeleteFilter,
  useGetFilterList,
  usePostFilter,
  useUpdateFilter
} from 'services/pipeline-ng'
import PipelineFilterForm from '../pipeline-deployment-list/PipelineFilterForm/PipelineFilterForm'
import type { QueryParams, StringQueryParams } from './types'
import css from './PipelinesPage.module.scss'

interface PipelineListFilterProps {
  queryParams: QueryParams
  appliedFilter: FilterDTO | undefined
  setAppliedFilter: (appliedFilter: FilterDTO | undefined) => void
}

function PipelineListFilter({
  queryParams,
  appliedFilter,
  setAppliedFilter
}: PipelineListFilterProps): React.ReactElement {
  const { getString } = useStrings()
  const UNSAVED_FILTER_IDENTIFIER = StringUtils.getIdentifierFromName(UNSAVED_FILTER)
  const filterRef = useRef<FilterRef<FilterDTO> | null>(null)
  const searchRef = useRef<ExpandingSearchInputHandle>({} as ExpandingSearchInputHandle)
  const { getRBACErrorMessage } = useRBACError()
  const { showError } = useToaster()
  const { selectedProject, isGitSyncEnabled } = useAppStore()
  const { updateQueryParams, replaceQueryParams } = useUpdateQueryParams<Partial<StringQueryParams>>()
  const { searchTerm, filters } = queryParams
  const { projectIdentifier, orgIdentifier, accountId, module } = useParams<
    PipelineType<{
      projectIdentifier: string
      orgIdentifier: string
      accountId: string
    }>
  >()

  const filterListApiQueryParams: GetFilterListQueryParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier,
    type: 'PipelineSetup'
  }

  const {
    loading: isFetchingFilters,
    data: filterListResponse,
    error: errorFetchingFilters,
    refetch: refetchFilterList
  } = useGetFilterList({
    queryParams: filterListApiQueryParams
  })

  const { mutate: createFilter } = usePostFilter({
    queryParams: filterListApiQueryParams
  })

  const { mutate: updateFilter } = useUpdateFilter({
    queryParams: filterListApiQueryParams
  })

  const { mutate: deleteFilter } = useDeleteFilter({
    queryParams: filterListApiQueryParams
  })

  const isCDEnabled = !!(selectedProject?.modules && selectedProject.modules?.indexOf('CD') > -1)
  const isCIEnabled = !!(selectedProject?.modules && selectedProject.modules?.indexOf('CI') > -1)

  const reset = (): void => {
    replaceQueryParams({})
  }

  if (errorFetchingFilters && shouldShowError(errorFetchingFilters)) {
    showError(getRBACErrorMessage(errorFetchingFilters), undefined, 'pipeline.fetch.filter.error')
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
      updateQueryParams({ filters: JSON.stringify({ ...(updatedFilter || {}) }) })
    }
    refetchFilterList()
  }

  const unsavedFilter = {
    name: UNSAVED_FILTER,
    identifier: StringUtils.getIdentifierFromName(UNSAVED_FILTER)
  }

  const { data: deploymentTypeResponse, loading: isFetchingDeploymentTypes } = useGetServiceDefinitionTypes({})
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
  }, [deploymentTypeResponse])

  const {
    data: servicesResponse,
    loading: isFetchingServices,
    refetch: fetchServices
  } = useGetServiceListForProject({
    queryParams: { accountId, orgIdentifier, projectIdentifier },
    lazy: true
  })

  const {
    data: environmentsResponse,
    loading: isFetchingEnvironments,
    refetch: fetchEnvironments
  } = useGetEnvironmentListForProject({
    queryParams: { accountId, orgIdentifier, projectIdentifier },
    lazy: true
  })

  useEffect(() => {
    fetchServices()
    fetchEnvironments()
  }, [projectIdentifier])

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

  const [openFilterDrawer, hideFilterDrawer] = useModalHook(() => {
    const onApply = (inputFormData: FormikProps<PipelineFormType>['values']) => {
      if (!isObjectEmpty(inputFormData)) {
        const filterFromFormData = getValidFilterArguments({ ...inputFormData })
        updateQueryParams({
          page: undefined,
          filterIdentifier: undefined,
          filters: JSON.stringify({ ...(filterFromFormData || {}) })
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

    return isFetchingFilters && isFetchingMetaData ? (
      <div style={{ position: 'relative', height: 'calc(100vh - 128px)' }}>
        <OverlaySpinner show={true} className={css.loading}>
          <></>
        </OverlaySpinner>
      </div>
    ) : (
      <Filter<PipelineFormType, FilterDTO>
        formFields={
          <PipelineFilterForm<PipelineFormType>
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
    )
  }, [
    isFetchingFilters,
    appliedFilter,
    filters,
    module,
    environmentsResponse?.data?.content,
    servicesResponse?.data?.content
  ])

  const onFilterSelect = (option: SelectOption, event?: React.SyntheticEvent<HTMLElement, Event> | undefined): void => {
    event?.stopPropagation()
    event?.preventDefault()
    if (option.value) {
      updateQueryParams({
        filterIdentifier: option.value.toString(),
        filters: undefined // this will remove the param
      })
    } else {
      reset()
    }
  }

  const fieldToLabelMapping = new Map<string, string>()
  fieldToLabelMapping.set('name', getString('name'))
  fieldToLabelMapping.set('description', getString('description'))
  fieldToLabelMapping.set('pipelineTags', getString('tagsLabel'))
  fieldToLabelMapping.set('sourceBranch', getString('common.sourceBranch'))
  fieldToLabelMapping.set('targetBranch', getString('common.targetBranch'))
  fieldToLabelMapping.set('branch', getString('pipelineSteps.deploy.inputSet.branch'))
  fieldToLabelMapping.set('tag', getString('tagLabel'))
  fieldToLabelMapping.set('repoNames', getString('common.repositoryName'))
  fieldToLabelMapping.set('buildType', getString('filters.executions.buildType'))
  fieldToLabelMapping.set('deploymentTypes', getString('deploymentTypeText'))
  fieldToLabelMapping.set('infrastructureTypes', getString('infrastructureTypeText'))
  fieldToLabelMapping.set('serviceNames', getString('services'))
  fieldToLabelMapping.set('environmentNames', getString('environments'))
  const filterWithValidFields = removeNullAndEmpty(
    pick(flattenObject(appliedFilter?.filterProperties || {}), ...fieldToLabelMapping.keys())
  )
  const filterWithValidFieldsWithMetaInfo =
    filterWithValidFields.sourceBranch && filterWithValidFields.targetBranch
      ? Object.assign(filterWithValidFields, { buildType: getString('filters.executions.pullOrMergeRequest') })
      : filterWithValidFields.branch
      ? Object.assign(filterWithValidFields, { buildType: getString('pipelineSteps.deploy.inputSet.branch') })
      : filterWithValidFields.tag
      ? Object.assign(filterWithValidFields, { buildType: getString('tagLabel') })
      : filterWithValidFields

  const shouldRenderFilterSelector = (): boolean => {
    if (isGitSyncEnabled) {
      if (appliedFilter || searchTerm) {
        return true
      }
      return false
    }
    return true
  }

  return (
    <Layout.Horizontal spacing="small" style={{ alignItems: 'center' }}>
      <ExpandingSearchInput
        alwaysExpanded
        width={200}
        placeholder={getString('search')}
        onChange={(text: string) => {
          updateQueryParams({ searchTerm: text ? text : undefined })
        }}
        defaultValue={searchTerm}
        ref={searchRef}
        className={css.expandSearch}
      />
      {shouldRenderFilterSelector() && (
        <Layout.Horizontal padding={{ left: 'small', right: 'small' }}>
          <FilterSelector<FilterDTO>
            appliedFilter={appliedFilter}
            filters={filterListResponse?.data?.content}
            onFilterBtnClick={openFilterDrawer}
            onFilterSelect={onFilterSelect}
            fieldToLabelMapping={fieldToLabelMapping}
            filterWithValidFields={filterWithValidFieldsWithMetaInfo}
          />
        </Layout.Horizontal>
      )}
    </Layout.Horizontal>
  )
}

export default PipelineListFilter
