/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, PageError } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { ModuleName } from 'framework/types/ModuleName'
import { useGetUsageAndLimit } from '@common/hooks/useGetUsageAndLimit'
import UsageInfoCard, { ErrorContainer } from './UsageInfoCard'
import { fetchLicenseUseAndSummary } from '@common/hooks/getUsageAndLimitHelper'

const ActiveCloudSpend: React.FC<{
  activeCloudSpend: number
  subscribedCloudSpend: number
  displayName: string | undefined
}> = ({ activeCloudSpend, subscribedCloudSpend, displayName }) => {
  const prefix = '$'
  const { getString } = useStrings()
  const leftHeader = getString('common.subscriptions.usage.cloudSpend')
  const tooltip = getString('common.subscriptions.usage.ccmTooltip')
  const rightHeader = displayName
  const hasBar = true
  const leftFooter = getString('common.subscribed')
  const rightFooter = getString('common.subscribed')
  const props = {
    subscribed: subscribedCloudSpend,
    usage: activeCloudSpend,
    leftHeader,
    tooltip,
    rightHeader,
    hasBar,
    leftFooter,
    rightFooter,
    prefix
  }
  return <UsageInfoCard {...props} />
}

const CCMUsageInfo: React.FC = () => {
  const { data: dataFetched, loading, error, refetch } = fetchLicenseUseAndSummary(ModuleName.CE)
  const { limitData, usageData } = useGetUsageAndLimit(ModuleName.CE, dataFetched, error, loading, refetch)
  const { usageErrorMsg, refetchUsage, usage } = usageData
  const { limitErrorMsg, refetchLimit, limit } = limitData

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

  return (
    <Layout.Horizontal spacing="large">
      <ActiveCloudSpend
        activeCloudSpend={usage?.ccm?.activeSpend?.count as number}
        subscribedCloudSpend={limit?.ccm?.totalSpendLimit || 0}
        displayName={usage?.ccm?.activeSpend?.displayName}
      />
    </Layout.Horizontal>
  )
}

export default CCMUsageInfo
