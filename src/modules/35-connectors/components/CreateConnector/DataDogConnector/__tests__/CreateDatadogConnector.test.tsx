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
import * as dataDogutils from '../utils'
import { onNextMock } from '../../CommonCVConnector/__mocks__/CommonCVConnectorMocks'

const callBuildDatadogPayload = jest.fn()
// tells jest we intent to mock CVConnectorHOC and use mock in __mocks__
jest.mock('../../CommonCVConnector/CVConnectorHOC')
// file that imports mocked component must be placed after jest.mock
import CreateDataDogConnector from '../CreateDataDogConnector'

const DatadogURL = 'https://app.datadoghq.com/api/v1/'

const INIT_DATADOG_VALUE = {
  url: '',
  applicationKeyRef: null,
  apiKeyRef: null,
  delegateSelectors: [],
  name: '',
  identifier: '',
  description: '',
  accountId: 'dummyAccountId',
  orgIdentifier: 'dummyOrgId',
  projectIdentifier: 'dummyProjectId',
  tags: {},
  type: 'Datadog',
  loading: false
}

jest.mock('@connectors/pages/connectors/utils/ConnectorUtils', () => ({
  buildDatadogPayload: callBuildDatadogPayload
}))

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

describe('Create datadog connector Wizard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Ensure validation works', async () => {
    jest.spyOn(dataDogutils, 'initializeDatadogConnectorWithStepData').mockReturnValue(
      new Promise<any>(resolve => {
        resolve(INIT_DATADOG_VALUE)
      })
    )
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateDataDogConnector
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
    // click submit and verify validation string is visible
    fireEvent.click(container.querySelector('button[type="submit"]')!)
    await waitFor(() => expect(getByText('connectors.datadog.urlValidation')).not.toBeNull())
    expect(onNextMock).not.toHaveBeenCalled()
  })

  test('Ensure create flow works', async () => {
    jest.spyOn(dataDogutils, 'initializeDatadogConnectorWithStepData').mockReturnValue(
      new Promise<any>(resolve => {
        resolve(INIT_DATADOG_VALUE)
      })
    )
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateDataDogConnector
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

    // fill out url field
    await waitFor(() => expect(getByText('UrlLabel')).not.toBeNull())
    await setFieldValue({ container, fieldId: 'url', value: DatadogURL, type: InputTypes.TEXTFIELD })
    // fill out API Secret
    await setFieldValue({
      container,
      type: InputTypes.TEXTFIELD,
      fieldId: 'apiKeyRef',
      value: 'dsf-auto'
    })
    // fill out APP Secret
    await setFieldValue({
      container,
      type: InputTypes.TEXTFIELD,
      fieldId: 'applicationKeyRef',
      value: 'dsf-new'
    })

    // click submit and verify submitted data
    fireEvent.click(container.querySelector('button[type="submit"]')!)

    await waitFor(() =>
      expect(onNextMock).toHaveBeenCalledWith({
        ...INIT_DATADOG_VALUE,
        apiKeyRef: 'dsf-auto',
        applicationKeyRef: 'dsf-new',
        url: DatadogURL
      })
    )

    expect(container).toMatchSnapshot()
  })

  test('Ensure if there is existing data, fields are populated', async () => {
    jest.spyOn(dataDogutils, 'initializeDatadogConnectorWithStepData').mockReturnValue(
      new Promise<any>(resolve => {
        resolve({
          ...INIT_DATADOG_VALUE,
          url: DatadogURL,
          identifier: 'DataDogConnector101',
          name: 'DataDogConnector101'
        })
      })
    )
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateDataDogConnector
          accountId="dummyAccountId"
          orgIdentifier="dummyOrgId"
          projectIdentifier="dummyProjectId"
          onClose={noop}
          onSuccess={noop}
          isEditMode={false}
          setIsEditMode={noop}
          connectorInfo={
            {
              name: 'DataDogConnector101',
              identifier: 'DataDogConnector101',
              description: '',
              accountId: 'dummyAccountId',
              orgIdentifier: 'default',
              projectIdentifier: 'Test_101',
              tags: {},
              type: 'Datadog',
              loading: false,
              spec: {
                url: DatadogURL,
                applicationKeyRef: 'datadog_app_secret',
                apiKeyRef: 'datadog_api_secret',
                delegateSelectors: []
              }
            } as unknown as ConnectorInfoDTO
          }
        />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('UrlLabel')).not.toBeNull())

    // expect recieved value to be there
    waitFor(() => expect(container.querySelector(`input[value="${DatadogURL}"]`)).not.toBeNull())

    // update it with new value
    await setFieldValue({ container, fieldId: 'url', value: 'http://datadogapi.com', type: InputTypes.TEXTFIELD })
    await setFieldValue({
      container,
      type: InputTypes.TEXTFIELD,
      fieldId: 'apiKeyRef',
      value: 'datadog_api_secret'
    })
    // fill out APP Secret
    await setFieldValue({
      container,
      type: InputTypes.TEXTFIELD,
      fieldId: 'applicationKeyRef',
      value: 'datadog_app_secret'
    })

    // click submit and verify submitted data
    fireEvent.click(container.querySelector('button[type="submit"]')!)
    await waitFor(() =>
      expect(onNextMock).toHaveBeenCalledWith({
        apiKeyRef: 'datadog_api_secret',
        applicationKeyRef: 'datadog_app_secret',
        delegateSelectors: [],
        description: '',
        accountId: 'dummyAccountId',
        identifier: 'DataDogConnector101',
        name: 'DataDogConnector101',
        orgIdentifier: 'dummyOrgId',
        projectIdentifier: 'dummyProjectId',
        loading: false,
        spec: {
          apiKeyRef: 'datadog_api_secret',
          applicationKeyRef: 'datadog_app_secret',
          delegateSelectors: [],
          url: 'https://app.datadoghq.com/api/v1/'
        },
        tags: {},
        type: 'Datadog',
        url: 'http://datadogapi.com'
      })
    )
  })

  test('Ensure edit flow works', async () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateDataDogConnector
          accountId="dummyAccountId"
          orgIdentifier="dummyOrgId"
          projectIdentifier="dummyProjectId"
          onClose={noop}
          onSuccess={noop}
          isEditMode={false}
          setIsEditMode={noop}
          connectorInfo={
            {
              name: 'DataDogConnector101',
              identifier: 'DataDogConnector101',
              description: '',
              orgIdentifier: 'dummyOrgId',
              projectIdentifier: 'dummyProjectId',
              tags: {},
              type: 'Datadog',
              loading: false,
              spec: {
                url: DatadogURL,
                applicationKeyRef: 'datadog_app_secret',
                apiKeyRef: 'datadog_api_secret',
                delegateSelectors: []
              }
            } as unknown as ConnectorInfoDTO
          }
        />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('UrlLabel')).not.toBeNull())

    // expect recieved value to be there
    waitFor(() => expect(container.querySelector(`input[value="https://app.datadoghq.com/api/v1/"]`)).not.toBeNull())
    // update it with new value
    await setFieldValue({ container, fieldId: 'url', value: 'http://dgdgtrty.com', type: InputTypes.TEXTFIELD })
    await setFieldValue({
      container,
      type: InputTypes.TEXTFIELD,
      fieldId: 'apiKeyRef',
      value: 'datadog_api_secret'
    })
    // fill out APP Secret
    await setFieldValue({
      container,
      type: InputTypes.TEXTFIELD,
      fieldId: 'applicationKeyRef',
      value: 'datadog_app_secret'
    })

    // click submit and verify submitted data
    fireEvent.click(container.querySelector('button[type="submit"]')!)
    await waitFor(() =>
      expect(onNextMock).toHaveBeenCalledWith({
        apiKeyRef: 'datadog_api_secret',
        applicationKeyRef: 'datadog_app_secret',
        delegateSelectors: [],
        description: '',
        accountId: 'dummyAccountId',
        identifier: 'DataDogConnector101',
        name: 'DataDogConnector101',
        orgIdentifier: 'dummyOrgId',
        projectIdentifier: 'dummyProjectId',
        loading: false,
        spec: {
          apiKeyRef: 'datadog_api_secret',
          applicationKeyRef: 'datadog_app_secret',
          delegateSelectors: [],
          url: 'https://app.datadoghq.com/api/v1/'
        },
        tags: {},
        type: 'Datadog',
        url: 'http://dgdgtrty.com'
      })
    )
  })
})
