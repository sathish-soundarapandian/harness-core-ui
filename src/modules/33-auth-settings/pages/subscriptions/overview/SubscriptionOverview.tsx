/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect, useCallback } from 'react'

import { Layout, shouldShowError } from '@harness/uicore'
import type { ModuleName } from 'framework/types/ModuleName'

import type { ModuleLicenseDTO } from 'services/cd-ng'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import SubscriptionDetailsCard from './SubscriptionDetailsCard'
import SubscriptionUsageCard from './SubscriptionUsageCard'
import { ServiceLicenseTable } from './ServiceLicenseTable'

import type { TrialInformation } from '../SubscriptionsPage'
import type { PipelineListPageQueryParams, PipelineListPagePathParams } from '@pipeline/pages/pipeline-list/types'
import { useUpdateQueryParams, useQueryParams } from '@common/hooks'
import { PagePMSPipelineSummaryResponse, PipelineFilterProperties, useGetPipelineList } from 'services/pipeline-ng'
import { usePreferenceStore, PreferenceScope } from 'framework/PreferenceStore/PreferenceStoreContext'
import { queryParamOptions, ProcessedPipelineListPageQueryParams } from '@pipeline/pages/pipeline-list/PipelineListPage'
import { showError } from '@cf/pages/pipeline-studio/views/StageOverview/__tests__/StageOverviewTestHelper'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { useParams } from 'react-router'
interface SubscriptionOverviewProps {
  accountName?: string
  licenseData?: ModuleLicenseDTO
  module: ModuleName
  trialInformation: TrialInformation
  refetchGetLicense?: () => void
}

const SubscriptionOverview: React.FC<SubscriptionOverviewProps> = props => {
  const { accountName, licenseData, module, trialInformation, refetchGetLicense } = props
  const enabled = useFeatureFlag(FeatureFlag.VIEW_USAGE_ENABLED)
  const [activeServiceLicenseList, setActiveServiceLicenseList] = useState<PagePMSPipelineSummaryResponse | undefined>()
  const { updateQueryParams } = useUpdateQueryParams<Partial<PipelineListPageQueryParams>>()
  const { preference: sortingPreference, setPreference: setSortingPreference } = usePreferenceStore<string | undefined>(
    PreferenceScope.USER,
    'PipelineSortingPreference'
  )
  const pathParams = useParams<PipelineListPagePathParams>()
  const { projectIdentifier, orgIdentifier, accountId } = pathParams
  const { getRBACErrorMessage } = useRBACError()
  const queryParams = useQueryParams<ProcessedPipelineListPageQueryParams>(queryParamOptions)
  const sort = sortingPreference ? JSON.parse(sortingPreference) : queryParams.sort
  const { searchTerm, repoIdentifier, branch, page, size, repoName } = queryParams

  const fetchServiceLicenseTable = useCallback(async () => {
    // try {

    //   }
    const filter: PipelineFilterProperties = {
      filterType: 'ServiceLicenseTable',
      repoName
    }
    const { status, data } = await loadServiceLicenseTable(filter, {
      queryParams: {
        accountIdentifier: accountId,
        projectIdentifier,
        orgIdentifier,
        searchTerm,
        page,
        sort,
        size,
        ...(repoIdentifier &&
          branch && {
            repoIdentifier,
            branch
          })
      }
    })
    if (status === 'SUCCESS') {
      setActiveServiceLicenseList(data)
    }
  }, [])

  useEffect(() => {
    fetchServiceLicenseTable()
  }, [fetchServiceLicenseTable])

  const {
    mutate: loadServiceLicenseTable,
    error: serviceLicenseListLoadingError,
    loading: isServiceLicenseListLoading
  } = useGetPipelineList({
    queryParamStringifyOptions: { arrayFormat: 'comma' }
  })
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
        data={pipelineList || []}
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
