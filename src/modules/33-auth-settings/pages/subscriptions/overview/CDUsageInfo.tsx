/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, PageError } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { useGetUsageAndLimit } from '@common/hooks/useGetUsageAndLimit'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { ModuleName } from 'framework/types/ModuleName'
import type { ModuleLicenseDTO, CDModuleLicenseDTO } from 'services/cd-ng'
import UsageInfoCard, { ErrorContainer } from './UsageInfoCard'

interface SubscriptionUsageProps {
  module: ModuleName
  licenseData: ModuleLicenseDTO
}
const ActiveInstanceCard: React.FC<{ subscribedIns: number; activeIns: number; displayName?: string }> = ({
  subscribedIns,
  activeIns
}) => {
  const { getString } = useStrings()

  const leftHeader = getString('common.subscriptions.usage.srvcInst')
  const tooltip = getString('common.subscriptions.usage.cdSITooltip')
  const rightHeader = getString('common.subscriptions.usage.last30days')
  const hasBar = true
  const leftFooter = getString('common.subscribed')
  const rightFooter = getString('common.subscribed')
  const props = {
    subscribed: subscribedIns,
    usage: activeIns,
    leftHeader,
    tooltip,
    rightHeader,
    hasBar,
    leftFooter,
    rightFooter
  }
  return <UsageInfoCard {...props} />
}

const ActiveServiceCard: React.FC<{ subscribedIns: number; activeIns: number; displayName?: string }> = ({
  subscribedIns,
  activeIns
}) => {
  const { getString } = useStrings()

  const leftHeader = getString('common.subscriptions.usage.serviceLicenses')
  const tooltip = getString('common.subscriptions.usage.cdServiceTooltip')
  const rightHeader = getString('common.subscriptions.usage.last30days')
  const hasBar = true
  const leftFooter = getString('common.subscribed')
  const rightFooter = getString('common.subscribed')
  const props = {
    subscribed: subscribedIns,
    usage: activeIns,
    leftHeader,
    tooltip,
    rightHeader,
    hasBar,
    leftFooter,
    rightFooter
  }
  return <UsageInfoCard {...props} />
}

const CDUsageInfo: React.FC<SubscriptionUsageProps> = props => {
  const { limitData, usageData } = useGetUsageAndLimit(ModuleName.CD)
  const isLoading = limitData.loadingLimit || usageData.loadingUsage
  const { licenseData } = props

  const licenseDataInfo = licenseData as CDModuleLicenseDTO
  if (isLoading) {
    return <ContainerSpinner />
  }

  const { usageErrorMsg, refetchUsage, usage } = usageData
  const { limitErrorMsg, refetchLimit } = limitData

  if (usageErrorMsg) {
    return (
      <ErrorContainer>
        <PageError message={usageErrorMsg} onClick={() => refetchUsage?.()} />
      </ErrorContainer>
    )
  }

  if (limitErrorMsg) {
    return (
      <ErrorContainer>
        <PageError message={limitErrorMsg} onClick={() => refetchLimit?.()} />
      </ErrorContainer>
    )
  }
  if (licenseDataInfo.cdLicenseType === 'SERVICE_INSTANCES') {
    return (
      <Layout.Horizontal spacing="large">
        <ActiveInstanceCard
          subscribedIns={licenseDataInfo.workloads || 0}
          activeIns={usage?.cd?.activeServiceInstances?.count || 0}
        />
      </Layout.Horizontal>
    )
  } else {
    return (
      <Layout.Horizontal spacing="large">
        <ActiveServiceCard
          subscribedIns={licenseDataInfo.workloads || 0}
          activeIns={usage?.cd?.serviceLicenses?.count || 0}
        />
      </Layout.Horizontal>
    )
  }
}

export default CDUsageInfo
