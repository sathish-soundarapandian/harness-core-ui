/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import type { SelectOption } from '@harness/uicore'
import type { ModuleLicenseDTO } from 'services/cd-ng'
import { useCiLicenseUsage, CiLicenseUsageQueryParams } from 'services/ci'
import { useUpdateQueryParams, useQueryParams, useMutateAsGet } from '@common/hooks'
import { usePreferenceStore, PreferenceScope } from 'framework/PreferenceStore/PreferenceStoreContext'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { queryParamDecodeAll } from '@common/hooks/useQueryParams'
import type { ModuleName } from 'framework/types/ModuleName'
import { ActiveDevelopersTableCI } from './ActiveDevelopersTableCI'

interface CDUsageTableProps {
  module: ModuleName
  licenseData?: ModuleLicenseDTO
  licenseType?: 'SERVICES' | 'SERVICE_INSTANCES'
}
const DEFAULT_ACTIVE_SERVICE_LIST_TABLE_SORT = ['lastBuild', 'DESC']
const DEFAULT_PAGE_INDEX = 0
const DEFAULT_PAGE_SIZE = 10
type ProcessedCIUsageServiceListPageQueryParams = RequiredPick<CiLicenseUsageQueryParams, 'page' | 'size' | 'sort'>
const queryParamOptions = {
  parseArrays: true,
  decoder: queryParamDecodeAll(),
  processQueryParams(params: CiLicenseUsageQueryParams): ProcessedCIUsageServiceListPageQueryParams {
    return {
      ...params,
      page: params.page ?? DEFAULT_PAGE_INDEX,
      size: params.size ?? DEFAULT_PAGE_SIZE,
      sort: params.sort ?? DEFAULT_ACTIVE_SERVICE_LIST_TABLE_SORT
    }
  }
}

const CIUsageTable: React.FC<CDUsageTableProps> = () => {
  const { updateQueryParams } = useUpdateQueryParams<Partial<CiLicenseUsageQueryParams>>()
  const { accountId } = useParams<AccountPathProps>()
  const { preference: sortingPreference, setPreference: setSortingPreference } = usePreferenceStore<string | undefined>(
    PreferenceScope.USER,
    'CIUsageTableSortingPreference'
  )
  const queryParams = useQueryParams<CiLicenseUsageQueryParams>(queryParamOptions)
  const { page, size } = queryParams
  const [orgName, setOrgName] = useState<string>('')
  const [projName, setProjName] = useState<string>('')
  const [developer, setDeveloper] = useState<string>('')
  const sort = useMemo(
    () => (sortingPreference ? JSON.parse(sortingPreference) : queryParams.sort),
    [queryParams.sort, sortingPreference]
  )
  const { data: activeDevelopersList, loading } = useMutateAsGet(useCiLicenseUsage, {
    body: {
      orgIdentifier: orgName,
      projectIdentifier: projName,
      developer: developer
    },
    queryParams: {
      accountIdentifier: accountId,
      page,
      sort,
      size
    },
    queryParamStringifyOptions: { arrayFormat: 'comma' }
  })
  const updateFilters = (
    orgId: SelectOption | undefined,
    projId: SelectOption | undefined,
    developerId: SelectOption | undefined
  ) => {
    setOrgName(orgId?.value as string)
    setProjName(projId?.value as string)
    setDeveloper(developerId?.value as string)
  }
  return (
    <ActiveDevelopersTableCI
      gotoPage={pageNumber => updateQueryParams({ page: pageNumber })}
      data={activeDevelopersList?.data || {}}
      setSortBy={sortArray => {
        setSortingPreference(JSON.stringify(sortArray))
        updateQueryParams({ sort: sortArray })
      }}
      sortBy={sort}
      updateFilters={updateFilters}
      servicesLoading={loading}
    />
  )
}

export default CIUsageTable
