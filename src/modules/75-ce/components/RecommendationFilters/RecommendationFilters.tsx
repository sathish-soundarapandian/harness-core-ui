/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Text, Layout, Icon, DropDown, SelectOption } from '@wings-software/uicore'
import { Color } from '@wings-software/design-system'
import { useStrings } from 'framework/strings'
import type { FilterStatsDTO, K8sRecommendationFilterPropertiesDTO } from 'services/ce'
import useRecommendationFilterPanel from './RecommendationFilterPanel'

import css from './RecommendationFilters.module.scss'

interface RecommendationFiltersProps {
  fetching: boolean
  setFilters: (newValue: K8sRecommendationFilterPropertiesDTO) => void
  filters: K8sRecommendationFilterPropertiesDTO
  fetchedFilterValues: FilterStatsDTO[]
  costFilters: { minCost: number; minSaving: number }
  setCostFilters: (newValue: { minCost: number; minSaving: number }) => void
}

const RecommendationFilters: React.FC<RecommendationFiltersProps> = ({
  fetching,
  filters,
  fetchedFilterValues,
  setFilters,
  costFilters,
  setCostFilters
}) => {
  const { getString } = useStrings()

  const { openFilterDrawer, savedFilters, setSavedFilter, selectedFilter } = useRecommendationFilterPanel({
    fetchedFilterValues,
    filters,
    setFilters,
    costFilters,
    setCostFilters
  })

  const savedFilterOptions = savedFilters.map(filter => ({
    label: filter.name,
    value: filter.identifier
  })) as SelectOption[]

  return fetching ? (
    <Icon name="spinner" size={24} color={Color.BLUE_500} style={{ alignSelf: 'center' }} />
  ) : (
    <Layout.Horizontal spacing={'large'}>
      <DropDown
        placeholder={getString(savedFilters.length > 0 ? 'filters.selectFilter' : 'common.filters.noFilterSaved')}
        filterable={false}
        disabled={savedFilters.length === 0}
        onChange={option => setSavedFilter(option)}
        addClearBtn={true}
        value={selectedFilter?.identifier}
        items={savedFilterOptions}
      />
      <Text border={{ right: true, color: Color.GREY_300 }} />
      <Icon
        name="ng-filter"
        size={24}
        color={Color.PRIMARY_7}
        onClick={openFilterDrawer}
        className={css.pointer}
        style={{ alignSelf: 'center' }}
      />
    </Layout.Horizontal>
  )
}

export default RecommendationFilters
