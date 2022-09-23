/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { Color } from '@harness/design-system'
import type { StringKeys } from 'framework/strings'
import { FilterCard } from './FilterCard'
import css from './TableFilters.module.scss'
export interface FilterProps {
  label: StringKeys
  total: number
  queryProps?: Record<string, any>
  tooltipId?: string
  filterTotalColor?: Color
}
export interface TableFiltersProps {
  filters: Array<FilterProps>
  currentFilter: FilterProps | Record<string, any>
  updateTableFilter: (filter: FilterProps | Record<string, any>) => void
}

export const TableFilters: React.FC<TableFiltersProps> = ({ filters, currentFilter, updateTableFilter }) => {
  return (
    <div className={css.filterLayout}>
      {filters.map((filter, i) => (
        <FilterCard
          key={i}
          filter={filter}
          updateTableFilter={updateTableFilter}
          selected={
            currentFilter.queryProps?.key === filter.queryProps?.key &&
            currentFilter.queryProps?.value === filter.queryProps?.value
          }
        />
      ))}
    </div>
  )
}
