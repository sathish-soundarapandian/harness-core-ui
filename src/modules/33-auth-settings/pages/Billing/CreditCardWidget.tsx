/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { Classes } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import { Layout, Dialog } from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import { loadStripe } from '@stripe/stripe-js'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { Elements } from '@stripe/react-stripe-js'
import cx from 'classnames'
import { Success } from '@auth-settings/components/Subscription/Success/Success'
import { SubscribeViews, SubscriptionProps } from '@common/constants/SubscriptionTypes'
import { InvoiceDetailDTO, useCreateClientSecret } from 'services/cd-ng'
import CreditCardVerification from './CreditCardVerification'
import css from './CreditCardVerification.module.scss'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { useMutateAsGet } from '@common/hooks/useMutateAsGet'

interface CreditCardWidgetReturns {
  openSubscribeModal: () => void
  closeSubscribeModal: () => void
}

interface ViewProps {
  onClose: () => void
  updateRefetchCards?: () => void
}
window.stripeApiKey =
  'pk_test_51IykZ0Iqk5P9Eha3IBFZLLo5m9YkWOrIEsclvgUDs92WFW6UUd8IyjPj60HNHq796hEAM1wkdKa3Sa8RbhBsJ4ml00I3412IT3'
const stripePromise = window.stripeApiKey ? loadStripe(window.stripeApiKey) : Promise.resolve(null)

const View: React.FC<ViewProps> = ({ onClose, updateRefetchCards }) => {
  const [view, setView] = useState(SubscribeViews.CALCULATE)
  const [subscriptionProps, setSubscriptionProps] = useState<SubscriptionProps>({})
  const [invoiceData, setInvoiceData] = useState<InvoiceDetailDTO>()
  const [clientSecret, setClientSecret] = useState<string>(
    'pi_3NDorAIqk5P9Eha31q7K9yjF_secret_ft2EJCZeaz6Y3PDJcS0BJr0xL'
  )
  const { accountId } = useParams<AccountPathProps>()

  const { refetch: refetchClientSecret } = useMutateAsGet(useCreateClientSecret, {
    queryParams: {
      accountIdentifier: accountId
    },
    lazy: true
  })

  useEffect(() => {
    const fetchData = async () => {
      const data = await refetchClientSecret()
      setClientSecret(data || '')
    }

    // call the function
    fetchData()
  }, [])

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

  return true ? (
    <Layout.Vertical>
      <Elements stripe={stripePromise} options={{ clientSecret: clientSecret }}>
        <CreditCardVerification
          setView={setView}
          subscriptionProps={subscriptionProps}
          setInvoiceData={setInvoiceData}
          setSubscriptionProps={setSubscriptionProps}
          module={'cf'}
          onClose={onClose}
          updateRefetchCards={updateRefetchCards}
        />
      </Elements>
    </Layout.Vertical>
  ) : (
    <ContainerSpinner />
  )
}

export const useCreditCardWidget = ({
  onClose,
  updateRefetchCards
}: {
  onClose?: () => void
  updateRefetchCards: () => void
}): CreditCardWidgetReturns => {
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
        <View onClose={handleClose} updateRefetchCards={updateRefetchCards} />
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
