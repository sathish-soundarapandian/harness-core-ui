/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { Editions, TimeType } from '@common/constants/SubscriptionTypes'
import CISubutils from '../../CISubutils'

const productPrices = {
  monthly: [
    {
      priceId: 'price_1Kr5rQIqk5P9Eha3IB74lUSX',
      currency: 'usd',
      unitAmount: 100,
      lookupKey: 'FF_TEAM_MAU_MONTHLY',
      productId: 'prod_LYCFgTjtkejp0K',
      metaData: {
        type: 'MAUS',
        edition: Editions.TEAM,
        sampleMultiplier: '1',
        sampleUnit: '1'
      },
      active: true
    },
    {
      priceId: 'price_1Kr5rQIqk5P9Eha3IB74lUSz',
      currency: 'usd',
      unitAmount: 200,
      lookupKey: 'FF_TEAM_DEVELOPERS_MONTHLY',
      productId: 'prod_LYCFgTjtkejp0K',
      metaData: {
        type: 'DEVELOPERS',
        edition: Editions.TEAM,
        sampleMultiplier: '1',
        sampleUnit: '1'
      },
      active: true
    }
  ],
  yearly: [
    {
      priceId: 'price_1Kr5rQIqk5P9Eha3uzYZEPws',
      currency: 'usd',
      unitAmount: 300 * 12,
      lookupKey: 'FF_TEAM_MAU_YEARLY',
      productId: 'prod_LYCFgTjtkejp0K',
      metaData: {
        type: 'MAUS',
        edition: Editions.TEAM,
        sampleMultiplier: '1',
        sampleUnit: '1'
      },
      active: true
    },
    {
      priceId: 'price_1Kr5rQIqk5P9Eha3IB74lUSw',
      currency: 'usd',
      unitAmount: 400 * 12,
      lookupKey: 'FF_TEAM_DEVELOPERS_YEARLY',
      productId: 'prod_LYCFgTjtkejp0K',
      metaData: {
        type: 'DEVELOPERS',
        edition: Editions.TEAM,
        sampleMultiplier: '1',
        sampleUnit: '1'
      },
      active: true
    }
  ]
}
const getProps = (paymentFreq: TimeType) => ({
  taxAmount: 100,
  edition: Editions.TEAM,
  premiumSupport: true,
  paymentFreq: paymentFreq,
  subscriptionId: '1',
  billingContactInfo: {
    name: 'Jane Doe',
    email: 'jane.doe@harness.io',
    billingAddress: 'billing address',
    city: 'dallas',
    state: 'TX',
    country: 'us',
    zipCode: '12345',
    companyName: 'Harness'
  },
  paymentMethodInfo: {
    paymentMethodId: '1',
    cardType: 'visa',
    expireDate: 'Jan 01, 2023',
    last4digits: '1234',
    nameOnCard: 'Jane Doe'
  },
  productPrices: productPrices,
  isValid: false
})
describe('SubscriptionDetails', () => {
  test('render for monthly subscription', async () => {
    const { container } = render(
      <TestWrapper>
        <CISubutils
          currentPlan={Editions.TEAM}
          recommendation={{ NUMBER_OF_DEVELOPERS: 10 }}
          usageAndLimitInfo={{
            limitData: { limit: { ci: { totalDevelopers: 100 } } },
            usageData: { usage: { ci: { activeCommitters: { count: 100 } } } }
          }}
          subscriptionDetails={getProps(TimeType.MONTHLY)}
          updateQuantities={jest.fn()}
          productPrices={productPrices}
          paymentFrequency={TimeType.MONTHLY}
          setSubscriptionDetails={jest.fn()}
        />
      </TestWrapper>
    )
    await waitFor(() => {
      expect(container).toMatchSnapshot()
    })
  })
  test('render for monthly subscription without usage and limit', async () => {
    const { container } = render(
      <TestWrapper>
        <CISubutils
          currentPlan={Editions.TEAM}
          recommendation={{ NUMBER_OF_DEVELOPERS: 10 }}
          usageAndLimitInfo={{
            limitData: { limit: { ci: { totalDevelopers: -1 } } },
            usageData: { usage: { ci: { activeCommitters: { count: -1 } } } }
          }}
          subscriptionDetails={getProps(TimeType.MONTHLY)}
          updateQuantities={jest.fn()}
          productPrices={productPrices}
          paymentFrequency={TimeType.MONTHLY}
          setSubscriptionDetails={jest.fn()}
        />
      </TestWrapper>
    )
    await waitFor(() => {
      expect(container).toMatchSnapshot()
    })
  })
  test('render for yearly subscription', async () => {
    const { container } = render(
      <TestWrapper>
        <CISubutils
          currentPlan={Editions.TEAM}
          recommendation={{ NUMBER_OF_DEVELOPERS: 10 }}
          usageAndLimitInfo={{ limitData: {}, usageData: {} }}
          subscriptionDetails={getProps(TimeType.YEARLY)}
          updateQuantities={jest.fn()}
          productPrices={productPrices}
          paymentFrequency={TimeType.YEARLY}
          setSubscriptionDetails={jest.fn()}
        />
      </TestWrapper>
    )
    await waitFor(() => {
      expect(container).toMatchSnapshot('yearly subscription')
    })
  })
})
