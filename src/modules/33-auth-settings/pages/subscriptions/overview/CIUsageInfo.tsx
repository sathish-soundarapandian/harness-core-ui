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
import { useFetchLicenseUseAndSummary } from '@common/hooks/getUsageAndLimitHelper'
import UsageInfoCard, { ErrorContainer } from './UsageInfoCard'

interface ActiveDevelopersProps {
  subscribedUsers: number
  activeUsers: number
  rightHeader: string
}

const ActiveDevelopers: React.FC<ActiveDevelopersProps> = ({ subscribedUsers, activeUsers, rightHeader }) => {
  const { getString } = useStrings()
  const leftHeader = getString('common.subscriptions.usage.activeDevelopers')
  const tooltip = getString('common.subscriptions.usage.ciTooltip')
  const hasBar = true
  const leftFooter = getString('common.subscribed')
  const defaultRightHeader = rightHeader || getString('common.subscriptions.usage.last30days')
  const props = {
    subscribed: subscribedUsers,
    usage: activeUsers,
    leftHeader,
    tooltip,
    rightHeader: defaultRightHeader,
    hasBar,
    leftFooter
  }
  return <UsageInfoCard {...props} />
}

const CIUsageInfo: React.FC = () => {
  const { accountId } = useParams<AccountPathProps>()
  const { data: dataFetched, loading, error, refetch } = useFetchLicenseUseAndSummary(ModuleName.CI, accountId)
  const { limitData, usageData } = useGetUsageAndLimit(
    ModuleName.CI,
    error || undefined,
    dataFetched || undefined,
    loading,
    refetch
  )
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
      <ActiveDevelopers
        rightHeader={usage?.ci?.activeCommitters?.displayName || ''}
        subscribedUsers={limit?.ci?.totalDevelopers || 0}
        activeUsers={usage?.ci?.activeCommitters?.count || 0}
      />
    </Layout.Horizontal>
  )
}

export default CIUsageInfo
