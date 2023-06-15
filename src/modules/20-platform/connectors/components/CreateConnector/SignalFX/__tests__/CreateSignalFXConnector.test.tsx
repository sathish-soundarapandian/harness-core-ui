/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, waitFor } from '@testing-library/dom'
import { render } from '@testing-library/react'
import { FormInput, Container } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { InputTypes, setFieldValue } from '@common/utils/JestFormHelper'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import { onNextMock } from '../../CommonCVConnector/__mocks__/CommonCVConnectorMocks'

jest.mock('../../CommonCVConnector/CVConnectorHOC')
import CreateSignalFXConnector from '../CreateSignalFXConnector'

const SignalFXURL = 'https://signalfx.com'
const ApiToken = 'apiToken'

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

describe('Unit tests for CreateSignalFXConnector', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Ensure validation works', async () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateSignalFXConnector
          accountId="dummyAccountId"
          orgIdentifier="dummyOrgId"
          projectIdentifier="dummyProjectId"
          onClose={jest.fn()}
          onSuccess={jest.fn()}
          isEditMode={false}
          setIsEditMode={jest.fn()}
          connectorInfo={undefined}
        />
      </TestWrapper>
    )

    // fill out url field
    await waitFor(() => expect(getByText('UrlLabel')).not.toBeNull())

    // click submit and verify validation string is visible
    fireEvent.click(container.querySelector('button[type="submit"]')!)
    await waitFor(() => expect(getByText('connectors.signalfx.urlValidation')).not.toBeNull())
    expect(getByText('connectors.apiTokenValidation')).not.toBeNull()
    expect(onNextMock).not.toHaveBeenCalled()
  })

  test('Ensure create flow works', async () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateSignalFXConnector
          accountId="dummyAccountId"
          orgIdentifier="dummyOrgId"
          projectIdentifier="dummyProjectId"
          onClose={jest.fn()}
          onSuccess={jest.fn()}
          isEditMode={false}
          setIsEditMode={jest.fn()}
          connectorInfo={undefined}
        />
      </TestWrapper>
    )

    // fill out url field
    await waitFor(() => expect(getByText('UrlLabel')).not.toBeNull())
    await setFieldValue({ container, fieldId: 'url', value: SignalFXURL, type: InputTypes.TEXTFIELD })
    await setFieldValue({ container, fieldId: 'apiTokenRef', value: ApiToken, type: InputTypes.TEXTFIELD })

    // click submit and verify submitted data
    fireEvent.click(container.querySelector('button[type="submit"]')!)
    await waitFor(() =>
      expect(onNextMock).toHaveBeenLastCalledWith({
        accountId: 'dummyAccountId',
        orgIdentifier: 'dummyOrgId',
        projectIdentifier: 'dummyProjectId',
        url: SignalFXURL,
        apiTokenRef: ApiToken
      })
    )
  })

  test('Ensure if there is existing data, fields are populated', async () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateSignalFXConnector
          accountId="dummyAccountId"
          orgIdentifier="dummyOrgId"
          projectIdentifier="dummyProjectId"
          onClose={jest.fn()}
          onSuccess={jest.fn()}
          isEditMode={false}
          setIsEditMode={jest.fn()}
          connectorInfo={{ url: SignalFXURL + '/', apiTokenRef: ApiToken } as unknown as ConnectorInfoDTO}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('UrlLabel')).not.toBeNull())

    // expect recieved value to be there
    expect(container.querySelector(`input[value="${SignalFXURL + '/'}"]`)).not.toBeNull()
    expect(container.querySelector(`input[value=${ApiToken}]`)).not.toBeNull()

    // update it with new value
    await setFieldValue({ container, fieldId: 'url', value: 'http://sfsfsf.com', type: InputTypes.TEXTFIELD })

    // click submit and verify submitted data
    fireEvent.click(container.querySelector('button[type="submit"]')!)
    await waitFor(() =>
      expect(onNextMock).toHaveBeenLastCalledWith({
        accountId: 'dummyAccountId',
        apiTokenRef: ApiToken,
        orgIdentifier: 'dummyOrgId',
        projectIdentifier: 'dummyProjectId',
        url: 'http://sfsfsf.com'
      })
    )
  })

  test('Ensure edit flow works', async () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateSignalFXConnector
          accountId="dummyAccountId"
          orgIdentifier="dummyOrgId"
          projectIdentifier="dummyProjectId"
          onClose={jest.fn()}
          onSuccess={jest.fn()}
          isEditMode={false}
          setIsEditMode={jest.fn()}
          connectorInfo={{ spec: { url: SignalFXURL, apiTokenRef: ApiToken } } as unknown as ConnectorInfoDTO}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('UrlLabel')).not.toBeNull())

    // expect recieved value to be there
    expect(container.querySelector(`input[value="${SignalFXURL}"]`)).not.toBeNull()
    // update it with new value
    await setFieldValue({ container, fieldId: 'url', value: 'http://dgdgtrty.com', type: InputTypes.TEXTFIELD })
    await setFieldValue({ container, fieldId: 'apiTokenRef', value: 'newToken', type: InputTypes.TEXTFIELD })

    // click submit and verify submitted data
    fireEvent.click(container.querySelector('button[type="submit"]')!)
    await waitFor(() =>
      expect(onNextMock).toHaveBeenCalledWith({
        accountId: 'dummyAccountId',
        apiTokenRef: 'newToken',
        orgIdentifier: 'dummyOrgId',
        projectIdentifier: 'dummyProjectId',
        spec: {
          url: SignalFXURL,
          apiTokenRef: ApiToken
        },
        url: 'http://dgdgtrty.com'
      })
    )
  })
})
