/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo, useState } from 'react'
import type { SelectOption } from '@harness/uicore'
import { pick } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { useModalHook } from '@harness/use-modal'
import { useStrings } from 'framework/strings'

import { FilterDTO, FilterStatsDTO, useGetFilterList, useRecommendationFilterValues } from 'services/ce'
import { getIdentifierFromName } from '@common/utils/StringUtils'
import FilterSelector from '@common/components/Filter/FilterSelector/FilterSelector'
import { flattenObject, removeNullAndEmpty, UNSAVED_FILTER } from '@common/components/Filter/utils/FilterUtils'
import RecommendationFilterDrawer from './FilterDrawer/FilterDrawer'

export interface RecommendationFiltersProps {
  applyFilters: (filter: Partial<FilterDTO>) => void
  appliedFilter: Partial<FilterDTO>
}

const RecommendationFilters: React.FC<RecommendationFiltersProps> = ({ applyFilters, appliedFilter }) => {
  const { accountId } = useParams<{ accountId: string }>()
  const { getString } = useStrings()
  const unsavedFilter = {
    name: UNSAVED_FILTER,
    identifier: getIdentifierFromName(UNSAVED_FILTER)
  }

  const [selectedFilter, setSelectedFilter] = useState<FilterDTO | undefined>({
    ...unsavedFilter,
    ...(appliedFilter as FilterDTO)
  })

  const [fetchedFilterValues, setFetchedFilterValues] = useState<FilterStatsDTO[]>([])

  const { mutate: fetchFilterValues } = useRecommendationFilterValues({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  useEffect(() => {
    const getRecommendationFilters = async () => {
      const response = await fetchFilterValues({
        columns: ['name', 'resourceType', 'namespace', 'clusterName']
      })

      setFetchedFilterValues(response.data || [])
    }

    getRecommendationFilters()
  }, [])

  const {
    data: fetchedSavedFilters,
    refetch: refetchSavedFilters,
    loading: savedFiltersLoading
  } = useGetFilterList({
    queryParams: {
      accountIdentifier: accountId,
      type: 'CCMRecommendation'
    }
  })

  const savedFilters = fetchedSavedFilters?.data?.content || []

  const onFilterSelect = (identifier?: string): void => {
    let filter
    if (identifier) {
      filter = savedFilters.find(item => item.identifier === identifier)
    }
    setSelectedFilter(filter)
    applyFilters?.({ identifier, filterProperties: filter?.filterProperties })
  }

  const onClearAll = (): void =>
    applyFilters({ identifier: getIdentifierFromName(UNSAVED_FILTER), filterProperties: {} })

  const [openDrawer, closeDrawer] = useModalHook(() => {
    return (
      <RecommendationFilterDrawer
        refetchSavedFilters={refetchSavedFilters}
        selectedFilter={selectedFilter}
        savedFilters={savedFilters}
        savedFiltersLoading={savedFiltersLoading}
        closeDrawer={closeDrawer}
        selectFilter={setSelectedFilter}
        applyFilter={(filter: FilterDTO) => {
          closeDrawer()
          setSelectedFilter(filter)
          applyFilters?.({ identifier: filter?.identifier, filterProperties: filter?.filterProperties })
        }}
        fetchedFilterValues={fetchedFilterValues}
        onClearAll={onClearAll}
      />
    )
  }, [savedFilters, selectedFilter, fetchedFilterValues])

  const fieldToLabelMapping = useMemo(
    () =>
      new Map<string, string>([
        ['names', getString('ce.recommendation.listPage.filters.name')],
        ['namespaces', getString('ce.recommendation.listPage.filters.namespace')],
        ['clusterNames', getString('common.clusterName')],
        ['resourceTypes', getString('common.resourceTypeLabel')],
        ['minCost', getString('ce.recommendation.listPage.filters.potentialSpend')],
        ['minSaving', getString('ce.recommendation.listPage.filters.savings')]
      ]),
    [getString]
  )

  return (
    <FilterSelector<FilterDTO>
      appliedFilter={selectedFilter}
      filters={savedFilters}
      onFilterBtnClick={openDrawer}
      onFilterSelect={(option: SelectOption) => {
        onFilterSelect(option.value as string)
      }}
      fieldToLabelMapping={fieldToLabelMapping}
      filterWithValidFields={removeNullAndEmpty(
        pick(flattenObject(selectedFilter?.filterProperties || {}), ...fieldToLabelMapping.keys())
      )}
    />
  )
}

export default RecommendationFilters
