/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { createContext, useContext } from 'react'
import type { TimeRangeFilterType } from '@ce/types'
import { CE_DATE_FORMAT_INTERNAL, DATE_RANGE_SHORTCUTS } from '@ce/utils/momentUtils'
import type { SummaryRequest } from 'services/lw-co'

export interface FilterOptions {
  timeRange: TimeRangeFilterType
  region?: string
  account?: string
  instanceFamily?: string
}

export interface ApplyFilterOptionsProps extends Omit<FilterOptions, 'timeRange'> {
  timeRange?: TimeRangeFilterType
}

export const defaultTimeRangeFilter = {
  to: DATE_RANGE_SHORTCUTS.LAST_30_DAYS[1].format(CE_DATE_FORMAT_INTERNAL),
  from: DATE_RANGE_SHORTCUTS.LAST_30_DAYS[0].format(CE_DATE_FORMAT_INTERNAL)
}

export const FilterContext = createContext<FilterOptions>({ timeRange: defaultTimeRangeFilter })

export function useFilterContext() {
  return useContext(FilterContext)
}

export const getFilterBody = (
  { account, instanceFamily, region }: Omit<FilterOptions, 'timeRange'>,
  groupBy?: string
): SummaryRequest => {
  return {
    group_by: groupBy,
    instance_families: instanceFamily ? /* istanbul ignore next */ [instanceFamily] : undefined,
    regions: region ? /* istanbul ignore next */ [region] : undefined,
    account_ids: account ? /* istanbul ignore next */ [account] : undefined
  }
}
