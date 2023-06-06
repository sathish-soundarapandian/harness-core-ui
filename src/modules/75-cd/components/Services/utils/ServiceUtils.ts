/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { set } from 'lodash-es'
import { COMMON_DEFAULT_PAGE_SIZE } from '@common/constants/Pagination'
import type { CommonPaginationQueryParams } from '@common/hooks/useDefaultPaginationProps'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { useQueryParamsOptions, UseQueryParamsOptions } from '@common/hooks/useQueryParams'
import { Sort, SortFields } from '@common/utils/listUtils'
import type { ServiceDefinition } from 'services/cd-ng'
import type { PipelineInfoConfig } from 'services/pipeline-ng'

export type ServicePipelineConfig = PipelineInfoConfig & { gitOpsEnabled?: boolean }

export enum ServiceTabs {
  SUMMARY = 'summaryTab',
  Configuration = 'configuration',
  REFERENCED_BY = 'referencedByTab',
  ActivityLog = 'activityLog'
}

export const DefaultNewStageName = 'Stage Name'
export const DefaultNewStageId = 'stage_id'
export const DefaultNewServiceId = '-1'

export const newServiceState = {
  service: {
    name: '',
    identifier: '',
    description: '',
    tags: {},
    serviceDefinition: {
      type: '' as ServiceDefinition['type'],
      spec: {}
    }
  }
}

const DefaultService = {
  serviceDefinition: {
    spec: {}
  }
}

export const initialServiceState = {
  service: { ...DefaultService }
}

export const setNameIDDescription = (draftData: PipelineInfoConfig, updatedData: ServicePipelineConfig): void => {
  set(draftData, 'identifier', updatedData.identifier)
  set(draftData, 'name', updatedData.name)
  set(draftData, 'description', updatedData.description)
  set(draftData, 'tags', updatedData.tags)
  set(draftData, 'gitOpsEnabled', updatedData.gitOpsEnabled)
}

export const SERVICES_DEFAULT_PAGE_SIZE = 10
export const SERVICES_DEFAULT_PAGE_INDEX = 0
export type ServicesQueryParams = CommonPaginationQueryParams & { searchTerm?: string; sort?: [SortFields, Sort] }
export type ServicesQueryParamsWithDefaults = RequiredPick<ServicesQueryParams, 'page' | 'size' | 'sort'>

export const useServicesQueryParamOptions = (): UseQueryParamsOptions<ServicesQueryParamsWithDefaults> => {
  const { PL_NEW_PAGE_SIZE } = useFeatureFlags()

  return useQueryParamsOptions({
    page: 0,
    size: PL_NEW_PAGE_SIZE ? COMMON_DEFAULT_PAGE_SIZE : SERVICES_DEFAULT_PAGE_SIZE,
    searchTerm: '',
    sort: [SortFields.LastModifiedAt, Sort.DESC]
  })
}
