/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Classes } from '@blueprintjs/core'
import { Layout, Dialog } from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import cx from 'classnames'
import { Success } from '@auth-settings/components/Subscription/Success/Success'
import { SubscribeViews, SubscriptionProps } from '@common/constants/SubscriptionTypes'
import type { InvoiceDetailDTO } from 'services/cd-ng'
import PaymentMethodStep from '@auth-settings/components/Subscription/PaymentMethod/PaymentMethodStep'
import css from '@auth-settings/modals/Subscription/useSubscriptionModal.module.scss'

interface CreditCardWidgetReturns {
  openSubscribeModal: () => void
  closeSubscribeModal: () => void
}

interface UseSubscribeModalProps {
  onClose: () => void
}

const stripePromise = window.stripeApiKey ? loadStripe(window.stripeApiKey) : Promise.resolve(null)

const View: React.FC<UseSubscribeModalProps> = ({ onClose }) => {
  const [view, setView] = useState(SubscribeViews.CALCULATE)
  const [subscriptionProps, setSubscriptionProps] = useState<SubscriptionProps>({})
  const [invoiceData, setInvoiceData] = useState<InvoiceDetailDTO>()

  if (view === SubscribeViews.SUCCESS) {
    return (
      <Success
        module={'cf'}
        subscriptionProps={subscriptionProps}
        invoiceData={invoiceData}
        className={css.success}
        onClose={onClose}
      />
    )
  }

  return (
    <Layout.Vertical>
      <Layout.Horizontal flex={{ justifyContent: 'space-between', alignItems: 'start' }} className={css.view}>
        <Elements stripe={stripePromise} options={{ clientSecret: invoiceData?.paymentIntent?.clientSecret }}>
          <PaymentMethodStep
            setView={setView}
            subscriptionProps={subscriptionProps}
            setInvoiceData={setInvoiceData}
            setSubscriptionProps={setSubscriptionProps}
            className={css.leftView}
            module={'cf'}
          />
        </Elements>
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

export const useCreditCardWidget = ({ onClose }: { onClose?: () => void }): CreditCardWidgetReturns => {
  const handleClose = (): void => {
    onClose?.()
    hideModal()
  }

  const [openModal, hideModal] = useModalHook(
    () => (
      <Dialog
        onClose={handleClose}
        isOpen
        enforceFocus={false}
        className={cx(css.dialog, Classes.DIALOG)}
        isCloseButtonShown
      >
        <View onClose={handleClose} />
      </Dialog>
    ),
    []
  )
  const open = React.useCallback(() => {
    openModal()
  }, [openModal])

  return {
    openSubscribeModal: open,
    closeSubscribeModal: hideModal
  }
}
