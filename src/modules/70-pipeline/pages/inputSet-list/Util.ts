/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { SortMethod } from '@harness/uicore'
import { COMMON_DEFAULT_PAGE_SIZE } from '@common/constants/Pagination'
import type { CommonPaginationQueryParams } from '@common/hooks/useDefaultPaginationProps'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { useQueryParamsOptions, UseQueryParamsOptions } from '@common/hooks/useQueryParams'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'

export type InputSetListQueryParams = {
  searchTerm?: string
} & CommonPaginationQueryParams &
  GitQueryParams
export type InputSetListQueryParamsWithDefaults = RequiredPick<InputSetListQueryParams, 'page' | 'size' | 'searchTerm'>

export const INPUT_SETS_PAGE_SIZE = 20
export const INPUT_SETS_PAGE_INDEX = 0
export const INPUT_SETS_DEFAULT_SORT: SortMethod = SortMethod.Newest

export const useInputSetListQueryParamOptions = (): UseQueryParamsOptions<InputSetListQueryParamsWithDefaults> => {
  const { PL_NEW_PAGE_SIZE } = useFeatureFlags()

  return useQueryParamsOptions({
    page: INPUT_SETS_PAGE_INDEX,
    size: PL_NEW_PAGE_SIZE ? COMMON_DEFAULT_PAGE_SIZE : INPUT_SETS_PAGE_SIZE,
    sort: INPUT_SETS_DEFAULT_SORT,
    searchTerm: ''
  })
}
