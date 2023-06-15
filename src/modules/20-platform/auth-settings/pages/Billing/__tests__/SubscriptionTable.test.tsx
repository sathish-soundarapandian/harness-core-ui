/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'

import { TimeType } from '@common/constants/SubscriptionTypes'

import SubscriptionTable from '../SubscriptionTable'

const dataPassed = [
  {
    subscriptionId: 'sub_1Mtut8Iqk5P9Eha3Ml2SE9Jc',
    accountIdentifier: 'kmpySmUISimoRrJL6NL73w',
    customerId: 'cus_NfF6hYRqTiCmC3',
    status: 'active',
    clientSecret: 'pi_3MtutCIqk5P9Eha30hX2HqEK_secret_uvk8sN8oflGGlS7cxOswNyd5n',
    latestInvoice: 'in_1Mtut8Iqk5P9Eha3414La1Ej',
    latestInvoiceDetail: {
      items: [
        {
          price: {
            priceId: 'price_1LVwAmIqk5P9Eha3sMQcFLfe',
            currency: 'usd',
            unitAmount: 0,
            productId: 'prod_LvtiydKGhUqzyy',
            metaData: {},
            active: false
          },
          description: 'Sales Tax (Avatax)',
          quantity: 1,
          amount: 0,
          proration: false
        }
      ],
      subscriptionId: 'sub_1Mtut8Iqk5P9Eha3Ml2SE9Jc',
      invoiceId: 'in_1Mtut8Iqk5P9Eha3414La1Ej',
      totalAmount: 90000,
      periodStart: 1680795494,
      periodEnd: 1680795494,
      amountDue: 90000,
      paymentIntent: {
        id: 'pi_3MtutCIqk5P9Eha30hX2HqEK',
        clientSecret: 'pi_3MtutCIqk5P9Eha30hX2HqEK_secret_uvk8sN8oflGGlS7cxOswNyd5n',
        status: 'succeeded'
      }
    }
  }
]
describe('useSubscriptionModal', () => {
  test('render', async () => {
    const { container } = render(
      <TestWrapper>
        <SubscriptionTable frequency={TimeType.YEARLY} data={dataPassed} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
