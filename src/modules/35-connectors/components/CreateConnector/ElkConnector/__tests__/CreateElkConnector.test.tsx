/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { noop } from 'lodash-es'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { Button, Container, FormInput } from '@wings-software/uicore'
import { act } from 'react-test-renderer'
import { TestWrapper } from '@common/utils/testUtils'
import { InputTypes, setFieldValue } from '@common/utils/JestFormHelper'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import { ElkAuthType } from '@connectors/constants'
import { onNextMock } from '../../CommonCVConnector/__mocks__/CommonCVConnectorMocks'

// tells jest we intent to mock CVConnectorHOC and use mock in __mocks__
jest.mock('../../CommonCVConnector/CVConnectorHOC')
// file that imports mocked component must be placed after jest.mock
import CreateElkConnector from '../CreateElkConnector'

const elkURL = 'https://elk.com/api/v1/'

async function updateApiClientAuthType(authType: string) {
  const caret = document.body
    .querySelector(`[name="authType"] + [class*="bp3-input-action"]`)
    ?.querySelector('[data-icon="chevron-down"]')

  // set authtype drop down
  fireEvent.click(caret!)
  await waitFor(() => expect(document.body.querySelector('.bp3-menu [class*="menuItem"]')).not.toBeNull())

  const { index, value } =
    authType === ElkAuthType.API_CLIENT_TOKEN
      ? { index: 1, value: 'API Client' }
      : { index: 0, value: 'Username and Password' }
  fireEvent.click(document.body.querySelectorAll('.bp3-menu li')[index])
  await waitFor(() => expect(document.body.querySelector(`input[value="${value}"]`)))
}

jest.mock('../../CommonCVConnector/components/ConnectorSecretField/ConnectorSecretField', () => ({
  ...(jest.requireActual('../../CommonCVConnector/components/ConnectorSecretField/ConnectorSecretField') as any),
  ConnectorSecretField: function MockComponent(b: any) {
    return (
      <Container className="secret-mock">
        <FormInput.Text name={b.secretInputProps.name} />
        <Button
          onClick={() => {
            b.onSuccessfulFetch?.()
          }}
        >
          fetchData
        </Button>
      </Container>
    )
  }
}))

