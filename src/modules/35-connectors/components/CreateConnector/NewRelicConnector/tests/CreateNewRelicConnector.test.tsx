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
import * as cvService from 'services/cv'
import { onNextMock } from '../../CommonCVConnector/__mocks__/CommonCVConnectorMocks'

// tells jest we intent to mock CVConnectorHOC and use mock in __mocks__
jest.mock('../../CommonCVConnector/CVConnectorHOC')
// file that imports mocked component must be placed after jest.mock
import CreateNewRelicConnector from '../CreateNewRelicConnector'

const NewRelicAccountId = 'newRelicAccountId'

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

describe('Unit tests for createNewRelicConnector', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Ensure validation works', async () => {
    jest
      .spyOn(cvService, 'useGetNewRelicEndPoints')
      .mockReturnValue({ data: { data: ['endpoint1', 'endpoint2'] }, loading: false } as any)
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateNewRelicConnector
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

    await waitFor(() => expect(getByText('connectors.newRelic.urlFieldLabel')).not.toBeNull())
    // click submit and verify validation string is visible for user name auth type
    fireEvent.click(container.querySelector('button[type="submit"]')!)
    await waitFor(() => expect(getByText('connectors.newRelic.accountIdValidation')).not.toBeNull())
    expect(getByText('connectors.encryptedAPIKeyValidation')).not.toBeNull()

    expect(onNextMock).not.toHaveBeenCalled()
  })

  test('Ensure create flow works', async () => {
    jest
      .spyOn(cvService, 'useGetNewRelicEndPoints')
      .mockReturnValue({ data: { data: ['endpoint1', 'endpoint2'] }, loading: false } as any)
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateNewRelicConnector
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

    await waitFor(() => expect(getByText('connectors.newRelic.urlFieldLabel')).not.toBeNull())

    // fill out fields and compare payload
    await setFieldValue({
      container: document.body,
      type: InputTypes.TEXTFIELD,
      fieldId: 'newRelicAccountId',
      value: NewRelicAccountId
    })
    await setFieldValue({
      container: document.body,
      type: InputTypes.TEXTFIELD,
      fieldId: 'apiKeyRef',
      value: 'some_secret'
    })

    // click submit and verify submitted data
    fireEvent.click(container.querySelector('button[type="submit"]')!)
    await waitFor(() =>
      expect(onNextMock).toHaveBeenLastCalledWith({
        accountId: 'dummyAccountId',
        newRelicAccountId: NewRelicAccountId,
        orgIdentifier: 'dummyOrgId',
        apiKeyRef: 'some_secret',
        projectIdentifier: 'dummyProjectId',
        url: {
          label: 'endpoint1',
          value: 'endpoint1'
        }
      })
    )
  })

  test('Ensure create flow works with different url', async () => {
    jest
      .spyOn(cvService, 'useGetNewRelicEndPoints')
      .mockReturnValue({ data: { data: ['endpoint1', 'endpoint2'] }, loading: false } as any)
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateNewRelicConnector
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

    await waitFor(() => expect(getByText('connectors.newRelic.urlFieldLabel')).not.toBeNull())

    // fill out fields and compare payload
    await setFieldValue({
      container: document.body,
      type: InputTypes.TEXTFIELD,
      fieldId: 'newRelicAccountId',
      value: NewRelicAccountId
    })
    await setFieldValue({
      container: document.body,
      type: InputTypes.TEXTFIELD,
      fieldId: 'apiKeyRef',
      value: 'anothersecret'
    })
    await setFieldValue({
      container: document.body,
      type: InputTypes.SELECT,
      fieldId: 'url',
      value: 'endpoint2'
    })

    // click submit and verify submitted data
    fireEvent.click(container.querySelector('button[type="submit"]')!)
    await waitFor(() =>
      expect(onNextMock).toHaveBeenLastCalledWith({
        accountId: 'dummyAccountId',
        newRelicAccountId: NewRelicAccountId,
        orgIdentifier: 'dummyOrgId',
        apiKeyRef: 'anothersecret',
        projectIdentifier: 'dummyProjectId',
        url: {
          label: 'endpoint2',
          value: 'endpoint2'
        }
      })
    )
  })

  test('Ensure if there is existing data, fields are populated', async () => {
    jest
      .spyOn(cvService, 'useGetNewRelicEndPoints')
      .mockReturnValue({ data: { data: ['endpoint1', 'endpoint2'] }, loading: false } as any)
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateNewRelicConnector
          accountId="dummyAccountId"
          orgIdentifier="dummyOrgId"
          projectIdentifier="dummyProjectId"
          onClose={noop}
          onSuccess={noop}
          isEditMode={false}
          setIsEditMode={noop}
          connectorInfo={
            {
              accountId: 'dummyAccountId',
              newRelicAccountId: NewRelicAccountId,
              orgIdentifier: 'dummyOrgId',
              delegateSelectors: [],
              apiKeyRef: 'anothersecret',
              projectIdentifier: 'dummyProjectId',
              url: {
                label: 'endpoint2',
                value: 'endpoint2'
              }
            } as unknown as ConnectorInfoDTO
          }
        />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('connectors.newRelic.urlFieldLabel')).not.toBeNull())

    // expect recieved value to be there
    expect(document.body.querySelector(`input[value="${NewRelicAccountId}"]`)).not.toBeNull()
    expect(document.body.querySelector(`input[value="anothersecret"]`)).not.toBeNull()
    expect(document.body.querySelector(`input[value="endpoint2"]`)).not.toBeNull()

    await setFieldValue({
      container: document.body,
      type: InputTypes.TEXTFIELD,
      fieldId: 'apiKeyRef',
      value: 'new_secret'
    })
    await setFieldValue({
      container: document.body,
      type: InputTypes.TEXTFIELD,
      fieldId: 'newRelicAccountId',
      value: 'anothernewaccountId'
    })

    // click submit and verify submitted data
    fireEvent.click(container.querySelector('button[type="submit"]')!)
    await waitFor(() =>
      expect(onNextMock).toHaveBeenLastCalledWith({
        accountId: 'dummyAccountId',
        apiKeyRef: 'new_secret',
        delegateSelectors: [],
        newRelicAccountId: 'anothernewaccountId',
        orgIdentifier: 'dummyOrgId',
        projectIdentifier: 'dummyProjectId',
        url: {
          label: 'endpoint2',
          value: 'endpoint2'
        }
      })
    )
  })

  test('Ensure edit flow works', async () => {
    jest
      .spyOn(cvService, 'useGetNewRelicEndPoints')
      .mockReturnValue({ data: { data: ['endpoint1', 'endpoint2'] }, loading: false } as any)
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateNewRelicConnector
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
              type: 'NewRelic',
              spec: {
                url: 'endpoint1',
                apiKeyRef: 'sfsdfs',
                newRelicAccountId: NewRelicAccountId,
                delegateSelectors: []
              }
            } as unknown as ConnectorInfoDTO
          }
        />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('connectors.newRelic.urlFieldLabel')).not.toBeNull())

    // expect recieved value to be there
    expect(container.querySelector(`input[value="${NewRelicAccountId}"]`)).not.toBeNull()
    await setFieldValue({
      container,
      type: InputTypes.TEXTFIELD,
      fieldId: 'newRelicAccountId',
      value: 'some_newer_accountId'
    })

    // click submit and verify submitted data
    fireEvent.click(container.querySelector('button[type="submit"]')!)
    await waitFor(() =>
      expect(onNextMock).toHaveBeenCalledWith({
        accountId: 'dummyAccountId',
        apiKeyRef: 'sfsdfs',
        delegateSelectors: [],
        description: '',
        identifier: 'dasdadasdasda',
        name: 'dasdadasdasda',
        newRelicAccountId: 'some_newer_accountId',
        orgIdentifier: 'default',
        projectIdentifier: 'Test_101',
        spec: {
          apiKeyRef: 'sfsdfs',
          delegateSelectors: [],
          newRelicAccountId: 'newRelicAccountId',
          url: 'endpoint1'
        },
        tags: {},
        type: 'NewRelic',
        url: {
          label: 'endpoint1',
          value: 'endpoint1'
        }
      })
    )
  })

  test('Ensure drop down shows loading when new relic endpoints are loading', async () => {
    jest.spyOn(cvService, 'useGetNewRelicEndPoints').mockReturnValue({ loading: true } as any)

    const { getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateNewRelicConnector
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

    await waitFor(() => expect(getByText('connectors.newRelic.urlFieldLabel')).not.toBeNull())
    expect(document.body.querySelector('input[placeholder="- loading -"]')).not.toBeNull()
  })

  test('Ensure error is displayed when new relic endpoints api fails', async () => {
    jest
      .spyOn(cvService, 'useGetNewRelicEndPoints')
      .mockReturnValue({ error: { message: 'mockError' }, loading: false } as any)

    const { getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateNewRelicConnector
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

    await waitFor(() => expect(getByText('connectors.newRelic.urlFieldLabel')).not.toBeNull())
    expect(getByText('mockError')).not.toBeNull()
  })
})
