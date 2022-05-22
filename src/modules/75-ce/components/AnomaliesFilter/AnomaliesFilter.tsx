/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { DropDown, FlexExpander, Layout, Text, Icon, SelectOption } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { AnomalyFilterProperties, FilterStatsDTO } from 'services/ce'
import PerspectiveTimeRangePicker from '@ce/components/PerspectiveTimeRangePicker/PerspectiveTimeRangePicker'
import type { setTimeRangeFn } from '@ce/types'
import useAnomaliesFilterPanel from './AnomaliesFilterPanel'

import css from './AnomaliesFilter.module.scss'

interface AnomalyFiltersProps {
  filters: AnomalyFilterProperties
  setFilters: (newValue: AnomalyFilterProperties) => void
  timeRange: {
    to: string
    from: string
  }
  setTimeRange: setTimeRangeFn
  fetchedFilterValues: FilterStatsDTO[]
  fetching: boolean
}

const AnomalyFilters: React.FC<AnomalyFiltersProps> = ({
  filters,
  setFilters,
  timeRange,
  setTimeRange,
  fetching,
  fetchedFilterValues
}) => {
  const { getString } = useStrings()

  const { openFilterDrawer, savedFilters, setSavedFilter, selectedFilter } = useAnomaliesFilterPanel({
    fetchedFilterValues,
    filters,
    setFilters
  })

  const savedFilterOptions = savedFilters.map(filter => ({
    label: filter.name,
    value: filter.identifier
  })) as SelectOption[]

  return (
    <Layout.Horizontal spacing="large" className={css.header}>
      <Layout.Horizontal spacing="large" style={{ alignItems: 'center' }}></Layout.Horizontal>
      <FlexExpander />
      {fetching ? (
        <Icon name="spinner" color={Color.BLUE_500} size={24} />
      ) : (
        <>
          <DropDown
            placeholder={getString(savedFilters.length > 0 ? 'filters.selectFilter' : 'common.filters.noFilterSaved')}
            filterable={false}
            disabled={savedFilters.length === 0}
            onChange={option => setSavedFilter(option)}
            addClearBtn={true}
            value={selectedFilter?.identifier}
            items={savedFilterOptions}
          />
          <Icon
            name="ng-filter"
            size={24}
            onClick={openFilterDrawer}
            color={Color.PRIMARY_7}
            className={css.pointer}
            style={{ alignSelf: 'center' }}
          />
          <Text border={{ right: true, color: Color.GREY_300 }} />
          <PerspectiveTimeRangePicker timeRange={timeRange} setTimeRange={setTimeRange} />
        </>
      )}
    </Layout.Horizontal>
  )
}

export default AnomalyFilters
