/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import type { PipelineType, PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import { FilterDTO, GetListOfExecutionsQueryParams, useGetFilterList } from 'services/pipeline-ng'
import { useQueryParams, useUpdateQueryParams } from '@common/hooks'
import { StringUtils } from '@common/exports'
import { UNSAVED_FILTER } from '@common/components/Filter/utils/FilterUtils'
import { DEFAULT_EXECUTION_LIST_TABLE_SORT, DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@pipeline/utils/constants'
import type { PartiallyRequired } from '@pipeline/utils/types'
import { queryParamDecodeAll } from '@common/hooks/useQueryParams'
import type { ExecutionListPageQueryParams } from '../types'

export type ProcessedExecutionListPageQueryParams = PartiallyRequired<
  ExecutionListPageQueryParams,
  'page' | 'size' | 'sort'
>
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

interface ExecutionListFilterContext {
  filterList: FilterDTO[]
  isFetchingFilterList: boolean
  refetchFilterList: () => Promise<void>
  clearFilter: () => void
  /**
   *  Response filtered due any of the applied filters, search etc
   */
  isAnyFilterApplied: boolean
  /**
   *  has one of the saved filters been applied
   */
  isSavedFilterApplied: boolean
  /**
   *  processed query params. Ex tranform to boolean and number types
   */
  queryParams: ProcessedExecutionListPageQueryParams
}

const ExecutionListFilterContext = React.createContext({} as ExecutionListFilterContext)

export function ExecutionListFilterContextProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const { orgIdentifier, projectIdentifier, accountId } = useParams<PipelineType<PipelinePathProps>>()
  const queryParams = useQueryParams<ProcessedExecutionListPageQueryParams>(queryParamOptions)
  const { filterIdentifier, myDeployments, status, searchTerm } = queryParams
  const { replaceQueryParams } = useUpdateQueryParams<Partial<GetListOfExecutionsQueryParams>>()

  const isAnyFilterApplied =
    myDeployments ||
    (Array.isArray(status) && status.length > 0) ||
    [queryParams.pipelineIdentifier, queryParams.filters, filterIdentifier, searchTerm].some(
      filter => filter !== undefined
    )

  const {
    data: filterData,
    loading: isFetchingFilterList,
    refetch: refetchFilterList
  } = useGetFilterList({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      type: 'PipelineExecution'
    }
  })

  const clearFilter = (): void => replaceQueryParams({})

  return (
    <ExecutionListFilterContext.Provider
      value={{
        filterList: filterData?.data?.content || [],
        isFetchingFilterList,
        refetchFilterList,
        isAnyFilterApplied,
        isSavedFilterApplied:
          !!filterIdentifier && filterIdentifier !== StringUtils.getIdentifierFromName(UNSAVED_FILTER),
        queryParams: queryParams,
        clearFilter
      }}
    >
      {children}
    </ExecutionListFilterContext.Provider>
  )
}

export function useExecutionListFilterContext(): ExecutionListFilterContext {
  return React.useContext(ExecutionListFilterContext)
}
