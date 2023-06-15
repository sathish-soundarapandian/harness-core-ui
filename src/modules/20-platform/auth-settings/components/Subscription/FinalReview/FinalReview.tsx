/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { Layout } from '@harness/uicore'
import type { SubscribeViews, SubscriptionProps } from '@common/constants/SubscriptionTypes'
import type { InvoiceDetailDTO } from 'services/cd-ng/index'
import { CreditCard, Category } from '@common/constants/TrackingConstants'
import { useTelemetry } from '@common/hooks/useTelemetry'
import type { Module } from 'framework/types/ModuleName'
import BillingContactCard from './BillingContactCard'
import SubscriptionDetailsCard from './SubscriptionDetailsCard'
import PaymentMethodCard from './PaymentMethodCard'
import { Footer } from './Footer'
import { Header } from '../Header'
import css from './FinalReview.module.scss'

interface FinalReviewProps {
  setView: (view: SubscribeViews) => void
  invoiceData?: InvoiceDetailDTO
  subscriptionProps: SubscriptionProps
  className: string
  module: Module
}
export const FinalReview: React.FC<FinalReviewProps> = ({
  setView,
  invoiceData,
  subscriptionProps,
  className,
  module
}) => {
  const items =
    invoiceData?.items?.reduce((acc: string[], curr) => {
      acc.push(`${curr.description}`)
      return acc
    }, []) || []
  const { trackEvent } = useTelemetry()
  useEffect(() => {
    trackEvent(CreditCard.CalculatorReviewStepLoaded, {
      category: Category.CREDIT_CARD,
      module
    })
    return () => {
      trackEvent(CreditCard.CalculatorReviewStepExited, {
        category: Category.CREDIT_CARD,
        module
      })
    }
  }, [])
  return (
    <Layout.Vertical className={className}>
      <Header step={3} />
      <Layout.Vertical padding={{ top: 'large', bottom: 'large' }} spacing={'large'} className={css.body}>
        <SubscriptionDetailsCard
          subscriptionId={subscriptionProps.subscriptionId}
          items={items}
          newPlan={subscriptionProps.edition}
          setView={setView}
          module={module}
        />
        <BillingContactCard
          billingContactInfo={subscriptionProps.billingContactInfo}
          setView={setView}
          module={module}
        />
        <PaymentMethodCard paymentMethodInfo={subscriptionProps.paymentMethodInfo} setView={setView} module={module} />
      </Layout.Vertical>
      <Footer setView={setView} invoiceId={invoiceData?.invoiceId} module={module} />
    </Layout.Vertical>
  )
}
