/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Color } from '@harness/design-system'
import EmptySearchResults from '@common/images/EmptySearchResults.svg'
import type { StoreType } from '@common/constants/GitSyncTypes'
import type { PMSPipelineSummaryResponse } from 'services/pipeline-ng'
import { queryParamDecodeAll } from '@common/hooks/useQueryParams'
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE, DEFAULT_PIPELINE_LIST_TABLE_SORT } from '@pipeline/utils/constants'
import type { Module } from '@common/interfaces/RouteInterfaces'
import CFPipelineIllustration from './images/cf-pipeline-illustration.svg'
import CDPipelineIllustration from './images/cd-pipeline-illustration.svg'
import CIPipelineIllustration from './images/ci-pipeline-illustration.svg'
import type {
  PipelineListPagePathParams,
  PipelineListPageQueryParams,
  ProcessedPipelineListPageQueryParams
} from './types'

export const getStatusColor = (data: PMSPipelineSummaryResponse): string => {
  switch (data.recentExecutionsInfo?.[0]?.status) {
    case 'Success':
      return Color.GREEN_800
    case 'Failed':
      return Color.RED_800
    case 'Running':
      return Color.BLUE_800
    default:
      return Color.GREEN_800
  }
}

export const getRouteProps = (pathParams: PipelineListPagePathParams, pipeline?: PMSPipelineSummaryResponse) => {
  return {
    projectIdentifier: pathParams.projectIdentifier,
    orgIdentifier: pathParams.orgIdentifier,
    accountId: pathParams.accountId,
    module: pathParams.module,
    pipelineIdentifier: pipeline?.identifier || '',
    branch: pipeline?.gitDetails?.branch,
    repoIdentifier: pipeline?.gitDetails?.repoIdentifier,
    repoName: pipeline?.gitDetails?.repoName,
    connectorRef: pipeline?.connectorRef,
    storeType: pipeline?.storeType as StoreType
  }
}

export const queryParamOptions = {
  parseArrays: true,
  decoder: queryParamDecodeAll({ ignoreEmptyString: false }),
  processQueryParams(params: PipelineListPageQueryParams): ProcessedPipelineListPageQueryParams {
    return {
      ...params,
      page: params.page ?? DEFAULT_PAGE_INDEX,
      size: params.size ?? DEFAULT_PAGE_SIZE,
      sort: params.sort ?? DEFAULT_PIPELINE_LIST_TABLE_SORT
    }
  }
}

export const getEmptyStateIllustration = (hasFilter: boolean, module?: Module): string => {
  if (hasFilter) {
    return EmptySearchResults
  }

  if (!module) {
    return CDPipelineIllustration
  }

  const illustration: Partial<Record<Module, string>> = {
    ci: CIPipelineIllustration,
    cd: CDPipelineIllustration,
    cf: CFPipelineIllustration
  }

  return illustration[module] || CDPipelineIllustration
}
