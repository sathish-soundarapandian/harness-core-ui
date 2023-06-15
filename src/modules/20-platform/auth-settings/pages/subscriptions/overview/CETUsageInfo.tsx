/*
 * Copyright 2023 Harness Inc. All rights reserved.
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
import type { ModuleLicenseDTO, CETModuleLicenseDTO } from 'services/cd-ng'
import UsageInfoCard, { ErrorContainer } from './UsageInfoCard'

interface ActiveAgentsProps {
  subscribedAgents: number
  activeAgents: number
}

interface SubscriptionUsageProps {
  module: ModuleName
  licenseData: ModuleLicenseDTO
}

const ActiveAgents: React.FC<ActiveAgentsProps> = ({ subscribedAgents, activeAgents }) => {
  const { getString } = useStrings()
  const leftHeader = getString('common.subscriptions.usage.cetAgents')
  const rightHeader = getString('common.current')
  const tooltip = getString('common.subscriptions.usage.cetAgentToolTip')
  const hasBar = true
  const leftFooter = getString('common.subscribed')
  const rightFooter = getString('common.usage')
  const props = {
    subscribed: subscribedAgents,
    usage: activeAgents,
    leftHeader,
    tooltip,
    rightHeader,
    hasBar,
    leftFooter,
    rightFooter
  }
  return <UsageInfoCard {...props} />
}

const CETUsageInfo: React.FC<SubscriptionUsageProps> = props => {
  const { licenseData } = props
  const { usageData } = useGetUsageAndLimit(ModuleName.CET)

  const isLoading = usageData.loadingUsage

  if (isLoading) {
    return <ContainerSpinner />
  }

  const { usageErrorMsg, refetchUsage, usage } = usageData
  const licenseDataInfo = licenseData as CETModuleLicenseDTO

  if (usageErrorMsg) {
    return (
      <ErrorContainer>
        <PageError message={usageErrorMsg} onClick={() => refetchUsage?.()} />
      </ErrorContainer>
    )
  }

  return (
    <Layout.Horizontal spacing="large">
      <ActiveAgents
        subscribedAgents={licenseDataInfo?.numberOfAgents || 0}
        activeAgents={usage?.cet?.activeAgents?.count || 0}
      />
    </Layout.Horizontal>
  )
}

export default CETUsageInfo
