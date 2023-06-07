/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import type { MultiSelectOption } from '@wings-software/uicore'
import { Filter, FilterRef } from '@common/components/Filter/Filter'
import { FilterDTO, usePostAuditFilter, useUpdateAuditFilter, useDeleteAuditFilter } from 'services/audit'
import type { FilterDataInterface } from '@common/components/Filter/Constants'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { CrudOperation } from '@common/components/Filter/FilterCRUD/FilterCRUD'
import { StringUtils } from '@common/exports'
import { useStrings } from 'framework/strings'
import { UNSAVED_FILTER } from '@common/components/Filter/utils/FilterUtils'
import AuditTrailFilterForm from './AuditTrailFilterForm'
import { getFilterPropertiesFromForm, getFormValuesFromFilterProperties } from '../../utils/RequestUtil'

interface FilterDrawerProps {
  selectedFilter?: FilterDTO
  selectFilter: (filter: FilterDTO) => void
  applyFilter?: (filter: FilterDTO) => void
  closeDrawer: () => void
  filters: FilterDTO[]
  refetchFilters: () => Promise<void>
}

export interface ProjectSelectOption extends MultiSelectOption {
  orgIdentifier: string
}

export interface AuditTrailFormType {
  actions?: MultiSelectOption[]
  users?: MultiSelectOption[]
  modules?: MultiSelectOption[]
  organizations?: MultiSelectOption[]
  projects?: ProjectSelectOption[]
  resourceType?: MultiSelectOption[]
}

const FilterDrawer: React.FC<FilterDrawerProps> = ({
  closeDrawer,
  filters,
  refetchFilters,
  selectFilter,
  selectedFilter,
  applyFilter
}) => {
  const filterRef = React.useRef<FilterRef<FilterDTO> | null>(null)
  const [isRefreshingFilters, setIsRefreshingFilters] = useState<boolean>(false)
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()

  const onFiltersApply = (formData: AuditTrailFormType): void => {
    const filterFromFormData = getFilterPropertiesFromForm(formData, accountId)
    applyFilter?.({
      name: UNSAVED_FILTER,
      identifier: StringUtils.getIdentifierFromName(UNSAVED_FILTER),
      filterProperties: filterFromFormData
    })
  }

  const { mutate: createFilter } = usePostAuditFilter({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const { mutate: updateFilter } = useUpdateAuditFilter({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const { mutate: deleteFilter } = useDeleteAuditFilter({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier
    }
  })

  const handleDelete = async (identifier: string): Promise<void> => {
    setIsRefreshingFilters(true)
    const deleteHandler = filterRef.current?.deleteFilterHandler
    if (deleteHandler && typeof deleteFilter === 'function') {
      await deleteHandler(identifier)
    }

    await refetchFilters()
    setIsRefreshingFilters(false)
  }

  const handleSaveOrUpdate = async (
    isUpdate: boolean,
    data: FilterDataInterface<AuditTrailFormType, FilterDTO>
  ): Promise<void> => {
    await setIsRefreshingFilters(true)
    const saveOrUpdateHandler = filterRef.current?.saveOrUpdateFilterHandler
    if (saveOrUpdateHandler && typeof saveOrUpdateHandler === 'function') {
      const payload = {
        ...data.metadata,
        identifier: isUpdate ? data.metadata.identifier : StringUtils.getIdentifierFromName(data.metadata.name),
        filterProperties: getFilterPropertiesFromForm(data.formValues, accountId)
      }
      await saveOrUpdateHandler(isUpdate, payload)
    }
    setIsRefreshingFilters(false)
    await refetchFilters()
  }

  return (
    <Filter<AuditTrailFormType, FilterDTO>
      formFields={<AuditTrailFilterForm />}
      onApply={onFiltersApply}
      filters={filters}
      initialFilter={{
        formValues: selectedFilter ? getFormValuesFromFilterProperties(selectedFilter.filterProperties, getString) : {},
        metadata: {
          filterVisibility: selectedFilter?.filterVisibility,
          name: selectedFilter?.name || '',
          identifier: selectedFilter?.identifier || '',
          filterProperties: {}
        }
      }}
      onClear={() =>
        selectFilter({
          name: UNSAVED_FILTER,
          identifier: StringUtils.getIdentifierFromName(UNSAVED_FILTER),
          filterProperties: {}
        })
      }
      onDelete={handleDelete}
      isRefreshingFilters={isRefreshingFilters}
      onFilterSelect={(identifier: string) => {
        if (identifier !== UNSAVED_FILTER) {
          const filter = filters?.find(filtr => filtr.identifier === identifier)
          if (filter) {
            selectFilter(filter)
          }
        }
      }}
      onSuccessfulCrudOperation={refetchFilters}
      onSaveOrUpdate={handleSaveOrUpdate}
      onClose={closeDrawer}
      ref={filterRef}
      dataSvcConfig={
        new Map<CrudOperation, (...rest: any[]) => Promise<any>>([
          ['ADD', createFilter],
          ['UPDATE', updateFilter],
          ['DELETE', deleteFilter]
        ])
      }
    />
  )
}

export default FilterDrawer
