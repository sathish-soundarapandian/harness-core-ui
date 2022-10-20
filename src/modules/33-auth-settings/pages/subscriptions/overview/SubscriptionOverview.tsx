/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'

import { Layout } from '@wings-software/uicore'
import type { ModuleName } from 'framework/types/ModuleName'

import type { ModuleLicenseDTO } from 'services/cd-ng'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import SubscriptionDetailsCard from './SubscriptionDetailsCard'
import SubscriptionUsageCard from './SubscriptionUsageCard'
import type { TrialInformation } from '../SubscriptionsPage'

interface SubscriptionOverviewProps {
  accountName?: string
  licenseData?: ModuleLicenseDTO
  module: ModuleName
  trialInformation: TrialInformation
  refetchGetLicense?: () => void
}

const SubscriptionOverview: React.FC<SubscriptionOverviewProps> = props => {
  const { accountName, licenseData, module, trialInformation, refetchGetLicense } = props

  return (
    <Layout.Vertical spacing="large" width={'90%'}>
      <SubscriptionDetailsCard
        accountName={accountName}
        module={module}
        licenseData={licenseData}
        trialInformation={trialInformation}
        refetchGetLicense={refetchGetLicense}
      />
      {licenseData && <SubscriptionUsageCard module={module} />}
    </Layout.Vertical>
  )
}

export default SubscriptionOverview
