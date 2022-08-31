/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { noop } from 'lodash-es'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { Container, FormInput } from '@wings-software/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { InputTypes, setFieldValue } from '@common/utils/JestFormHelper'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import { AppDynamicsAuthType } from '@connectors/pages/connectors/utils/ConnectorUtils'
import { onNextMock } from '../../CommonCVConnector/__mocks__/CommonCVConnectorMocks'

// tells jest we intent to mock CVConnectorHOC and use mock in __mocks__
jest.mock('../../CommonCVConnector/CVConnectorHOC')
// file that imports mocked component must be placed after jest.mock
import CreateAppDynamicsConnector from '../CreateAppDynamicsConnector'

const AppDURL = 'https://appd.com/api/v1/'

async function updateApiClientAuthType(authType: string) {
  const caret = document.body
    .querySelector(`[name="authType"] + [class*="bp3-input-action"]`)
    ?.querySelector('[data-icon="chevron-down"]')

  // set authtype drop down
  fireEvent.click(caret!)
  await waitFor(() => expect(document.body.querySelector('.bp3-menu [class*="menuItem"]')).not.toBeNull())

  const { index, value } =
    authType === AppDynamicsAuthType.API_CLIENT_TOKEN
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
      </Container>
    )
  }
}))

describe('Unit tests for createAppdConnector', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Ensure validation works', async () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateAppDynamicsConnector
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
    expect(getByText('validation.accountName')).not.toBeNull()
    expect(getByText('connectors.appD.validation.controllerURL')).not.toBeNull()

    // switch auth type
    await updateApiClientAuthType(AppDynamicsAuthType.API_CLIENT_TOKEN)
    fireEvent.click(container.querySelector('button[type="submit"]')!)
    expect(getByText('connectors.appD.validation.clientId')).not.toBeNull()
    expect(getByText('connectors.appD.validation.clientSecret')).not.toBeNull()

    expect(onNextMock).not.toHaveBeenCalled()
  })

  test('Ensure create flow works for username password', async () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateAppDynamicsConnector
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
    await setFieldValue({ container: document.body, type: InputTypes.TEXTFIELD, fieldId: 'username', value: 'sdffsf' })
    await setFieldValue({
      container: document.body,
      type: InputTypes.TEXTFIELD,
      fieldId: 'accountName',
      value: 'semi-auto'
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
        accountName: 'semi-auto',
        authType: AppDynamicsAuthType.USERNAME_PASSWORD,
        orgIdentifier: 'dummyOrgId',
        password: 'some-password',
        projectIdentifier: 'dummyProjectId',
        url: 'https://sdfs.com',
        username: 'username-something'
      })
    )
  })

  test('Ensure create flow works for clientid', async () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateAppDynamicsConnector
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
    await updateApiClientAuthType(AppDynamicsAuthType.API_CLIENT_TOKEN)

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
      fieldId: 'accountName',
      value: 'semi-auto'
    })

    await setFieldValue({
      container: document.body,
      type: InputTypes.TEXTFIELD,
      fieldId: 'clientId',
      value: 'clientId'
    })

    await setFieldValue({
      container: document.body,
      type: InputTypes.TEXTFIELD,
      fieldId: 'clientSecretRef',
      value: 'pass'
    })

    // click submit and verify submitted data
    fireEvent.click(container.querySelector('button[type="submit"]')!)
    await waitFor(() =>
      expect(onNextMock).toHaveBeenCalledWith({
        accountId: 'dummyAccountId',
        accountName: 'semi-auto',
        authType: AppDynamicsAuthType.API_CLIENT_TOKEN,
        orgIdentifier: 'dummyOrgId',
        clientSecretRef: 'pass',
        projectIdentifier: 'dummyProjectId',
        url: 'https://sdfs.com',
        clientId: 'clientId',
        username: null,
        password: null
      })
    )
  })

  test('Ensure if there is existing data, fields are populated', async () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateAppDynamicsConnector
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
              type: 'AppDynamics',
              url: AppDURL,
              clientId: 'appdclientid',
              clientSecretRef: 'appdsecret',
              authType: AppDynamicsAuthType.API_CLIENT_TOKEN,
              accountName: 'solo-dolo',
              delegateSelectors: []
            } as unknown as ConnectorInfoDTO
          }
        />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('authentication')).not.toBeNull())

    // expect recieved value to be there
    expect(document.body.querySelector(`input[value="${AppDURL}"]`)).not.toBeNull()
    expect(document.body.querySelector(`input[value="appdclientid"]`)).not.toBeNull()
    expect(document.body.querySelector(`input[value="appdsecret"]`)).not.toBeNull()
    expect(document.body.querySelector(`input[value="solo-dolo"]`)).not.toBeNull()
    expect(document.body.querySelector('input[value="connectors.appD.apiClient"]')).not.toBeNull()

    // switch auth type to username password
    await updateApiClientAuthType(AppDynamicsAuthType.USERNAME_PASSWORD)

    // update it with new value
    await setFieldValue({ container, fieldId: 'url', value: 'http://sfsfsf.com', type: InputTypes.TEXTFIELD })
    await setFieldValue({
      container,
      type: InputTypes.TEXTFIELD,
      fieldId: 'username',
      value: 'userename'
    })
    // fill out APP Secret
    await setFieldValue({
      container,
      type: InputTypes.TEXTFIELD,
      fieldId: 'password',
      value: 'password'
    })

    // click submit and verify submitted data
    fireEvent.click(container.querySelector('button[type="submit"]')!)
    await waitFor(() =>
      expect(onNextMock).toHaveBeenCalledWith({
        accountId: 'dummyAccountId',
        accountName: 'solo-dolo',
        authType: AppDynamicsAuthType.USERNAME_PASSWORD,
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
        type: 'AppDynamics',
        url: 'http://sfsfsf.com',
        username: 'userename'
      })
    )
  })

  test('Ensure edit flow works', async () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateAppDynamicsConnector
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
              type: 'AppDynamics',
              spec: {
                controllerUrl: AppDURL,
                username: 'username',
                password: 'password',
                authType: AppDynamicsAuthType.USERNAME_PASSWORD,
                accountname: 'solo-dolo',
                delegateSelectors: []
              }
            } as unknown as ConnectorInfoDTO
          }
        />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('authentication')).not.toBeNull())

    // switch auth type to username password
    await updateApiClientAuthType(AppDynamicsAuthType.API_CLIENT_TOKEN)

    // expect recieved value to be there
    expect(container.querySelector(`input[value="${AppDURL}"]`)).not.toBeNull()
    // update it with new value
    await setFieldValue({ container, fieldId: 'url', value: 'http://dgdgtrty.com', type: InputTypes.TEXTFIELD })
    await setFieldValue({
      container,
      type: InputTypes.TEXTFIELD,
      fieldId: 'clientId',
      value: 'clientId'
    })
    // fill out APP Secret
    await setFieldValue({
      container,
      type: InputTypes.TEXTFIELD,
      fieldId: 'clientSecretRef',
      value: 'clientSecretRef'
    })

    // click submit and verify submitted data
    fireEvent.click(container.querySelector('button[type="submit"]')!)
    await waitFor(() =>
      expect(onNextMock).toHaveBeenCalledWith({
        accountId: 'dummyAccountId',
        accountName: 'solo-dolo',
        authType: 'ApiClientToken',
        clientId: 'clientId',
        clientSecretRef: 'clientSecretRef',
        description: '',
        identifier: 'dasdadasdasda',
        name: 'dasdadasdasda',
        orgIdentifier: 'dummyOrgId',
        password: null,
        projectIdentifier: 'dummyProjectId',
        spec: {
          accountname: 'solo-dolo',
          authType: 'UsernamePassword',
          controllerUrl: 'https://appd.com/api/v1/',
          delegateSelectors: [],
          password: 'password',
          username: 'username'
        },
        tags: {},
        type: 'AppDynamics',
        url: 'http://dgdgtrty.com',
        username: null
      })
    )
  })
})
