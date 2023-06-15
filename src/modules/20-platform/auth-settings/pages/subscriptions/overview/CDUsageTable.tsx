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
import { useLisCDActiveServices, LisCDActiveServicesQueryParams } from 'services/cd-ng'
import { useUpdateQueryParams, useQueryParams, useMutateAsGet } from '@common/hooks'
import { usePreferenceStore, PreferenceScope } from 'framework/PreferenceStore/PreferenceStoreContext'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { queryParamDecodeAll } from '@common/hooks/useQueryParams'
import type { CDModuleLicenseDTO } from 'services/portal'
import type { ModuleName } from 'framework/types/ModuleName'
import { ServiceLicenseTable } from './ServiceLicenseTable'

interface CDUsageTableProps {
  module: ModuleName
  licenseData?: ModuleLicenseDTO
  licenseType?: 'SERVICES' | 'SERVICE_INSTANCES'
}
const DEFAULT_ACTIVE_SERVICE_LIST_TABLE_SORT = ['serviceInstances', 'DESC']
const DEFAULT_PAGE_INDEX = 0
const DEFAULT_PAGE_SIZE = 20
type ProcessedActiveServiceListPageQueryParams = RequiredPick<LisCDActiveServicesQueryParams, 'page' | 'size' | 'sort'>
const queryParamOptions = {
  parseArrays: true,
  decoder: queryParamDecodeAll(),
  processQueryParams(params: LisCDActiveServicesQueryParams): ProcessedActiveServiceListPageQueryParams {
    return {
      ...params,
      page: params.page ?? DEFAULT_PAGE_INDEX,
      size: params.size ?? DEFAULT_PAGE_SIZE,
      sort: params.sort ?? DEFAULT_ACTIVE_SERVICE_LIST_TABLE_SORT
    }
  }
}

const CDUsageTable: React.FC<CDUsageTableProps> = props => {
  const { licenseData } = props

  const { updateQueryParams } = useUpdateQueryParams<Partial<LisCDActiveServicesQueryParams>>()
  const { accountId } = useParams<AccountPathProps>()
  const { preference: sortingPreference, setPreference: setSortingPreference } = usePreferenceStore<string | undefined>(
    PreferenceScope.USER,
    'ActiveServiceSortingPreference'
  )
  const queryParams = useQueryParams<LisCDActiveServicesQueryParams>(queryParamOptions)
  const { page, size } = queryParams
  const [orgName, setOrgName] = useState<string>('')
  const [projName, setProjName] = useState<string>('')
  const [serviceName, setServiceName] = useState<string>('')
  const sort = useMemo(
    () => (sortingPreference ? JSON.parse(sortingPreference) : queryParams.sort),
    [queryParams.sort, sortingPreference]
  )
  const { data: activeServiceList, loading } = useMutateAsGet(useLisCDActiveServices, {
    body: {
      orgIdentifier: orgName,
      projectIdentifier: projName,
      serviceIdentifier: serviceName
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
    serviceId: SelectOption | undefined
  ) => {
    setOrgName(orgId?.value as string)
    setProjName(projId?.value as string)
    setServiceName(serviceId?.value as string)
  }
  return (
    <ServiceLicenseTable
      gotoPage={pageNumber => updateQueryParams({ page: pageNumber })}
      data={activeServiceList?.data || {}}
      setSortBy={sortArray => {
        setSortingPreference(JSON.stringify(sortArray))
        updateQueryParams({ sort: sortArray })
      }}
      sortBy={sort}
      updateFilters={updateFilters}
      servicesLoading={loading}
      licenseType={(licenseData as CDModuleLicenseDTO)?.cdLicenseType || ''}
    />
  )
}

export default CDUsageTable
