/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { noop } from 'lodash-es'
import { render, waitFor, act, fireEvent } from '@testing-library/react'
import { Container, Formik, FormikForm, FormInput } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'

import { CustomHealthKeyValueMapper } from '../CustomHealthKeyValueMapper'

// eslint-disable-next-line react/display-name
jest.mock('@secrets/components/SecretInput/SecretInput', () => (b: { name: string }) => (
  <Container className="secret-mock">
    <FormInput.Text name={b.name} />
  </Container>
))

jest.mock('@secrets/utils/SecretField', () => ({
  setSecretField: async () => ({
    identifier: 'secretIdentifier',
    name: 'secretName',
    referenceString: 'testReferenceString'
  })
}))

const Wrapper = () => {
  const formik = {
    values: {},
    setFieldValue: jest.fn()
  }
  const previousStepData = {
    url: 'dummyUrl'
  }
  return (
    <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
      <Formik
        formName="testWrapper"
        initialValues={{
          username: {
            value: 'test',
            type: 'ENCRYPTED'
          }
        }}
        onSubmit={noop}
      >
        {() => {
          return (
            <FormikForm>
              <CustomHealthKeyValueMapper
                addRowButtonLabel="parameter"
                name={'parameter'}
                formik={formik}
                prevStepData={previousStepData}
              />
            </FormikForm>
          )
        }}
      </Formik>
    </TestWrapper>
  )
}

describe('Create CustomHealth connector Wizard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Checks if the base template is triggered', async () => {
    const { getByText, getByPlaceholderText, getByTestId } = render(<Wrapper />)
    await waitFor(() => expect(getByText('keyLabel')).not.toBeNull())
    await waitFor(() => expect(getByText('valueLabel')).not.toBeNull())
    await waitFor(() => expect(getByPlaceholderText('keyLabel')).not.toBeNull())
    await waitFor(() => expect(getByTestId('dropdown-value').innerHTML).toBe('plaintext'))
  })
  test('On click of add parameter button, it should add a new header', async () => {
    const { container, getByText, getByTestId } = render(<Wrapper />)
    await waitFor(() => expect(getByText('keyLabel')).not.toBeNull())
    await waitFor(() => expect(getByText('valueLabel')).not.toBeNull())
    await waitFor(() => expect(getByTestId('dropdown-value').innerHTML).toBe('plaintext'))
    act(() => {
      fireEvent.click(getByText('parameter'))
    })
    await waitFor(() => expect(container.querySelector(`[name="headers_value_2_textField"]`)).toBeDefined())
  })

  test('On click of add parameter button, and delete the added pair', async () => {
    const { container, getByText, getByTestId } = render(<Wrapper />)
    await waitFor(() => expect(getByText('keyLabel')).not.toBeNull())
    await waitFor(() => expect(getByText('valueLabel')).not.toBeNull())
    await waitFor(() => expect(getByTestId('dropdown-value').innerHTML).toBe('plaintext'))

    act(() => {
      fireEvent.click(getByText('parameter'))
    })
    await waitFor(() => expect(container.querySelector(`[name="headers_value_2_textField"]`)).toBeDefined())
    fireEvent.click(container.querySelectorAll('[icon="trash"]')[0])
    await waitFor(() => expect(container.querySelector(`[name="headers_value_2_textField"]`)).toBeNull())
  })
})
