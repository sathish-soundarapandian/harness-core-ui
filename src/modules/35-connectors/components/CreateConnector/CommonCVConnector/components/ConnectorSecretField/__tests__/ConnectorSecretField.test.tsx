/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Formik, FormikForm } from '@harness/uicore'
import { render, waitFor } from '@testing-library/react'
import * as secretUtils from '@secrets/utils/SecretField'
import { TestWrapper } from '@common/utils/testUtils'
import { ConnectorSecretField, ConnectorSecretFieldProps } from '../ConnectorSecretField'

const orgIdentifier = '1234_orgIdentifier'
const projectIdentifier = '1234_identifier'
const accountId = '1234_accountIf'

function WrapperComponent(props: ConnectorSecretFieldProps): JSX.Element {
  return (
    <TestWrapper>
      <Formik initialValues={{}} onSubmit={jest.fn()} formName="testWrapper">
        <FormikForm>
          <ConnectorSecretField {...props} />
        </FormikForm>
      </Formik>
    </TestWrapper>
  )
}

describe('Unit tests for ConnectorSecretField', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  test('Ensure that if api errors out toaster displays meessage', async () => {
    jest.spyOn(secretUtils, 'setSecretField').mockRejectedValue('mock error')
    const { getByText } = render(
      <WrapperComponent
        secretInputProps={{
          label: 'dsfsdf',
          name: 'sdf'
        }}
        secretFieldValue="secretValue"
        accountIdentifier={accountId}
        projectIdentifier={projectIdentifier}
        orgIdentifier={orgIdentifier}
        onSuccessfulFetch={jest.fn()}
      />
    )

    await waitFor(() => expect(getByText('mock error')).not.toBeNull())
  })

  test('Ensure that if api is loading field has loading placeholder', async () => {
    jest.spyOn(secretUtils, 'setSecretField').mockImplementation(() => new Promise(() => undefined))
    const { container } = render(
      <WrapperComponent
        secretInputProps={{
          label: 'dsfsdf',
          name: 'sdf'
        }}
        secretFieldValue="secretValue"
        accountIdentifier={accountId}
        projectIdentifier={projectIdentifier}
        orgIdentifier={orgIdentifier}
        onSuccessfulFetch={jest.fn()}
      />
    )

    await waitFor(() => expect(container.querySelector('input[placeholder="loading"]')).not.toBeNull())
  })

  test('Ensure that when api returns valid value the onsuccess function is called', async () => {
    jest.spyOn(secretUtils, 'setSecretField').mockResolvedValue('someValue' as any)
    const onSuccessMck = jest.fn()
    render(
      <WrapperComponent
        secretInputProps={{
          label: 'dsfsdf',
          name: 'sdf'
        }}
        secretFieldValue="secretValue"
        accountIdentifier={accountId}
        projectIdentifier={projectIdentifier}
        orgIdentifier={orgIdentifier}
        onSuccessfulFetch={onSuccessMck}
      />
    )

    await waitFor(() => expect(onSuccessMck).toHaveBeenCalledWith('someValue'))
  })

  test('Ensure that when scret value isnt provided api is not callede', async () => {
    const mockfn = jest.spyOn(secretUtils, 'setSecretField').mockResolvedValue('someValue' as any)
    const onSuccessMck = jest.fn()
    const { container } = render(
      <WrapperComponent
        secretInputProps={{
          label: 'dsfsdf',
          name: 'sdf'
        }}
        accountIdentifier={accountId}
        projectIdentifier={projectIdentifier}
        orgIdentifier={orgIdentifier}
        onSuccessfulFetch={onSuccessMck}
      />
    )

    await waitFor(() => expect(container.querySelector('[data-testid="sdf"]')).not.toBeNull())
    expect(mockfn).not.toHaveBeenCalled()
  })
})
