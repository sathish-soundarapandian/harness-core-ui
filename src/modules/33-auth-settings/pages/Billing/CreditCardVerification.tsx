/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { Layout } from '@harness/uicore'
import type {
  BillingContactProps,
  PaymentMethodProps,
  SubscribeViews,
  SubscriptionProps
} from '@common/constants/SubscriptionTypes'
import { CreditCard, Category } from '@common/constants/TrackingConstants'
import { useTelemetry } from '@common/hooks/useTelemetry'
import type { Module } from 'framework/types/ModuleName'
import type { InvoiceDetailDTO } from 'services/cd-ng'
import { FooterCreditCard } from './FooterCreditCard'
import PaymentMethod from '@auth-settings/components/Subscription/PaymentMethod/PaymentMethod'

interface CreditCardVerificationProp {
  subscriptionProps: SubscriptionProps
  setView: (view: SubscribeViews) => void
  setInvoiceData: (value: InvoiceDetailDTO) => void
  setSubscriptionProps: (props: SubscriptionProps) => void
  module: Module
  onClose: () => void
}
export default function CreditCardVerification({
  subscriptionProps,
  setView,
  setInvoiceData,
  setSubscriptionProps,
  onClose
}: CreditCardVerificationProp): JSX.Element {
  const { trackEvent } = useTelemetry()

  useEffect(() => {
    trackEvent(CreditCard.CalculatorStripeElementLoaded, {
      category: Category.CREDIT_CARD,
      module
    })
    return () => {
      trackEvent(CreditCard.CalculatorPaymentMethodStepExited, {
        category: Category.CREDIT_CARD,
        module
      })
    }
  }, [])

  return (
    <Layout.Vertical>
      <PaymentMethod
        nameOnCard={subscriptionProps.paymentMethodInfo?.nameOnCard}
        setNameOnCard={(value: string) => {
          setSubscriptionProps({
            ...subscriptionProps,
            paymentMethodInfo: {
              ...subscriptionProps.paymentMethodInfo,
              nameOnCard: value
            }
          })
        }}
        setValidCard={(value: boolean) => {
          setSubscriptionProps({
            ...subscriptionProps,
            isValid: value
          })
        }}
      />
      <FooterCreditCard
        onClose={onClose}
        canPay={true}
        setView={setView}
        setInvoiceData={setInvoiceData}
        nameOnCard={subscriptionProps.paymentMethodInfo?.nameOnCard}
        billingInfo={subscriptionProps.billingContactInfo}
        subscriptionId={subscriptionProps.subscriptionId}
        setBillingContactInfo={(value: BillingContactProps) => {
          setSubscriptionProps({
            ...subscriptionProps,
            billingContactInfo: value
          })
        }}
        setPaymentMethodInfo={(value: PaymentMethodProps) => {
          setSubscriptionProps({
            ...subscriptionProps,
            paymentMethodInfo: value
          })
        }}
      />
    </Layout.Vertical>
  )
}
