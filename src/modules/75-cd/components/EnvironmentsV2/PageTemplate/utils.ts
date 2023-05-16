/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import type { FilterProperties } from 'services/cd-ng'
import type { UseQueryParamsOptions } from '@common/hooks/useQueryParams';
import { useQueryParamsOptions } from '@common/hooks/useQueryParams'
import { COMMON_DEFAULT_PAGE_SIZE } from '@common/constants/Pagination'

export enum SortFields {
  LastUpdatedAt = 'lastModifiedAt',
  AZ09 = 'AZ09',
  ZA90 = 'ZA90',
  Name = 'name'
}

export enum Sort {
  DESC = 'DESC',
  ASC = 'ASC'
}

export interface PageQueryParams {
  page?: number
  size?: number
  searchTerm?: string
  filterIdentifier?: string
  filters?: FilterProperties
}

export type PageQueryParamsWithDefaults = RequiredPick<PageQueryParams, 'page' | 'size'>
export const PAGE_TEMPLATE_DEFAULT_PAGE_SIZE = 10
export const PAGE_TEMPLATE_DEFAULT_PAGE_INDEX = 1

export const usePageQueryParamOptions = (): UseQueryParamsOptions<PageQueryParamsWithDefaults> => {
  const { PL_NEW_PAGE_SIZE } = useFeatureFlags()

  return useQueryParamsOptions({
    page: PAGE_TEMPLATE_DEFAULT_PAGE_INDEX,
    size: PL_NEW_PAGE_SIZE ? COMMON_DEFAULT_PAGE_SIZE : PAGE_TEMPLATE_DEFAULT_PAGE_SIZE
  })
}
