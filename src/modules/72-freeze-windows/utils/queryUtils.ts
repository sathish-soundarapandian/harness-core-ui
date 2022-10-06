/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SelectOption } from '@harness/uicore'
import { queryParamDecodeAll } from '@common/hooks/useQueryParams'
import type { FreezeListUrlQueryParams } from '@freeze-windows/types'
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE, DEFAULT_PIPELINE_LIST_TABLE_SORT } from '@pipeline/utils/constants'

export const getQueryParamOptions = () => ({
  parseArrays: true,
  decoder: queryParamDecodeAll(),
  processQueryParams(params: FreezeListUrlQueryParams): FreezeListUrlQueryParams {
    const [start, end] = getDefaultCalenderFilter()
    return {
      ...params,
      page: params.page ?? DEFAULT_PAGE_INDEX,
      size: params.size ?? DEFAULT_PAGE_SIZE,
      sort: params.sort ?? DEFAULT_PIPELINE_LIST_TABLE_SORT,
      startTime: params.startTime || start.getTime(),
      endTime: params.endTime || end.getTime()
    }
  }
})

export const getDefaultCalenderFilter = (): [Date, Date] => {
  const start = new Date()
  start.setDate(start.getDate() - 7)
  start.setHours(0, 0, 0, 0)

  const end = new Date()
  end.setHours(23, 59, 59, 999)

  return [start, end]
}

export const STATUS_OPTIONS: SelectOption[] = [
  { label: 'Enabled', value: 'Enabled' },
  { label: 'Disabled', value: 'Disabled' }
]
