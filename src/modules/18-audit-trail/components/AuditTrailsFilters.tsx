/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import type { SelectOption } from '@wings-software/uicore'
import { useModalHook } from '@harness/use-modal'
import { useParams } from 'react-router-dom'
import FilterSelector from '@common/components/Filter/FilterSelector/FilterSelector'
import { AuditFilterProperties, FilterDTO, useGetAuditFilterList } from 'services/audit'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { removeNullAndEmpty } from '@common/components/Filter/utils/FilterUtils'
import { useStrings } from 'framework/strings'
import { formToLabelMap, getFormValuesFromFilterProperties } from '@audit-trail/utils/RequestUtil'
import FilterDrawer from './FilterDrawer/FilterDrawer'

interface AuditFiltersProps {
  applyFilters?: (filtersProperties: AuditFilterProperties) => void
}

const AuditTrailsFilters: React.FC<AuditFiltersProps> = ({ applyFilters }) => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const [selectedFilter, setSelectedFilter] = useState<FilterDTO | undefined>()
  const { getString } = useStrings()

  const fieldToLabelMapping = new Map<string, string>()
  fieldToLabelMapping.set('users', getString('common.userLabel'))
  fieldToLabelMapping.set('organizations', getString('orgLabel'))
  fieldToLabelMapping.set('projects', getString('projectLabel'))
  fieldToLabelMapping.set('modules', getString('common.moduleLabel'))
  fieldToLabelMapping.set('resourceType', getString('common.resourceTypeLabel'))
  fieldToLabelMapping.set('actions', getString('action'))

  const { data: filterResponse, refetch: refetchFilterList } = useGetAuditFilterList({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }
  })

  const onFilterSelect = (identifier?: string): void => {
    let filter
    if (identifier) {
      filter = filterResponse?.data?.content?.find(filtr => filtr.identifier === identifier)
    }
    setSelectedFilter(filter)
    applyFilters?.(filter?.filterProperties || {})
  }

  const [openDrawer, closeDrawer] = useModalHook(() => {
    return (
      <FilterDrawer
        filters={filterResponse?.data?.content || []}
        closeDrawer={closeDrawer}
        refetchFilters={refetchFilterList}
        selectedFilter={selectedFilter}
        selectFilter={setSelectedFilter}
        applyFilter={(filter: FilterDTO) => {
          closeDrawer()
          setSelectedFilter(filter)
          applyFilters?.(filter.filterProperties)
        }}
      />
    )
  }, [filterResponse, selectedFilter])

  return (
    <FilterSelector<FilterDTO>
      appliedFilter={selectedFilter}
      filters={filterResponse?.data?.content}
      onFilterBtnClick={openDrawer}
      onFilterSelect={(option: SelectOption) => {
        onFilterSelect(option.value as string)
      }}
      fieldToLabelMapping={fieldToLabelMapping}
      filterWithValidFields={formToLabelMap(
        removeNullAndEmpty(getFormValuesFromFilterProperties(selectedFilter?.filterProperties || {}, getString))
      )}
    />
  )
}

export default AuditTrailsFilters
