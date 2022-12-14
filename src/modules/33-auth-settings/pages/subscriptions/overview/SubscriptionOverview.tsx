/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'

import { Layout } from '@harness/uicore'
import type { ModuleName } from 'framework/types/ModuleName'

import type { ModuleLicenseDTO } from 'services/cd-ng'
import { useLisCDActiveServices, LisCDActiveServicesQueryParams } from 'services/cd-ng'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import SubscriptionDetailsCard from './SubscriptionDetailsCard'
import SubscriptionUsageCard from './SubscriptionUsageCard'
import { ServiceLicenseTable } from './ServiceLicenseTable'
import type { TrialInformation } from '../SubscriptionsPage'
import { useUpdateQueryParams, useQueryParams, useMutateAsGet } from '@common/hooks'
import { usePreferenceStore, PreferenceScope } from 'framework/PreferenceStore/PreferenceStoreContext'

// import { showError } from '@cf/pages/pipeline-studio/views/StageOverview/__tests__/StageOverviewTestHelper'
// import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { useParams } from 'react-router'
// import type { PartiallyRequired } from '@pipeline/utils/types'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import type { PartiallyRequired } from '@pipeline/utils/types'
import { queryParamDecodeAll } from '@common/hooks/useQueryParams'
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@pipeline/utils/constants'
import { DEFAULT_ACTIVE_SERVICE_LIST_TABLE_SORT } from './Constants'
interface SubscriptionOverviewProps {
  accountName?: string
  licenseData?: ModuleLicenseDTO
  module: ModuleName
  trialInformation: TrialInformation
  refetchGetLicense?: () => void
}
type ProcessedActiveServiceListPageQueryParams = PartiallyRequired<
  LisCDActiveServicesQueryParams,
  'page' | 'size' | 'sort'
>
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
    'PipelineSortingPreference'
  )
  const { accountId } = useParams<AccountPathProps>()
  // const { getRBACErrorMessage } = useRBACError()
  const queryParams = useQueryParams<LisCDActiveServicesQueryParams>(queryParamOptions)
  const { page, size } = queryParams

  const sort = useMemo(
    () => (sortingPreference ? JSON.parse(sortingPreference) : queryParams.sort),
    [queryParams.sort, sortingPreference]
  )
  const { data: activeServiceList } = useMutateAsGet(useLisCDActiveServices, {
    body: {
      orgName: 'all',
      projectName: 'all',
      serviceName: 'all'
    },
    queryParams: {
      accountIdentifier: accountId,
      page,
      sort,
      size,
      timestamp: '12345678'
    },
    queryParamStringifyOptions: { arrayFormat: 'comma' }
  })

  const activeServiceList2 = {
    status: 'SUCCESS',
    data: {
      content: [
        {
          className: '.cd.ActiveServiceDTO',
          identifier: 'K8S_Service',
          name: 'K8S Service',
          orgName: 'Deleted',
          projectName: 'Deleted',
          instanceCount: 1,
          lastDeployed: 1653423593332,
          licensesConsumed: 1,
          accountIdentifier: 'kmpySmUISimoRrJL6NL73w',
          module: 'Continuous Deployment',
          timestamp: 1655762159070
        },
        {
          className: '.cd.ActiveServiceDTO',
          identifier: 'SSHService',
          name: 'SSHService',
          orgName: 'Deleted',
          projectName: 'Deleted',
          instanceCount: 2,
          lastDeployed: 1655761784716,
          licensesConsumed: 1,
          accountIdentifier: 'kmpySmUISimoRrJL6NL73w',
          module: 'Continuous Deployment',
          timestamp: 1655762159070
        }
      ],
      pageable: {
        sort: {
          unsorted: false,
          sorted: true,
          empty: false
        },
        pageSize: 30,
        pageNumber: 0,
        offset: 0,
        paged: true,
        unpaged: false
      },
      last: true,
      totalElements: 2,
      totalPages: 1,
      first: true,
      numberOfElements: 2,
      sort: {
        unsorted: false,
        sorted: true,
        empty: false
      },
      number: 0,
      size: 30,
      empty: false
    },
    metaData: null,
    correlationId: '4859e8a2-2e7f-4f49-9205-052f1ae813f3'
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
      {enabled && licenseData && <SubscriptionUsageCard module={module} licenseData={licenseData} />}
      <ServiceLicenseTable
        gotoPage={pageNumber => updateQueryParams({ page: pageNumber })}
        data={activeServiceList2?.data || []}
        setSortBy={sortArray => {
          setSortingPreference(JSON.stringify(sortArray))
          updateQueryParams({ sort: sortArray })
        }}
        sortBy={sort}
      />
    </Layout.Vertical>
  )
}

export default SubscriptionOverview
