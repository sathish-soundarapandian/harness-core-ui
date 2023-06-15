/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, PageError } from '@harness/uicore'
import moment from 'moment'
import { useStrings } from 'framework/strings'
import { useGetUsageAndLimit } from '@common/hooks/useGetUsageAndLimit'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { ModuleName } from 'framework/types/ModuleName'
import type { ModuleLicenseDTO, CreditDTO } from 'services/cd-ng'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import UsageInfoCard, { ErrorContainer } from './UsageInfoCard'

interface ActiveDevelopersProps {
  subscribedUsers: number
  activeUsers: number
  rightHeader: string
}
interface CreditInfoProps {
  totalCredits: number
  expiryDate: string
}

interface CIUsageInfoProps {
  module: ModuleName
  licenseData: ModuleLicenseDTO
  creditsData?: CreditDTO[]
}
const ActiveDevelopers: React.FC<ActiveDevelopersProps> = ({ subscribedUsers, activeUsers, rightHeader }) => {
  const { getString } = useStrings()
  const leftHeader = getString('common.subscriptions.usage.activeDevelopers')
  const tooltip = getString('common.subscriptions.usage.ciTooltip')
  const hasBar = true
  const leftFooter = getString('common.subscribed')
  const defaultRightHeader = rightHeader || getString('common.subscriptions.usage.last30days')
  const rightFooter = getString('common.usage')
  const props = {
    subscribed: subscribedUsers,
    usage: activeUsers,
    leftHeader,
    tooltip,
    rightHeader: defaultRightHeader,
    hasBar,
    leftFooter,
    rightFooter
  }
  return <UsageInfoCard {...props} />
}
const CreditInfo: React.FC<CreditInfoProps> = ({ totalCredits, expiryDate }) => {
  const { getString } = useStrings()
  const leftHeader = getString('common.subscriptions.usage.allCredits')
  const tooltip = getString('common.subscriptions.usage.creditTooltip')
  const tooltipExpiry = getString('common.subscriptions.usage.creditTooltipExpiry', { date: expiryDate })
  const defaultRightHeader = getString('common.subscriptions.usage.creditsRightHeader', {
    date: expiryDate
  })
  const props = {
    credits: totalCredits,
    leftHeader,
    tooltip,
    tooltipExpiry,
    rightHeader: defaultRightHeader
  }
  return <UsageInfoCard {...props} />
}

export enum creditStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED'
}
export const creditSum = (creditsData: CreditDTO[]): number => {
  let totalCredits = 0
  creditsData.forEach((cd: CreditDTO) => {
    if (cd.creditStatus !== creditStatus.EXPIRED) totalCredits = totalCredits + (cd.quantity || 0)
  })
  return totalCredits
}
const CIUsageInfo: React.FC<CIUsageInfoProps> = props => {
  const { creditsData } = props
  const { BUILD_CREDITS_VIEW } = useFeatureFlags()
  let totalCredits = 0
  let expiryDate = ''
  if (creditsData && creditsData.length > 0) {
    totalCredits = creditSum(creditsData)
    const expiryTimeStamp = creditsData[0].expiryTime
    expiryDate = moment(expiryTimeStamp).format('DD-MM-YYYY')
  }
  const { limitData, usageData } = useGetUsageAndLimit(ModuleName.CI)

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
      {BUILD_CREDITS_VIEW === true ? <CreditInfo totalCredits={totalCredits} expiryDate={expiryDate} /> : null}
    </Layout.Horizontal>
  )
}

export default CIUsageInfo
