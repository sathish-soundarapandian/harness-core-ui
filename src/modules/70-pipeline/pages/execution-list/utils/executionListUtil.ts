import { UNSAVED_FILTER } from '@common/components/Filter/utils/FilterUtils'
import { StringUtils } from '@common/exports'
import { queryParamDecodeAll, useQueryParams } from '@common/hooks/useQueryParams'
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

export const queryParamOptions = {
  decoder: queryParamDecodeAll(),
  processQueryParams(params: ExecutionListPageQueryParams): ProcessedExecutionListPageQueryParams {
    return {
      ...params,
      page: params.page ?? DEFAULT_PAGE_INDEX,
      size: params.size ?? DEFAULT_PAGE_SIZE,
      sort: params.sort ?? DEFAULT_EXECUTION_LIST_TABLE_SORT
    }
  }
}

export const useExecutionListQueryParams = (): ProcessedExecutionListPageQueryParams =>
  useQueryParams<ProcessedExecutionListPageQueryParams>(queryParamOptions)
