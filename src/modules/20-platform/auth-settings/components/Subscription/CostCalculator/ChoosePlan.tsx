/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { capitalize } from 'lodash-es'
import { Link, useParams } from 'react-router-dom'
import { Color, FontVariation } from '@harness/design-system'
import { Text, Layout, PillToggle, Container } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type { Module } from 'framework/types/ModuleName'
import { Editions, SubscriptionTabNames } from '@common/constants/SubscriptionTypes'
import routes from '@common/RouteDefinitions'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'

interface ChoosePlanProps {
  plan: Editions
  setPlan: (value: Editions) => void
  module: Module
  allLicenses: any
}
interface PlanToggleProps {
  otherSubscriptions: any
  plan: Editions
  setPlan: (value: Editions) => void
  module: Module
}

const PlanToggle: React.FC<PlanToggleProps> = ({ plan, setPlan, module, otherSubscriptions }) => {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const planText = otherSubscriptions === Editions.ENTERPRISE ? Editions.TEAM : Editions.ENTERPRISE
  const toggleDisableReason = (
    <Container padding="medium">
      <Layout.Vertical width={325} padding={{ left: 'small' }}>
        <Text width={284} color={Color.GREY_0} margin={{ bottom: 'small' }} font={{ size: 'normal', weight: 'light' }}>
          An account can only have subscriptions of the same plan.
        </Text>
        <Text width={284} color={Color.GREY_0} font={{ size: 'normal', weight: 'light' }}>
          {`${planText} is disabled as this account is already subscribed to other Harness modules on plans other than ${planText}.`}
        </Text>
      </Layout.Vertical>
    </Container>
  )

  return (
    <Layout.Horizontal spacing={'small'} flex={{ alignItems: 'center', justifyContent: 'start' }}>
      <PillToggle
        showDisableToggleReason={otherSubscriptions !== 'FREE'}
        disableToggle={otherSubscriptions !== 'FREE'}
        onChange={planClicked => setPlan(planClicked)}
        options={[
          { label: capitalize(Editions.TEAM), value: Editions.TEAM },
          {
            label: capitalize(Editions.ENTERPRISE),
            value: Editions.ENTERPRISE
          }
        ]}
        selectedView={otherSubscriptions !== 'FREE' ? otherSubscriptions : plan}
        disableToggleReasonContent={toggleDisableReason}
      />
      <Link
        to={routes.toSubscriptions({ accountId, moduleCard: module, tab: SubscriptionTabNames.PLANS })}
        target="_blank"
      >
        <Text color={Color.PRIMARY_7} font={{ size: 'xsmall' }}>
          {getString('authSettings.costCalculator.comparePlans')}
        </Text>
      </Link>
    </Layout.Horizontal>
  )
}

const ChoosePlan: React.FC<ChoosePlanProps> = ({ plan, module, setPlan, allLicenses }) => {
  const { getString } = useStrings()

  const currentExistingFFSubscription = allLicenses['CF']?.[0]?.edition
  const currentExistingCISubscription = allLicenses['CI']?.[0]?.edition
  let otherSubscriptions =
    currentExistingFFSubscription !== Editions.FREE && currentExistingFFSubscription !== undefined
      ? currentExistingFFSubscription
      : Editions.FREE
  if (otherSubscriptions === Editions.FREE) {
    otherSubscriptions =
      currentExistingCISubscription !== Editions.FREE && currentExistingCISubscription !== undefined
        ? currentExistingCISubscription
        : Editions.FREE
  }
  return (
    <Layout.Horizontal spacing={'medium'} flex={{ alignItems: 'center', justifyContent: 'start' }}>
      <Text font={{ variation: FontVariation.H4 }}>{getString('authSettings.choosePlan')}</Text>
      <PlanToggle plan={plan} module={module} setPlan={setPlan} otherSubscriptions={otherSubscriptions} />
    </Layout.Horizontal>
  )
}

export default ChoosePlan
