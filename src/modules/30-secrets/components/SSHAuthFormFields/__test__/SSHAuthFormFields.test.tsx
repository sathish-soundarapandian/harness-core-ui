/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act } from 'react-dom/test-utils'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { Formik, FormikForm } from '@wings-software/uicore'

import mockData from '@secrets/components/CreateUpdateSecret/__tests__/listSecretManagersMock.json'
import { TestWrapper } from '@common/utils/testUtils'
import { initialValuesMock, secretMock } from './mock'

import SSHAuthFormFields from '../SSHAuthFormFields'

jest.mock('services/cd-ng', () => ({
  ...(jest.requireActual('services/cd-ng') as any),
  useGetConnectorList: jest.fn().mockImplementation(() => {
    return { ...mockData, refetch: jest.fn(), error: null, loading: false }
  }),
  listSecretsV2Promise: jest.fn().mockImplementation(() => Promise.resolve(secretMock))
}))

jest.useFakeTimers()

function WrapperComponent(props: { initialValues: any }): JSX.Element {
  const { initialValues } = props || {}
  return (
    <TestWrapper>
      <Formik initialValues={initialValues} onSubmit={() => undefined} formName="TestWrapper">
        {formikProps => (
          <FormikForm>
            <SSHAuthFormFields formik={formikProps} />
          </FormikForm>
        )}
      </Formik>
    </TestWrapper>
  )
}

describe('Create SSH Cred Wizard', () => {
  test('should render form, with secret text, password case', async () => {
    const { container, getByTestId } = render(
      <WrapperComponent initialValues={{ ...initialValuesMock, credentialType: 'Password' }} />
    )
    const formElPort = container.querySelector('[name=port]') as Element
    expect(formElPort).toBeInTheDocument()

    const formElPassword = await getByTestId('password')
    expect(formElPassword).toBeInTheDocument()
  })
  test('should render form, Kerberos case', async () => {
    const { container } = render(<WrapperComponent initialValues={{ ...initialValuesMock, authScheme: 'Kerberos' }} />)
    const formElPrincipal = container.querySelector('[name=principal]') as Element
    expect(formElPrincipal).toBeInTheDocument()
    const formElRealm = container.querySelector('[name=realm]') as Element
    expect(formElRealm).toBeInTheDocument()
    const formElPort = container.querySelector('[name=port]') as Element
    expect(formElPort).toBeInTheDocument()
  })
  test('Kerberos , radio btns', async () => {
    const { container, getByLabelText } = render(
      <WrapperComponent initialValues={{ ...initialValuesMock, authScheme: 'Kerberos' }} />
    )
    const formElkeyPath = container.querySelector('[name=keyPath]') as Element
    expect(formElkeyPath).not.toBeInTheDocument()
    const RadioKerbNone = getByLabelText('secrets.sshAuthFormFields.optionKerbNone')
    expect(RadioKerbNone).toBeInTheDocument()
    const RadioLabelKey = getByLabelText('secrets.sshAuthFormFields.labelKeyTab')
    expect(RadioLabelKey).toBeInTheDocument()
    const RadioLabelPassword = getByLabelText('password')
    expect(RadioLabelPassword).toBeInTheDocument()
    await act(() => {
      fireEvent.click(RadioLabelKey!)
    })
    await waitFor(() => expect(RadioLabelKey).toBeChecked())
    await act(() => {
      fireEvent.click(RadioLabelPassword!)
    })
    await waitFor(() => expect(RadioLabelPassword).toBeChecked())
  })
})