describe('Unit tests for createElkConnector', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Ensure validation works', async () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateElkConnector
          accountId="dummyAccountId"
          orgIdentifier="dummyOrgId"
          projectIdentifier="dummyProjectId"
          onClose={noop}
          onSuccess={noop}
          isEditMode={false}
          setIsEditMode={noop}
          connectorInfo={undefined}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('authentication')).not.toBeNull())
    // click submit and verify validation string is visible for user name auth type
    fireEvent.click(container.querySelector('button[type="submit"]')!)
    await waitFor(() => expect(getByText('validation.username')).not.toBeNull())
    expect(getByText('validation.password')).not.toBeNull()
    expect(getByText('connectors.appD.validation.controllerURL')).not.toBeNull()

    // switch auth type
    await updateApiClientAuthType(ElkAuthType.API_CLIENT_TOKEN)
    fireEvent.click(container.querySelector('button[type="submit"]')!)
    expect(getByText('connectors.elk.validation.apiKeyId')).not.toBeNull()
    expect(getByText('connectors.elk.validation.apiKeyRef')).not.toBeNull()
    expect(onNextMock).not.toHaveBeenCalled()
  })

  test('Ensure create flow works for username password', async () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateElkConnector
          accountId="dummyAccountId"
          orgIdentifier="dummyOrgId"
          projectIdentifier="dummyProjectId"
          onClose={noop}
          onSuccess={noop}
          isEditMode={false}
          setIsEditMode={noop}
          connectorInfo={undefined}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('authentication')).not.toBeNull())

    // fill out fields and compare payload
    await setFieldValue({
      container: document.body,
      type: InputTypes.TEXTFIELD,
      fieldId: 'url',
      value: 'https://sdfs.com'
    })

    await setFieldValue({
      container: document.body,
      type: InputTypes.TEXTFIELD,
      fieldId: 'username',
      value: 'username-something'
    })

    await setFieldValue({
      container: document.body,
      type: InputTypes.TEXTFIELD,
      fieldId: 'password',
      value: 'some-password'
    })

    // click submit and verify submitted data
    fireEvent.click(container.querySelector('button[type="submit"]')!)
    await waitFor(() =>
      expect(onNextMock).toHaveBeenCalledWith({
        accountId: 'dummyAccountId',
        authType: ElkAuthType.USERNAME_PASSWORD,
        orgIdentifier: 'dummyOrgId',
        password: 'some-password',
        projectIdentifier: 'dummyProjectId',
        url: 'https://sdfs.com',
        username: 'username-something'
      })
    )
  })

  test('Ensure create flow works for apiKeyId', async () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateElkConnector
          accountId="dummyAccountId"
          orgIdentifier="dummyOrgId"
          projectIdentifier="dummyProjectId"
          onClose={noop}
          onSuccess={noop}
          isEditMode={false}
          setIsEditMode={noop}
          connectorInfo={undefined}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('authentication')).not.toBeNull())
    await updateApiClientAuthType(ElkAuthType.API_CLIENT_TOKEN)

    // fill out fields and compare payload
    await setFieldValue({
      container: document.body,
      type: InputTypes.TEXTFIELD,
      fieldId: 'url',
      value: 'https://sdfs.com'
    })

    await setFieldValue({
      container: document.body,
      type: InputTypes.TEXTFIELD,
      fieldId: 'apiKeyId',
      value: 'elk_apiKeyId'
    })

    await setFieldValue({
      container: document.body,
      type: InputTypes.TEXTFIELD,
      fieldId: 'apiKeyRef',
      value: 'elk_apiKeyRef'
    })

    // click submit and verify submitted data
    fireEvent.click(container.querySelector('button[type="submit"]')!)
    await waitFor(() =>
      expect(onNextMock).toHaveBeenCalledWith({
        accountId: 'dummyAccountId',
        authType: ElkAuthType.API_CLIENT_TOKEN,
        orgIdentifier: 'dummyOrgId',
        apiKeyRef: 'elk_apiKeyRef',
        projectIdentifier: 'dummyProjectId',
        url: 'https://sdfs.com',
        apiKeyId: 'elk_apiKeyId',
        username: null,
        password: null
      })
    )
  })

  test('Ensure edit flow works', async () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateElkConnector
          accountId="dummyAccountId"
          orgIdentifier="dummyOrgId"
          projectIdentifier="dummyProjectId"
          onClose={noop}
          onSuccess={noop}
          isEditMode={false}
          setIsEditMode={noop}
          connectorInfo={
            {
              name: 'dasdadasdasda',
              identifier: 'dasdadasdasda',
              description: '',
              orgIdentifier: 'default',
              projectIdentifier: 'Test_101',
              tags: {},
              type: 'ELK',
              spec: {
                controllerUrl: elkURL,
                username: 'username',
                password: 'password',
                authType: ElkAuthType.USERNAME_PASSWORD,
                delegateSelectors: [],
                passwordRef: 'passwordRef'
              }
            } as unknown as ConnectorInfoDTO
          }
        />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('authentication')).not.toBeNull())

    // switch auth type to username password
    await updateApiClientAuthType(ElkAuthType.API_CLIENT_TOKEN)

    // expect recieved value to be there
    expect(container.querySelector(`input[value="${elkURL}"]`)).not.toBeNull()
    // update it with new value
    await setFieldValue({
      container,
      fieldId: 'url',
      value: 'http://dgdgtrty.com',
      type: InputTypes.TEXTFIELD
    })
    await setFieldValue({
      container,
      type: InputTypes.TEXTFIELD,
      fieldId: 'apiKeyId',
      value: 'elk_apiKeyId'
    })
    // fill out APP Secret
    await setFieldValue({
      container,
      type: InputTypes.TEXTFIELD,
      fieldId: 'apiKeyRef',
      value: 'elk_apiKeyRef'
    })

    // click submit and verify submitted data
    act(() => {
      fireEvent.click(container.querySelector('button[type="submit"]')!)
    })
    await waitFor(() =>
      expect(onNextMock).toHaveBeenCalledWith({
        accountId: 'dummyAccountId',
        authType: 'ApiClientToken',
        apiKeyId: 'elk_apiKeyId',
        apiKeyRef: 'elk_apiKeyRef',
        description: '',
        identifier: 'dasdadasdasda',
        name: 'dasdadasdasda',
        orgIdentifier: 'dummyOrgId',
        password: null,
        projectIdentifier: 'dummyProjectId',
        clientId: undefined,
        clientSecretRef: undefined,
        spec: {
          authType: 'UsernamePassword',
          controllerUrl: 'https://elk.com/api/v1/',
          delegateSelectors: [],
          password: 'password',
          passwordRef: 'passwordRef',
          username: 'username'
        },
        tags: {},
        type: 'ELK',
        url: 'http://dgdgtrty.com',
        username: null
      })
    )
  })

  test('Ensure if there is existing data, fields are populated', async () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateElkConnector
          accountId="dummyAccountId"
          orgIdentifier="dummyOrgId"
          projectIdentifier="dummyProjectId"
          onClose={noop}
          onSuccess={noop}
          isEditMode={false}
          setIsEditMode={noop}
          connectorInfo={
            {
              name: 'dasdadasdasda',
              identifier: 'dasdadasdasda',
              description: '',
              orgIdentifier: 'default',
              projectIdentifier: 'Test_101',
              tags: {},
              type: 'ELK',
              url: elkURL,
              apiKeyId: 'appdclientid',
              apiKeyRef: {
                referenceString: 'referenceString'
              },
              authType: ElkAuthType.API_CLIENT_TOKEN,
              delegateSelectors: []
            } as unknown as ConnectorInfoDTO
          }
        />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('authentication')).not.toBeNull())

    // expect recieved value to be there
    expect(document.body.querySelector(`input[value="${elkURL}"]`)).not.toBeNull()
    // switch auth type to username password
    await updateApiClientAuthType(ElkAuthType.USERNAME_PASSWORD)

    // update it with new value
    await setFieldValue({
      container,
      fieldId: 'url',
      value: 'http://sfsfsf.com',
      type: InputTypes.TEXTFIELD
    })
    await setFieldValue({
      container,
      type: InputTypes.TEXTFIELD,
      fieldId: 'username',
      value: 'username'
    })

    // fill out APP Secret
    await setFieldValue({
      container,
      type: InputTypes.TEXTFIELD,
      fieldId: 'password',
      value: 'password'
    })

    // click submit and verify submitted data
    act(() => {
      fireEvent.click(container.querySelector('button[type="submit"]')!)
    })
    await waitFor(() =>
      expect(onNextMock).toHaveBeenCalledWith({
        accountId: 'dummyAccountId',
        authType: ElkAuthType.USERNAME_PASSWORD,
        apiKeyId: 'appdclientid',
        apiKeyRef: {
          referenceString: 'referenceString'
        },
        clientId: null,
        clientSecretRef: null,
        delegateSelectors: [],
        description: '',
        identifier: 'dasdadasdasda',
        name: 'dasdadasdasda',
        orgIdentifier: 'dummyOrgId',
        password: 'password',
        projectIdentifier: 'dummyProjectId',
        tags: {},
        type: 'ELK',
        url: 'http://sfsfsf.com',
        username: 'username'
      })
    )
  })
  test('Ensure if there is existing data, fields are populated', async () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateElkConnector
          accountId="dummyAccountId"
          orgIdentifier="dummyOrgId"
          projectIdentifier="dummyProjectId"
          onClose={noop}
          onSuccess={noop}
          isEditMode={false}
          setIsEditMode={noop}
          connectorInfo={
            {
              name: 'dasdadasdasda',
              identifier: 'dasdadasdasda',
              description: '',
              orgIdentifier: 'default',
              projectIdentifier: 'Test_101',
              tags: {},
              type: 'ELK',
              url: elkURL,
              apiKeyId: 'appdclientid',
              spec: {
                apiKeyRef: 'apiKeyRef'
              },
              authType: ElkAuthType.API_CLIENT_TOKEN,
              delegateSelectors: []
            } as unknown as ConnectorInfoDTO
          }
        />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('authentication')).not.toBeNull())

    // expect recieved value to be there
    expect(document.body.querySelector(`input[value="${elkURL}"]`)).not.toBeNull()

    // switch auth type to username password
    await updateApiClientAuthType(ElkAuthType.USERNAME_PASSWORD)

    // update it with new value
    await setFieldValue({
      container,
      fieldId: 'url',
      value: 'http://sfsfsf.com',
      type: InputTypes.TEXTFIELD
    })
    await setFieldValue({
      container,
      type: InputTypes.TEXTFIELD,
      fieldId: 'username',
      value: 'username'
    })

    // fill out APP Secret
    await setFieldValue({
      container,
      type: InputTypes.TEXTFIELD,
      fieldId: 'password',
      value: 'password'
    })

    // click submit and verify submitted data
    act(() => {
      fireEvent.click(container.querySelector('button[type="submit"]')!)
    })
    act(() => {
      fireEvent.click(getByText('fetchData'))
    })
    await waitFor(() =>
      expect(onNextMock).toHaveBeenCalledWith({
        accountId: 'dummyAccountId',
        authType: ElkAuthType.USERNAME_PASSWORD,
        apiKeyId: 'appdclientid',
        spec: {
          apiKeyRef: 'apiKeyRef'
        },
        clientId: null,
        clientSecretRef: null,
        delegateSelectors: [],
        description: '',
        identifier: 'dasdadasdasda',
        name: 'dasdadasdasda',
        orgIdentifier: 'dummyOrgId',
        password: 'password',
        projectIdentifier: 'dummyProjectId',
        tags: {},
        type: 'ELK',
        url: 'http://sfsfsf.com',
        username: 'username'
      })
    )
  })

  test('prep', async () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateElkConnector
          accountId="dummyAccountId"
          orgIdentifier="dummyOrgId"
          projectIdentifier="dummyProjectId"
          onClose={noop}
          onSuccess={noop}
          isEditMode={false}
          setIsEditMode={noop}
          connectorInfo={
            {
              name: 'dasdadasdasda',
              identifier: 'dasdadasdasda',
              description: '',
              orgIdentifier: 'default',
              projectIdentifier: 'Test_101',
              tags: {},
              type: 'ELK',
              url: elkURL,
              apiKeyId: 'appdclientid',
              apiKeyRef: 'appdsecretf',
              authType: ElkAuthType.NONE,

              delegateSelectors: []
            } as unknown as ConnectorInfoDTO
          }
        />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('authentication')).not.toBeNull())

    // expect recieved value to be there
    expect(document.body.querySelector(`input[value="${elkURL}"]`)).not.toBeNull()

    // switch auth type to username password
    await updateApiClientAuthType(ElkAuthType.USERNAME_PASSWORD)

    // update it with new value
    await setFieldValue({
      container,
      fieldId: 'url',
      value: 'http://sfsfsf.com',
      type: InputTypes.TEXTFIELD
    })
    await setFieldValue({
      container,
      type: InputTypes.TEXTFIELD,
      fieldId: 'username',
      value: 'username'
    })

    // fill out APP Secret
    await setFieldValue({
      container,
      type: InputTypes.TEXTFIELD,
      fieldId: 'password',
      value: 'password'
    })

    // click submit and verify submitted data
    act(() => {
      fireEvent.click(container.querySelector('button[type="submit"]')!)
    })
    await waitFor(() =>
      expect(onNextMock).toHaveBeenCalledWith({
        accountId: 'dummyAccountId',
        authType: ElkAuthType.USERNAME_PASSWORD,
        apiKeyId: 'appdclientid',
        apiKeyRef: 'appdsecretf',
        clientId: null,
        clientSecretRef: null,
        delegateSelectors: [],
        description: '',
        identifier: 'dasdadasdasda',
        name: 'dasdadasdasda',
        orgIdentifier: 'dummyOrgId',
        password: 'password',
        projectIdentifier: 'dummyProjectId',
        tags: {},
        type: 'ELK',
        url: 'http://sfsfsf.com',
        username: 'username'
      })
    )
  })
  test('prep 2', async () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateElkConnector
          accountId="dummyAccountId"
          orgIdentifier="dummyOrgId"
          projectIdentifier="dummyProjectId"
          onClose={noop}
          onSuccess={noop}
          isEditMode={false}
          setIsEditMode={noop}
          connectorInfo={
            {
              name: 'dasdadasdasda',
              identifier: 'dasdadasdasda',
              description: '',
              orgIdentifier: 'default',
              projectIdentifier: 'Test_101',
              tags: {},
              type: 'ELK',
              url: elkURL,
              apiKeyId: 'appdclientid',
              apiKeyRef: 'appdsecretf',
              authType: ElkAuthType.USERNAME_PASSWORD,
              password: {
                referenceString: 'referenceString'
              },
              delegateSelectors: []
            } as unknown as ConnectorInfoDTO
          }
        />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('authentication')).not.toBeNull())

    // expect recieved value to be there
    expect(document.body.querySelector(`input[value="${elkURL}"]`)).not.toBeNull()

    // switch auth type to username password
    await updateApiClientAuthType(ElkAuthType.USERNAME_PASSWORD)

    // update it with new value
    await setFieldValue({
      container,
      fieldId: 'url',
      value: 'http://sfsfsf.com',
      type: InputTypes.TEXTFIELD
    })
    await setFieldValue({
      container,
      type: InputTypes.TEXTFIELD,
      fieldId: 'username',
      value: 'username'
    })

    // fill out APP Secret
    await setFieldValue({
      container,
      type: InputTypes.TEXTFIELD,
      fieldId: 'password',
      value: 'password'
    })

    // click submit and verify submitted data
    act(() => {
      fireEvent.click(container.querySelector('button[type="submit"]')!)
    })
    act(() => {
      fireEvent.click(getByText('fetchData'))
    })
    await waitFor(() =>
      expect(onNextMock).toHaveBeenCalledWith({
        accountId: 'dummyAccountId',
        authType: ElkAuthType.USERNAME_PASSWORD,
        apiKeyId: 'appdclientid',
        apiKeyRef: 'appdsecretf',
        clientId: null,
        clientSecretRef: null,
        delegateSelectors: [],
        description: '',
        identifier: 'dasdadasdasda',
        name: 'dasdadasdasda',
        orgIdentifier: 'dummyOrgId',
        password: {
          referenceString: 'referenceString'
        },
        projectIdentifier: 'dummyProjectId',
        tags: {},
        type: 'ELK',
        url: 'http://sfsfsf.com',
        username: 'username'
      })
    )
  })
})
