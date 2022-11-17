/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { noop } from 'lodash-es'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { Container, FormInput } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { InputTypes, setFieldValue } from '@common/utils/JestFormHelper'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import { onNextMock } from '../../CommonCVConnector/__mocks__/CommonCVConnectorMocks'

// tells jest we intent to mock CVConnectorHOC and use mock in __mocks__
jest.mock('../../CommonCVConnector/CVConnectorHOC')
// file that imports mocked component must be placed after jest.mock
import CreateSplunkConnector from '../CreateSplunkConnector'

const SplunkURL = 'https://splunk.com/api/v1/'

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
        <CreateSplunkConnector
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

    await waitFor(() => expect(getByText('UrlLabel')).not.toBeNull())
    // click submit and verify validation string is visible for user name auth type
    fireEvent.click(container.querySelector('button[type="submit"]')!)
    await waitFor(() => expect(getByText('common.validation.urlIsRequired')).not.toBeNull())
    expect(getByText('validation.username')).not.toBeNull()
    expect(getByText('validation.password')).not.toBeNull()

    expect(onNextMock).not.toHaveBeenCalled()
  })

  test('Ensure create flow works for username password', async () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateSplunkConnector
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

    await waitFor(() => expect(getByText('UrlLabel')).not.toBeNull())

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
      value: 'splunkUsername'
    })
    await setFieldValue({
      container: document.body,
      type: InputTypes.TEXTFIELD,
      fieldId: 'passwordRef',
      value: 'somePassword'
    })

    // click submit and verify submitted data
    fireEvent.click(container.querySelector('button[type="submit"]')!)
    await waitFor(() =>
      expect(onNextMock).toHaveBeenCalledWith({
        accountId: 'dummyAccountId',
        orgIdentifier: 'dummyOrgId',
        passwordRef: 'somePassword',
        projectIdentifier: 'dummyProjectId',
        url: 'https://sdfs.com',
        username: 'splunkUsername'
      })
    )
  })

  test('Ensure if there is existing data, fields are populated', async () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateSplunkConnector
          accountId="dummyAccountId"
          orgIdentifier="dummyOrgId"
          projectIdentifier="dummyProjectId"
          onClose={noop}
          onSuccess={noop}
          isEditMode={false}
          setIsEditMode={noop}
          connectorInfo={
            {
              name: 'splunkConnector',
              identifier: 'accountSplunkConnector',
              description: '',
              accountId: 'dummyAccountId',
              orgIdentifier: 'dummyOrgId',
              passwordRef: 'somePassword',
              projectIdentifier: 'dummyProjectId',
              url: SplunkURL,
              username: 'splunkUsername',
              tags: {},
              type: 'Splunk',
              delegateSelectors: []
            } as unknown as ConnectorInfoDTO
          }
        />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('UrlLabel')).not.toBeNull())

    // expect recieved value to be there
    expect(document.body.querySelector(`input[value="${SplunkURL}"]`)).not.toBeNull()
    expect(document.body.querySelector(`input[value="somePassword"]`)).not.toBeNull()
    expect(document.body.querySelector(`input[value="splunkUsername"]`)).not.toBeNull()

    // update it with new value
    await setFieldValue({ container, fieldId: 'url', value: 'http://sfsfsf.com', type: InputTypes.TEXTFIELD })
    await setFieldValue({
      container,
      type: InputTypes.TEXTFIELD,
      fieldId: 'username',
      value: 'updated_userename'
    })
    // fill out APP Secret
    await setFieldValue({
      container,
      type: InputTypes.TEXTFIELD,
      fieldId: 'passwordRef',
      value: 'newSplunkPassword'
    })

    // click submit and verify submitted data
    fireEvent.click(container.querySelector('button[type="submit"]')!)
    await waitFor(() =>
      expect(onNextMock).toHaveBeenCalledWith({
        accountId: 'dummyAccountId',
        delegateSelectors: [],
        description: '',
        identifier: 'accountSplunkConnector',
        name: 'splunkConnector',
        orgIdentifier: 'dummyOrgId',
        passwordRef: 'newSplunkPassword',
        projectIdentifier: 'dummyProjectId',
        tags: {},
        type: 'Splunk',
        url: 'http://sfsfsf.com',
        username: 'updated_userename'
      })
    )
  })

  test('Ensure edit flow works', async () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateSplunkConnector
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
                passwordRef: 'somePassword',
                splunkUrl: 'https://sdfs.com',
                username: 'splunkUsername',
                delegateSelectors: []
              }
            } as unknown as ConnectorInfoDTO
          }
        />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('UrlLabel')).not.toBeNull())

    // expect recieved value to be there
    expect(container.querySelector(`input[value="https://sdfs.com"]`)).not.toBeNull()
    // update it with new value
    await setFieldValue({ container, fieldId: 'url', value: 'http://dgdgtrty.com', type: InputTypes.TEXTFIELD })
    await setFieldValue({
      container,
      type: InputTypes.TEXTFIELD,
      fieldId: 'username',
      value: 'new_and_updateduser'
    })

    // click submit and verify submitted data
    fireEvent.click(container.querySelector('button[type="submit"]')!)
    await waitFor(() =>
      expect(onNextMock).toHaveBeenCalledWith({
        accountId: 'dummyAccountId',
        description: '',
        identifier: 'dasdadasdasda',
        name: 'dasdadasdasda',
        orgIdentifier: 'dummyOrgId',
        passwordRef: 'somePassword',
        projectIdentifier: 'dummyProjectId',
        spec: {
          delegateSelectors: [],
          passwordRef: 'somePassword',
          splunkUrl: 'https://sdfs.com',
          username: 'splunkUsername'
        },
        tags: {},
        type: 'AppDynamics',
        url: 'http://dgdgtrty.com',
        username: 'new_and_updateduser'
      })
    )
  })
})
