/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { TestWrapper } from '@common/utils/testUtils'
import { SubscribeViews, TimeType, Editions } from '@common/constants/SubscriptionTypes'
import { BillingInfo } from '../BillingInfo'

const billingContactInfo = {
  name: 'Jane Doe',
  email: 'jane.doe@test.com',
  billingAddress: 'billing address',
  city: 'dallas',
  state: 'TX',
  country: 'US',
  zipCode: '79809',
  companyName: 'Harness'
}

const paymentMethodInfo = {
  paymentMethodId: '1',
  cardType: 'visa',
  expireDate: 'Jan 30 2023',
  last4digits: '1234',
  nameOnCard: 'Jane Doe'
}

const productPrices = {
  monthly: [
    {
      priceId: 'price_1Kr5rQIqk5P9Eha3IB74lUSX',
      currency: 'usd',
      unitAmount: 9000,
      lookupKey: 'FF_TEAM_MAU_MONTHLY',
      productId: 'prod_LYCFgTjtkejp0K',
      metaData: {
        type: 'MAUS'
      },
      active: true
    }
  ],
  yearly: [
    {
      priceId: 'price_1Kr5rQIqk5P9Eha3uzYZEPws',
      currency: 'usd',
      unitAmount: 90000,
      lookupKey: 'FF_TEAM_MAU_YEARLY',
      productId: 'prod_LYCFgTjtkejp0K',
      metaData: {
        type: 'MAUS'
      },
      active: true
    }
  ]
}

const subscriptionProps = {
  edition: Editions.TEAM,
  premiumSupport: false,
  paymentFreq: TimeType.MONTHLY,
  subscriptionId: '1',
  billingContactInfo,
  paymentMethodInfo,
  productPrices,
  quantities: {
    featureFlag: {
      numberOfDevelopers: 25,
      numberOfMau: 12
    }
  },
  isValid: false
}

const clientSecret = 'dummy secret'
const stripePromise = loadStripe('dummy promise')

describe('BillingInfo', () => {
  test('render', async () => {
    const { container } = render(
      <TestWrapper>
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <BillingInfo
            setView={jest.fn()}
            subscriptionProps={subscriptionProps}
            setInvoiceData={jest.fn()}
            setSubscriptionProps={jest.fn()}
            className=""
            states={{}}
            countries={[]}
            module={'cf'}
          />
        </Elements>
      </TestWrapper>
    )
    await waitFor(() => {
      expect(container).toMatchSnapshot()
    })
  })

  test('footer', async () => {
    const setViewMock = jest.fn()
    const { getByText } = render(
      <TestWrapper>
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <BillingInfo
            setView={setViewMock}
            subscriptionProps={subscriptionProps}
            setInvoiceData={jest.fn()}
            setSubscriptionProps={jest.fn()}
            className=""
            states={{}}
            countries={[]}
            module={'cf'}
          />
        </Elements>
      </TestWrapper>
    )
    userEvent.click(getByText('back'))
    await waitFor(() => {
      expect(setViewMock).toBeCalledWith(SubscribeViews.CALCULATE)
    })
  })
})
