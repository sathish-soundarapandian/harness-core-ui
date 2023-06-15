/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, Card, Text, Button, ButtonVariation } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { CreditCard, Category } from '@common/constants/TrackingConstants'
import { useTelemetry } from '@common/hooks/useTelemetry'
import type { Module } from 'framework/types/ModuleName'
import { SubscribeViews, BillingContactProps } from '@common/constants/SubscriptionTypes'
import { useStrings } from 'framework/strings'

interface BillingContactCardProps {
  billingContactInfo: BillingContactProps
  setView: (view: SubscribeViews) => void
  module: Module
}

const BillingContactCard: React.FC<BillingContactCardProps> = ({ billingContactInfo, setView, module }) => {
  const { name, email, billingAddress, city, state, country, zipCode } = billingContactInfo
  const { getString } = useStrings()
  const address = `${billingAddress}, ${city}, ${state}, ${zipCode}, ${country}`
  const { trackEvent } = useTelemetry()
  return (
    <Card>
      <Layout.Vertical>
        <Layout.Horizontal flex={{ justifyContent: 'start', alignItems: 'baseline' }} padding={{ bottom: 'large' }}>
          <Text font={{ variation: FontVariation.H5 }}>{getString('authSettings.billingInfo.billingContact')}</Text>
          <Button
            variation={ButtonVariation.LINK}
            onClick={() => {
              trackEvent(CreditCard.CalculatorReviewStepEditBilling, {
                category: Category.CREDIT_CARD,
                module
              })
              setView(SubscribeViews.BILLINGINFO)
            }}
          >
            {getString('edit')}
          </Button>
        </Layout.Horizontal>
        <Layout.Vertical spacing="xsmall">
          <Text>{name}</Text>
          <Text>{email}</Text>
          <Text>{address}</Text>
        </Layout.Vertical>
      </Layout.Vertical>
    </Card>
  )
}

export default BillingContactCard
