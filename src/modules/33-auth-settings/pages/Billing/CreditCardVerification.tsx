/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { Layout } from '@harness/uicore'
import type { SubscribeViews, SubscriptionProps } from '@common/constants/SubscriptionTypes'
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
  updateRefetchCards?: () => void
}
export default function CreditCardVerification({
  subscriptionProps,
  setSubscriptionProps,
  onClose,
  updateRefetchCards
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
        isValid={subscriptionProps.isValid}
        nameOnCard={subscriptionProps.paymentMethodInfo?.nameOnCard}
        subscriptionId={subscriptionProps.subscriptionId}
        updateRefetchCards={updateRefetchCards}
      />
    </Layout.Vertical>
  )
}
