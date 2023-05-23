/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, PageError } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { ModuleName } from 'framework/types/ModuleName'
import { useGetUsageAndLimit } from '@common/hooks/useGetUsageAndLimit'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import UsageInfoCard, { ErrorContainer } from './UsageInfoCard'

const ExperimentsRunPerMonth: React.FC<{
  experimentsRunPerMonth: number
  totalExperimentsRunPerMonthAllowed: number
}> = ({ experimentsRunPerMonth, totalExperimentsRunPerMonthAllowed }) => {
  const { getString } = useStrings()
  const leftHeader = getString('common.subscriptions.usage.chaosExperimentRuns')
  const tooltip = getString('common.subscriptions.usage.chaosExperimentRunsTooltip')
  const rightHeader = getString('common.subscriptions.usage.last30days')
  const hasBar = true
  const leftFooter = getString('common.subscribed')
  const rightFooter = getString('common.subscribed')
  const props = {
    subscribed: totalExperimentsRunPerMonthAllowed,
    usage: experimentsRunPerMonth,
    leftHeader,
    tooltip,
    rightHeader,
    hasBar,
    leftFooter,
    rightFooter
  }
  return <UsageInfoCard {...props} />
}

const ChaosUsageInfo: React.FC = () => {
  const { limitData, usageData } = useGetUsageAndLimit(ModuleName.CHAOS)
  const { usageErrorMsg, refetchUsage, usage } = usageData
  const { limitErrorMsg, refetchLimit, limit } = limitData

  const isLoading = usageData.loadingUsage

  if (isLoading) {
    return <ContainerSpinner />
  }

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
      <ExperimentsRunPerMonth
        experimentsRunPerMonth={usage?.chaos?.experimentRunsPerMonth?.count || 0}
        totalExperimentsRunPerMonthAllowed={limit?.chaos?.totalChaosExperimentRuns || 0}
      />
    </Layout.Horizontal>
  )
}

export default ChaosUsageInfo
