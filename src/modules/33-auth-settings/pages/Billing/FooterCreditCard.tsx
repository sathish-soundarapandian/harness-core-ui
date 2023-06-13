/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Layout, Button, ButtonVariation, useToaster } from '@harness/uicore'
import { useParams } from 'react-router-dom'
import { useStripe, useElements } from '@stripe/react-stripe-js'
import { getErrorMessage } from '@auth-settings/utils'
import { useStrings } from 'framework/strings'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useSaveCard } from 'services/cd-ng'

interface FooterCreditCardProps {
  nameOnCard?: string
  subscriptionId: string
  isValid: boolean
  onClose: () => void
  updateRefetchCards?: () => void
}

export const FooterCreditCard: React.FC<FooterCreditCardProps> = ({
  nameOnCard = '',
  isValid,
  onClose,
  updateRefetchCards
}) => {
  const { getString } = useStrings()
  const stripe = useStripe()
  const elements = useElements()
  const { showError } = useToaster()
  const { accountId } = useParams<AccountPathProps>()

  const [loading, setLoading] = useState<boolean>(false)
  const { mutate: saveCard, loading: savingCard } = useSaveCard({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  async function handleSave(): Promise<void> {
    const paymentElement = elements?.getElement('card')

    if (!stripe || !paymentElement) {
      return
    }

    setLoading(true)

    try {
      // 1, create credit card;
      const res = await stripe?.createPaymentMethod({
        type: 'card',
        card: paymentElement,
        billing_details: {
          name: nameOnCard
        }
      })
      if (res.paymentMethod?.id) {
        await saveCard({
          accountIdentifier: accountId,
          creditCardIdentifier: res.paymentMethod?.id,
          customerIdentifier: res.paymentMethod?.customer || '',
          fingerprint: res.paymentMethod?.id
        })
        // 2, call api to save credit card ;
      }
    } catch (err) {
      showError(getErrorMessage(err))
    } finally {
      setLoading(false)
      onClose()
      if (updateRefetchCards) {
        updateRefetchCards()
      }
    }
  }

  function handleClose(): void {
    onClose()
  }

  if (loading || savingCard) {
    return <ContainerSpinner />
  }

  return (
    <Layout.Horizontal spacing="small">
      <Button variation={ButtonVariation.PRIMARY} onClick={handleSave} disabled={loading || !isValid}>
        {getString('setAsDefaultCard')}
      </Button>
      <Button variation={ButtonVariation.SECONDARY} onClick={handleClose}>
        {getString('cancel')}
      </Button>
    </Layout.Horizontal>
  )
}
