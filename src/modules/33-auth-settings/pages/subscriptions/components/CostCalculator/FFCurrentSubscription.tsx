/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, Text, PageError, Container } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { useGetUsageAndLimit } from '@common/hooks/useGetUsageAndLimit'
import { ModuleName } from 'framework/types/ModuleName'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'

const Usage = ({
  subscribed,
  using,
  recommended,
  unit = ''
}: {
  subscribed: number
  using: number
  recommended: number
  unit?: string
}): React.ReactElement => {
  const { getString } = useStrings()
  return (
    <Layout.Horizontal flex={{ justifyContent: 'flex-start' }}>
      <Layout.Vertical spacing={'small'} padding={{ right: 'large' }}>
        <Text>{getString('common.subscribed')}</Text>
        <Text>{`${subscribed}${unit}`}</Text>
      </Layout.Vertical>
      <Layout.Vertical spacing={'small'} padding={{ right: 'large' }}>
        <Text>{getString('authSettings.costCalculator.using')}</Text>
        <Text>{`${using}${unit}`}</Text>
      </Layout.Vertical>
      <Layout.Vertical spacing={'small'}>
        <Text>{getString('common.recommended')}</Text>
        <Text>{`${recommended}${unit}`}</Text>
      </Layout.Vertical>
    </Layout.Horizontal>
  )
}
const Usages = ({
  title,
  subscribed,
  using,
  recommended,
  error,
  refetch,
  unit
}: {
  title: string
  subscribed: number
  using: number
  recommended: number
  error?: string
  refetch?: () => void
  unit?: string
}): React.ReactElement => {
  if (error) {
    return (
      <Container width={300}>
        <PageError message={error} onClick={refetch} />
      </Container>
    )
  }

  return (
    <Layout.Vertical width={'50%'}>
      <Text font={{ weight: 'bold' }} padding={{ bottom: 'medium' }}>
        {title}
      </Text>
      <Usage subscribed={subscribed} using={using} recommended={recommended} unit={unit} />
    </Layout.Vertical>
  )
}

export const FFCurrentSubscription = (): React.ReactElement => {
  const { getString } = useStrings()
  const { limitData, usageData } = useGetUsageAndLimit(ModuleName.CF)
  const isLoading = limitData.loadingLimit || usageData.loadingUsage

  if (isLoading) {
    return <ContainerSpinner />
  }

  const { usageErrorMsg, refetchUsage, usage } = usageData
  const { limitErrorMsg, refetchLimit, limit } = limitData

  const subscribedLicenses = limit?.ff?.totalFeatureFlagUnits || 0
  const subscribedMAUs = limit?.ff?.totalClientMAUs || 0
  const activeLicenses = usage?.ff?.activeFeatureFlagUsers?.count || 0
  const activeMAUs = usage?.ff?.activeClientMAUs?.count || 0
  const recommendedLicenses = Math.round(activeLicenses * 1.2)
  const recommendedMAUs = Math.round(activeMAUs * 1.2)

  return (
    <Layout.Horizontal>
      <Usages
        title={getString('authSettings.costCalculator.developerLicenses')}
        subscribed={subscribedLicenses}
        using={activeLicenses}
        recommended={recommendedLicenses}
        error={limitErrorMsg}
        refetch={refetchLimit}
      />
      <Usages
        title={getString('authSettings.costCalculator.maus')}
        subscribed={subscribedMAUs / 1000}
        using={activeMAUs / 1000}
        recommended={recommendedMAUs / 1000}
        error={usageErrorMsg}
        refetch={refetchUsage}
        unit={'k'}
      />
    </Layout.Horizontal>
  )
}
