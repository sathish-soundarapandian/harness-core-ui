/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, PageError } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { useGetUsageAndLimit } from '@common/hooks/useGetUsageAndLimit'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { ModuleName } from 'framework/types/ModuleName'
import UsageInfoCard, { ErrorContainer } from './UsageInfoCard'

interface ActiveDevelopersProps {
  subscribedUsers: number
  activeUsers: number
  rightHeader: string
}

interface SecurityScansProps {
  subscribedScans: number
  activeScans: number
  rightHeader: string
}

const ActiveDevelopers: React.FC<ActiveDevelopersProps> = ({ subscribedUsers, activeUsers, rightHeader }) => {
  const { getString } = useStrings()
  const leftHeader = getString('common.subscriptions.usage.stoDevelopers')
  const tooltip = getString('common.subscriptions.usage.stoDevelopersTooltip')
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

const SecurityScans: React.FC<SecurityScansProps> = ({ subscribedScans, activeScans, rightHeader }) => {
  const { getString } = useStrings()
  const leftHeader = getString('common.subscriptions.usage.stoScans')
  const tooltip = getString('common.subscriptions.usage.stoScansTooltip')
  const hasBar = true
  const leftFooter = getString('common.subscribed')
  const defaultRightHeader = rightHeader || getString('common.subscriptions.usage.last30days')
  const props = {
    subscribed: subscribedScans,
    usage: activeScans,
    leftHeader,
    tooltip,
    rightHeader: defaultRightHeader,
    hasBar,
    leftFooter
  }
  return <UsageInfoCard {...props} />
}

const STOUsageInfo: React.FC = () => {
  const { limitData, usageData } = useGetUsageAndLimit(ModuleName.STO)

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
        rightHeader={usage?.sto?.activeDevelopers?.displayName || ''}
        subscribedUsers={limit?.sto?.totalDevelopers || 0}
        activeUsers={usage?.sto?.activeDevelopers?.count || 0}
      />
      <SecurityScans
        rightHeader={usage?.sto?.activeScans?.displayName || ''}
        subscribedScans={limit?.sto?.totalScans || 0}
        activeScans={usage?.sto?.activeScans?.count || 0}
      />
    </Layout.Horizontal>
  )
}

export default STOUsageInfo
