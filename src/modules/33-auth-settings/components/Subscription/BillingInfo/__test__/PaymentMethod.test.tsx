/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { act, render, waitFor } from '@testing-library/react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import PaymentMethod from '../../PaymentMethod/PaymentMethod'

const clientSecret = 'dummy secret'
const stripePromise = loadStripe('dummy promise')

describe('PaymentMethod', () => {
  const props = {
    nameOnCard: 'Jane Doe',
    setNameOnCard: jest.fn(),
    setValidCard: jest.fn()
  }
  test('render', async () => {
    const { container } = render(
      <TestWrapper>
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <PaymentMethod {...props} />
        </Elements>
      </TestWrapper>
    )
    await waitFor(() => {
      expect(container).toMatchSnapshot()
    })
  })

  test('setNameOnCard', async () => {
    const setNameOnCardMock = jest.fn()

    const WrapperComponent = (): JSX.Element => {
      const [nameOnCard, setNameOnCard] = useState(props.nameOnCard)

      return (
        <TestWrapper>
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <PaymentMethod
              {...props}
              nameOnCard={nameOnCard}
              setNameOnCard={value => {
                setNameOnCardMock(value)
                setNameOnCard(value)
              }}
            />
          </Elements>
        </TestWrapper>
      )
    }

    const { getByTestId } = render(<WrapperComponent />)

    await act(async () => {
      await userEvent.clear(getByTestId('nameOnCard'))
    })

    await waitFor(() => expect(getByTestId('nameOnCard')).toHaveValue(''))

    await act(async () => {
      await userEvent.type(getByTestId('nameOnCard'), 'John Doe')
    })

    await waitFor(() => {
      expect(setNameOnCardMock).toHaveBeenCalledWith('John Doe')
    })
  })
})
