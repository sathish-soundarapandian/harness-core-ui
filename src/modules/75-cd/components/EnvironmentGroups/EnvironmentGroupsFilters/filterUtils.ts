/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { MultiSelectOption, SelectOption } from '@harness/uicore'

import type { EnvironmentGroupFilterProperties, NGTag, FilterDTO } from 'services/cd-ng'

import { StringUtils } from '@common/exports'
import type { FilterDataInterface, FilterInterface } from '@common/components/Filter/Constants'

import { UNSAVED_FILTER } from '@common/components/Filter/utils/FilterUtils'

import type { EnvironmentGroupListQueryParams } from '../utils'

export const getHasFilterIdentifier = (filterIdentifier?: string): boolean =>
  Boolean(filterIdentifier && filterIdentifier !== StringUtils.getIdentifierFromName(UNSAVED_FILTER))

export const getHasFilters = ({
  queryParams,
  filterIdentifier
}: {
  queryParams: EnvironmentGroupListQueryParams
  filterIdentifier?: string
  searchTerm?: string
}): boolean => {
  return [queryParams.filters, filterIdentifier].some(filter => filter !== undefined)
}

export const createRequestBodyPayload = ({
  isUpdate,
  data,
  projectIdentifier,
  orgIdentifier
}: {
  isUpdate: boolean
  data: FilterDataInterface<EnvironmentGroupFilterFormType, FilterInterface>
  projectIdentifier: string
  orgIdentifier: string
}): FilterDTO => {
  const {
    metadata: { name, filterVisibility, identifier },
    formValues
  } = data
  const { envGroupName, description, envGroupTags, environments } = formValues
  return {
    name,
    identifier: isUpdate ? identifier : StringUtils.getIdentifierFromName(name),
    filterVisibility: filterVisibility,
    projectIdentifier,
    orgIdentifier,
    filterProperties: {
      filterType: 'EnvironmentGroup',
      envGroupName: envGroupName,
      description: description,
      envGroupTags: /* istanbul ignore next */ Object.keys(envGroupTags || {})?.map((key: string) => {
        return { key, value: envGroupTags?.[key] } as NGTag
      }),
      envIdentifiers: /* istanbul ignore next */ environments?.map((env: MultiSelectOption) => env?.value)
    } as EnvironmentGroupFilterProperties
  }
}

export const getFilterByIdentifier = (identifier: string, filters?: FilterDTO[]): FilterDTO | undefined =>
  filters?.find((filter: FilterDTO) => filter.identifier?.toLowerCase() === identifier.toLowerCase())

export interface EnvironmentGroupFilterFormType extends Omit<EnvironmentGroupFilterProperties, 'envGroupTags'> {
  environments?: MultiSelectOption[]
  envGroupTags?: Record<string, any>
}

export const getMultiSelectFromOptions = (values?: any[]): SelectOption[] | undefined => {
  return values?.map(item => {
    return { label: item.name ?? item, value: item.identifier ?? item }
  })
}
