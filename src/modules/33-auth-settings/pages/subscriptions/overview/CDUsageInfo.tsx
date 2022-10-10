/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { Layout, PageError } from '@wings-software/uicore'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { useGetUsageAndLimit } from '@common/hooks/useGetUsageAndLimit'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { ModuleName } from 'framework/types/ModuleName'
import UsageInfoCard, { ErrorContainer } from './UsageInfoCard'
import { fetchLicenseUseAndSummary } from '@common/hooks/getUsageAndLimitHelper'

const ActiveInstanceCard: React.FC<{ subscribedIns: number; activeIns: number; displayName?: string }> = ({
  subscribedIns,
  activeIns,
  displayName
}) => {
  const { getString } = useStrings()

  const leftHeader = getString('common.subscriptions.usage.srvcInst')
  const tooltip = getString('common.subscriptions.usage.cdSITooltip')
  const rightHeader = displayName || getString('common.subscriptions.usage.last30days')
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

const ActiveServices: React.FC<{ subscribedService: number; activeService: number; displayName?: string }> = ({
  subscribedService,
  activeService,
  displayName
}) => {
  const { getString } = useStrings()

  const leftHeader = getString('common.subscriptions.usage.services')
  const tooltip = getString('common.subscriptions.usage.cdServiceTooltip')
  const rightHeader = displayName || getString('common.subscriptions.usage.last30days')
  const hasBar = true
  const leftFooter = getString('total')
  const props = {
    subscribed: subscribedService,
    usage: activeService,
    leftHeader,
    tooltip,
    rightHeader,
    hasBar,
    leftFooter
  }
  return <UsageInfoCard {...props} />
}

const CDUsageInfo: React.FC = () => {
  const { accountId } = useParams<AccountPathProps>()
  const { data: dataFetched, loading, error, refetch } = fetchLicenseUseAndSummary(ModuleName.CD, accountId)
  const { limitData, usageData } = useGetUsageAndLimit(ModuleName.CE, dataFetched, error, loading, refetch)
  const isLoading = limitData.loadingLimit || usageData.loadingUsage

  if (isLoading) {
    return <ContainerSpinner />
  }

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
      <ActiveInstanceCard
        subscribedIns={limit?.cd?.totalServiceInstances || 0}
        activeIns={usage?.cd?.activeServiceInstances?.count || 0}
        displayName={usage?.cd?.activeServiceInstances?.displayName}
      />
      <ActiveServices
        subscribedService={limit?.cd?.totalWorkload || 0}
        activeService={usage?.cd?.activeServices?.count || 0}
        displayName={usage?.cd?.activeServices?.displayName}
      />
    </Layout.Horizontal>
  )
}

export default CDUsageInfo
