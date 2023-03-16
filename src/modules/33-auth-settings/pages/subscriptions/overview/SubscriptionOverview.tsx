/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState } from 'react'

import { Layout, SelectOption } from '@harness/uicore'
import { useParams } from 'react-router-dom'
import { ModuleName } from 'framework/types/ModuleName'
import type { ModuleLicenseDTO } from 'services/cd-ng'
import { useLisCDActiveServices, LisCDActiveServicesQueryParams } from 'services/cd-ng'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import { useUpdateQueryParams, useQueryParams, useMutateAsGet } from '@common/hooks'
import { usePreferenceStore, PreferenceScope } from 'framework/PreferenceStore/PreferenceStoreContext'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { queryParamDecodeAll } from '@common/hooks/useQueryParams'
import type { CDModuleLicenseDTO } from 'services/portal'
import SubscriptionDetailsCard from './SubscriptionDetailsCard'
import SubscriptionUsageCard from './SubscriptionUsageCard'
import { ServiceLicenseTable } from './ServiceLicenseTable'
import { ServiceLicenseGraphs } from './ServiceLicenseGraphs'
import type { TrialInformation } from '../SubscriptionsPage'
interface SubscriptionOverviewProps {
  accountName?: string
  licenseData?: ModuleLicenseDTO
  module: ModuleName
  trialInformation: TrialInformation
  refetchGetLicense?: () => void
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
const SubscriptionOverview: React.FC<SubscriptionOverviewProps> = props => {
  const { accountName, licenseData, module, trialInformation, refetchGetLicense } = props
  const enabled = useFeatureFlag(FeatureFlag.VIEW_USAGE_ENABLED)
  const { updateQueryParams } = useUpdateQueryParams<Partial<LisCDActiveServicesQueryParams>>()
  const { preference: sortingPreference, setPreference: setSortingPreference } = usePreferenceStore<string | undefined>(
    PreferenceScope.USER,
    'ActiveServiceSortingPreference'
  )
  const { accountId } = useParams<AccountPathProps>()
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
    <Layout.Vertical spacing="large" width={'90%'}>
      <SubscriptionDetailsCard
        accountName={accountName}
        module={module}
        licenseData={licenseData}
        trialInformation={trialInformation}
        refetchGetLicense={refetchGetLicense}
      />
      {enabled && licenseData && module !== ModuleName.CHAOS && (
        <SubscriptionUsageCard module={module} licenseData={licenseData} />
      )}
      {module === 'CD' ? (
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
      ) : null}
      {module === 'CD' ? (
        <ServiceLicenseGraphs
          accountId={accountId}
          licenseType={(licenseData as CDModuleLicenseDTO)?.cdLicenseType}
          licenseData={licenseData}
        ></ServiceLicenseGraphs>
      ) : null}
    </Layout.Vertical>
  )
}

export default SubscriptionOverview
