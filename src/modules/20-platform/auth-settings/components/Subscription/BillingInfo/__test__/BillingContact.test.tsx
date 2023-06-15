/* eslint-disable jest/no-disabled-tests */
/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, fireEvent, act } from '@testing-library/react'
import { Formik } from '@harness/uicore'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import BillingContact, { InitialBillingInfo } from '../BillingContact'
describe('BillingContact', () => {
  const billingInfo = {
    name: 'Jane Doe',
    email: 'harness@harness.io',
    country: 'us',
    zipCode: '12345',
    billingAddress: 'billing address 1',
    city: 'dallas',
    state: 'texas',
    companyName: 'Harness'
  }

  const setBillingInfoMock = jest.fn()

  test('render', async () => {
    const { container } = render(
      <TestWrapper>
        <Formik<InitialBillingInfo> formName="test-form" initialValues={billingInfo} onSubmit={jest.fn()}>
          {formik => (
            <BillingContact
              formik={formik}
              countries={[]}
              states={{}}
              setBillingInfo={jest.fn()}
              billingInfo={billingInfo}
            />
          )}
        </Formik>
      </TestWrapper>
    )
    await waitFor(() => {
      expect(container).toMatchSnapshot()
    })
  })

  test('set companyName', () => {
    const { container } = render(
      <TestWrapper>
        <Formik<InitialBillingInfo> formName="test-form" initialValues={billingInfo} onSubmit={jest.fn()}>
          {formik => (
            <BillingContact
              formik={formik}
              countries={[]}
              states={{}}
              setBillingInfo={jest.fn()}
              billingInfo={billingInfo}
            />
          )}
        </Formik>
      </TestWrapper>
    )
    const formEl = container.querySelector('[name=companyName]') as Element
    act(() => {
      userEvent.clear(formEl)
      userEvent.type(formEl, 'another company')
    })
    expect(formEl).toHaveValue('another company')
  })

  test('set zipCode', () => {
    const { container } = render(
      <TestWrapper>
        <Formik<InitialBillingInfo> formName="test-form" initialValues={billingInfo} onSubmit={jest.fn()}>
          {formik => (
            <BillingContact
              formik={formik}
              countries={[]}
              states={{}}
              setBillingInfo={jest.fn()}
              billingInfo={billingInfo}
            />
          )}
        </Formik>
      </TestWrapper>
    )
    const formEl = container.querySelector('[name=zipCode]') as Element
    act(() => {
      userEvent.clear(formEl)
      userEvent.type(formEl, '54321')
    })
    expect(formEl).toHaveValue('54321')
  })

  test('set billingAddress', () => {
    const { container } = render(
      <TestWrapper>
        <Formik<InitialBillingInfo> formName="test-form" initialValues={billingInfo} onSubmit={jest.fn()}>
          {formik => (
            <BillingContact
              formik={formik}
              countries={[]}
              states={{}}
              setBillingInfo={jest.fn()}
              billingInfo={billingInfo}
            />
          )}
        </Formik>
      </TestWrapper>
    )
    const formEl = container.querySelector('[name=billingAddress]') as Element
    act(() => {
      userEvent.clear(formEl)
      userEvent.type(formEl, 'new billing address')
    })
    expect(formEl).toHaveValue('new billing address')
  })

  test('set city', () => {
    const { container } = render(
      <TestWrapper>
        <Formik<InitialBillingInfo> formName="test-form" initialValues={billingInfo} onSubmit={jest.fn()}>
          {formik => (
            <BillingContact
              formik={formik}
              countries={[]}
              states={{}}
              setBillingInfo={jest.fn()}
              billingInfo={billingInfo}
            />
          )}
        </Formik>
      </TestWrapper>
    )
    const formEl = container.querySelector('[name=zipCode]') as Element
    act(() => {
      userEvent.clear(formEl)
      userEvent.type(formEl, 'austin')
    })
    expect(formEl).toHaveValue('austin')
  })

  test.skip('set state', async () => {
    const { getByTestId, container } = render(
      <TestWrapper>
        <Formik<InitialBillingInfo> formName="test-form" initialValues={billingInfo} onSubmit={jest.fn()}>
          {formik => (
            <BillingContact
              formik={formik}
              countries={[]}
              states={{}}
              setBillingInfo={jest.fn()}
              billingInfo={billingInfo}
            />
          )}
        </Formik>
      </TestWrapper>
    )

    const dropdown = getByTestId('state')
    fireEvent.click(dropdown)

    const listItem = container.getElementsByClassName('DropDown--menuItem')[0]
    fireEvent.click(listItem)
    await waitFor(() => {
      expect(setBillingInfoMock).toHaveBeenCalledWith({
        ...billingInfo,
        state: 'Texas'
      })
    })
  })

  test.skip('set countryOrRegion', async () => {
    const { getByTestId, container } = render(
      <TestWrapper>
        <Formik<InitialBillingInfo> formName="test-form" initialValues={billingInfo} onSubmit={jest.fn()}>
          {formik => (
            <BillingContact
              formik={formik}
              countries={[]}
              states={{}}
              setBillingInfo={jest.fn()}
              billingInfo={billingInfo}
            />
          )}
        </Formik>
      </TestWrapper>
    )

    const dropdown = getByTestId('countryOrRegion')
    fireEvent.click(dropdown)

    const listItem = container.getElementsByClassName('DropDown--menuItem')[0]
    fireEvent.click(listItem)
    await waitFor(() => {
      expect(setBillingInfoMock).toHaveBeenCalledWith({
        ...billingInfo,
        country: 'us'
      })
    })
  })
})
