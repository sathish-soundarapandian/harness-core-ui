/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, Text, TextInput, Card, FontVariation, Color } from '@harness/uicore'
import { CardElement } from '@stripe/react-stripe-js'
import { useStrings } from 'framework/strings'
import PowerByStripe from './img/powered_by_stripe.svg'
import css from '../BillingInfo/BillingInfo.module.scss'

interface PaymentMethodProps {
  nameOnCard: string
  setNameOnCard: (value: string) => void
  setValidCard: (value: boolean) => void
}

const PaymentMethod: React.FC<PaymentMethodProps> = ({ nameOnCard, setNameOnCard, setValidCard }) => {
  const { getString } = useStrings()
  const setValid = (data: { complete: boolean }): void => {
    setValidCard(data.complete)
  }
  return (
    <Card className={css.paymentCard}>
      <Layout.Vertical>
        <Layout.Horizontal flex={{ alignItems: 'start', justifyContent: 'space-between' }}>
          <Layout.Vertical width={'55%'}>
            <Text padding={{ bottom: 'large' }} font={{ variation: FontVariation.H5 }}>
              {getString('authSettings.billingInfo.paymentMethod')}
            </Text>
          </Layout.Vertical>
          <img src={PowerByStripe} alt="" aria-hidden className={css.powerByStripe} />
        </Layout.Horizontal>
        <Layout.Horizontal className={css.paymentgrid}>
          <Layout.Vertical width={'35%'}>
            <Text padding={{ bottom: 'small' }}>{getString('common.nameOnCard')}</Text>
            <TextInput
              data-testid="nameOnCard"
              value={nameOnCard}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setNameOnCard(e.target.value)
              }}
            />
          </Layout.Vertical>
          <Layout.Vertical width={'55%'}>
            <Text padding={{ bottom: 'small' }}>{getString('common.cardNumber')}</Text>
            <div className={css.creditCard}>
              <CardElement
                options={{ hidePostalCode: true }}
                onReady={() => setValid({ complete: false })}
                onChange={setValid}
              />
            </div>
          </Layout.Vertical>
        </Layout.Horizontal>
        <Layout.Vertical>
          <Text
            font={{ size: 'small', weight: 'bold' }}
            icon="info"
            iconProps={{ color: Color.PRIMARY_7 }}
            padding="small"
            className={css.warning}
          >
            {getString('authSettings.billingInfo.saveCardWarning')}
          </Text>
        </Layout.Vertical>
      </Layout.Vertical>
    </Card>
  )
}

export default PaymentMethod
