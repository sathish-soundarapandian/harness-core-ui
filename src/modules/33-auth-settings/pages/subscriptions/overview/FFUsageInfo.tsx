/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import moment from 'moment'
import { Layout, PageError } from '@wings-software/uicore'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { useGetUsageAndLimit } from '@common/hooks/useGetUsageAndLimit'
import { ModuleName } from 'framework/types/ModuleName'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import UsageInfoCard, { ErrorContainer } from './UsageInfoCard'
import { useFetchLicenseUseAndSummary } from '@common/hooks/getUsageAndLimitHelper'

export interface FFUsageInfoProps {
  subscribedUsers: number
  activeUsers: number
  subscribedMonthlyUsers: number
  activeMonthlyUsers: number
  month: string
  featureFlags: number
}

interface FeatureFlagsUsersCardProps {
  subscribedUsers: number
  activeUsers: number
  leftHeader?: string
  rightHeader: string
  tooltip?: string
  errors: {
    usageErrorMsg?: string
    limitErrorMsg?: string
  }
  refetches: {
    refetchUsage?: () => void
    refetchLimit?: () => void
  }
}
const FeatureFlagsUsersCard: React.FC<FeatureFlagsUsersCardProps> = ({
  subscribedUsers,
  activeUsers,
  leftHeader,
  tooltip,
  rightHeader,
  errors,
  refetches
}) => {
  const { getString } = useStrings()
  const defaultLeftHeader = leftHeader || getString('common.subscriptions.usage.monthlyUsers')
  const defaultTooltip = tooltip || getString('common.subscriptions.usage.ffActiveUserTootip')
  const hasBar = true
  const leftFooter = getString('common.subscribed')
  const rightFooter = getString('common.subscribed')
  const props = {
    subscribed: subscribedUsers,
    usage: activeUsers,
    leftHeader: defaultLeftHeader,
    tooltip: defaultTooltip,
    rightHeader,
    hasBar,
    leftFooter,
    rightFooter
  }

  const { usageErrorMsg, limitErrorMsg } = errors
  const { refetchUsage, refetchLimit } = refetches
  if (usageErrorMsg) {
    return (
      <ErrorContainer>
        <PageError message={usageErrorMsg} onClick={refetchUsage} />
      </ErrorContainer>
    )
  }

  if (limitErrorMsg) {
    return (
      <ErrorContainer>
        <PageError message={limitErrorMsg} onClick={refetchLimit} />
      </ErrorContainer>
    )
  }

  return <UsageInfoCard {...props} />
}

interface FeatureFlagsProps {
  featureFlags: number
  refetch?: () => void
  error?: string
}

const FeatureFlags: React.FC<FeatureFlagsProps> = ({ featureFlags, error, refetch }) => {
  const { getString } = useStrings()
  const leftHeader = getString('common.purpose.cf.continuous')
  const tooltip = getString('common.subscriptions.usage.ffFFTooltip')
  const rightHeader = getString('common.current')
  const hasBar = false
  const props = { usage: featureFlags, leftHeader, tooltip, rightHeader, hasBar }

  if (error) {
    return (
      <ErrorContainer>
        <PageError message={error} onClick={refetch} />
      </ErrorContainer>
    )
  }

  return <UsageInfoCard {...props} />
}

const FFUsageInfo: React.FC = () => {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const { data: dataFetched, loading, error, refetch } = useFetchLicenseUseAndSummary(ModuleName.CF, accountId)
  const { limitData, usageData } = useGetUsageAndLimit(ModuleName.CF, dataFetched, error, loading, refetch)

  const isLoading = limitData.loadingLimit || usageData.loadingUsage

  if (isLoading) {
    return <ContainerSpinner />
  }

  const { usageErrorMsg, refetchUsage, usage } = usageData
  const { limitErrorMsg, refetchLimit, limit } = limitData

  const currentDate = moment(new Date())
  const timeStampAsDate = moment(currentDate)

  return (
    <Layout.Horizontal spacing="large">
      <FeatureFlagsUsersCard
        errors={{ usageErrorMsg, limitErrorMsg }}
        refetches={{
          refetchUsage,
          refetchLimit
        }}
        subscribedUsers={limit?.ff?.totalFeatureFlagUnits || 0}
        activeUsers={usage?.ff?.activeFeatureFlagUsers?.count || 0}
        leftHeader={getString('common.subscriptions.usage.developers')}
        tooltip={getString('common.subscriptions.usage.ffDeveloperTooltip')}
        rightHeader={usage?.ff?.activeFeatureFlagUsers?.displayName || ''}
      />
      <FeatureFlagsUsersCard
        errors={{ usageErrorMsg, limitErrorMsg }}
        refetches={{
          refetchUsage,
          refetchLimit
        }}
        subscribedUsers={limit?.ff?.totalClientMAUs || 0}
        activeUsers={usage?.ff?.activeClientMAUs?.count || 0}
        rightHeader={timeStampAsDate.format('MMMM YYYY')}
      />
      <FeatureFlags featureFlags={limit?.ff?.totalFeatureFlagUnits || 0} error={limitErrorMsg} refetch={refetchLimit} />
    </Layout.Horizontal>
  )
}

export default FFUsageInfo
