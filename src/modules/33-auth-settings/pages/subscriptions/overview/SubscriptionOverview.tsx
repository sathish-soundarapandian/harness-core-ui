/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout } from '@harness/uicore'
import { useParams } from 'react-router-dom'
import { ModuleName } from 'framework/types/ModuleName'
import type { ModuleLicenseDTO, CDModuleLicenseDTO } from 'services/cd-ng'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import SubscriptionDetailsCard from './SubscriptionDetailsCard'
import type { TrialInformation } from '../SubscriptionsPage'
import SubscriptionUsageCard from './SubscriptionUsageCard'

import SubscriptionTabPage from './SubscriptionTabPage'
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
  const { accountId } = useParams<AccountPathProps>()
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
      <SubscriptionTabPage
        module={module}
        licenseData={licenseData}
        accountId={accountId}
        licenseType={(licenseData as CDModuleLicenseDTO)?.cdLicenseType}
      ></SubscriptionTabPage>
    </Layout.Vertical>
  )
}
export default SubscriptionOverview
