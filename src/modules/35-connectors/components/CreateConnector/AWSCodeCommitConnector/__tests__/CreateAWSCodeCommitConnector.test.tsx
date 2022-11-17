/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, FormInput } from '@harness/uicore'
import { render, fireEvent } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { noop } from 'lodash-es'
import { TestWrapper } from '@common/utils/testUtils'
import { InputTypes, setFieldValue } from '@common/utils/JestFormHelper'
import CreateAWSCodeCommitConnector from '../CreateAWSCodeCommitConnector'

jest.mock('@secrets/components/SecretInput/SecretInput', () => () => (
  <Container className="secret-mock">
    <FormInput.Text name="secretKey" />
  </Container>
))

jest.mock('@secrets/utils/SecretField', () => ({
  setSecretField: async () => ({
    identifier: 'secretIdentifier',
    name: 'secretName',
    referenceString: 'testReferenceString'
  })
}))

jest.mock('services/portal', () => ({
  useGetDelegateTags: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useGetDelegatesStatus: jest.fn().mockImplementation(() => {
    return { data: {}, refetch: jest.fn(), error: null, loading: false }
  }),
  useGetDelegateSelectorsUpTheHierarchy: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useGetDelegatesUpTheHierarchy: jest.fn().mockImplementation(() => ({ mutate: jest.fn() }))
}))

jest.mock('services/cd-ng', () => ({
  ...(jest.requireActual('services/cd-ng') as Record<string, any>),
  validateTheIdentifierIsUniquePromise: () =>
    Promise.resolve({
      status: 'SUCCESS',
      data: true,
      metaData: {},
      correlationId: ''
    }),
  useCreateConnector: jest.fn().mockImplementation(() => ({
    mutate: () =>
      Promise.resolve({
        data: { name: 'NewConnectorCreated' }
      })
  }))
}))

describe('CreateAWSCodeCommitConnector', () => {
  test('matches snapshot and goes through steps correctly', async () => {
    const onSuccess = jest.fn()
    const { container } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateAWSCodeCommitConnector
          accountId="dummyAccountId"
          orgIdentifier="dummyOrgId"
          projectIdentifier="dummyProjectId"
          onClose={noop}
          isEditMode={false}
          setIsEditMode={noop}
          onSuccess={onSuccess}
          connectorInfo={undefined}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()

    await act(async () => {
      fireEvent.change(container.querySelector('input[name="name"]')!, {
        target: { value: 'TestName' }
      })
    })

    await act(async () => {
      fireEvent.click(container.querySelector('button[type="submit"]')!)
    })

    await act(async () => {
      fireEvent.change(container.querySelector('input[name="url"]')!, {
        target: { value: 'TestUrl' }
      })
    })

    await act(async () => {
      fireEvent.click(container.querySelector('button[type="submit"]')!)
    })

    await act(async () => {
      fireEvent.change(container.querySelector('input[name="accessKeytextField"]')!, {
        target: { value: 'accessKeyValue' }
      })
    })

    await setFieldValue({
      container: document.body,
      type: InputTypes.TEXTFIELD,
      fieldId: 'secretKey',
      value: 'secretKeyTestRef'
    })

    await act(async () => {
      fireEvent.click(container.querySelector('button[type="submit"]')!)
    })
    expect(onSuccess).toHaveBeenCalledWith({ name: 'NewConnectorCreated' })
  })
})
