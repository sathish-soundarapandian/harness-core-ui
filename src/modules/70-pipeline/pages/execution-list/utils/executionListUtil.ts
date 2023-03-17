/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useMemo } from 'react'
import { UNSAVED_FILTER } from '@common/components/Filter/utils/FilterUtils'
import { COMMON_DEFAULT_PAGE_SIZE } from '@common/constants/Pagination'
import { StringUtils } from '@common/exports'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { queryParamDecodeAll, useQueryParams, UseQueryParamsOptions } from '@common/hooks/useQueryParams'
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE, DEFAULT_EXECUTION_LIST_TABLE_SORT } from '@pipeline/utils/constants'
import type { ExecutionListPageQueryParams, ProcessedExecutionListPageQueryParams } from '../types'

export const getIsAnyFilterApplied = (queryParams: ProcessedExecutionListPageQueryParams): boolean => {
  const { myDeployments, status, pipelineIdentifier, filters, filterIdentifier, searchTerm } = queryParams
  return (
    myDeployments ||
    (Array.isArray(status) && status.length > 0) ||
    [pipelineIdentifier, filters, filterIdentifier, searchTerm].some(filter => filter !== undefined)
  )
}

export const getIsSavedFilterApplied = (filterIdentifier?: string): boolean => {
  return !!filterIdentifier && filterIdentifier !== StringUtils.getIdentifierFromName(UNSAVED_FILTER)
}

export const useQueryParamOptions = (): UseQueryParamsOptions<ProcessedExecutionListPageQueryParams> => {
  const { PL_NEW_PAGE_SIZE } = useFeatureFlags()
  const options = useMemo(
    () => ({
      decoder: queryParamDecodeAll(),
      processQueryParams(params: ExecutionListPageQueryParams): ProcessedExecutionListPageQueryParams {
        return {
          ...params,
          page: params.page ?? DEFAULT_PAGE_INDEX,
          size: params.size ?? (PL_NEW_PAGE_SIZE ? COMMON_DEFAULT_PAGE_SIZE : DEFAULT_PAGE_SIZE),
          sort: params.sort ?? DEFAULT_EXECUTION_LIST_TABLE_SORT
        }
      }
    }),
    [PL_NEW_PAGE_SIZE]
  )

  return options
}

export const useExecutionListQueryParams = (): ProcessedExecutionListPageQueryParams => {
  return useQueryParams<ProcessedExecutionListPageQueryParams>(useQueryParamOptions())
}
