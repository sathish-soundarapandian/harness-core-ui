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
import * as pagerDutyUtils from '../CreatePagerDutyConnector.utils'
import { onNextMock } from '../../CommonCVConnector/__mocks__/CommonCVConnectorMocks'

const callBuildPagerDutyPayload = jest.fn()
// tells jest we intent to mock CVConnectorHOC and use mock in __mocks__
jest.mock('../../CommonCVConnector/CVConnectorHOC')
// file that imports mocked component must be placed after jest.mock
import CreatePagerDutyConnector from '../CreatePagerDutyConnector'

const INIT_PAGERDUTY_VALUE = {
  apiTokenRef: '',
  delegateSelectors: [],
  name: '',
  identifier: '',
  description: '',
  accountId: 'dummyAccountId',
  orgIdentifier: 'dummyOrgId',
  projectIdentifier: 'dummyProjectId',
  tags: {},
  type: 'PagerDuty',
  loading: false
}

jest.mock('@connectors/pages/connectors/utils/ConnectorUtils', () => ({
  buildDatadogPayload: callBuildPagerDutyPayload
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

describe('Create PagerDuty Connector Wizard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Ensure validation works', async () => {
    jest.spyOn(pagerDutyUtils, 'initializePagerDutyConnectorWithStepData').mockReturnValue(
      new Promise<any>(resolve => {
        resolve(INIT_PAGERDUTY_VALUE)
      })
    )
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreatePagerDutyConnector
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

    await waitFor(() => expect(container.querySelector('input[name="apiTokenRef"]')).not.toBeNull())

    // click submit and verify validation string is visible
    fireEvent.click(container.querySelector('button[type="submit"]')!)
    await waitFor(() => expect(getByText('connectors.encryptedAPIKeyValidation')).not.toBeNull())
    expect(onNextMock).not.toHaveBeenCalled()
  })

  test('Ensure create flow works', async () => {
    jest.spyOn(pagerDutyUtils, 'initializePagerDutyConnectorWithStepData').mockReturnValue(
      new Promise<any>(resolve => {
        resolve(INIT_PAGERDUTY_VALUE)
      })
    )
    const { container } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreatePagerDutyConnector
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

    // INPUT exist
    await waitFor(() => expect(container.querySelector('input[name="apiTokenRef"]')).not.toBeNull())

    // fill out API Secret
    await setFieldValue({
      container,
      type: InputTypes.TEXTFIELD,
      fieldId: 'apiTokenRef',
      value: 'dsf-auto'
    })

    // click submit and verify submitted data
    fireEvent.click(container.querySelector('button[type="submit"]')!)

    await waitFor(() =>
      expect(onNextMock).toHaveBeenCalledWith({
        ...INIT_PAGERDUTY_VALUE,
        apiTokenRef: 'dsf-auto'
      })
    )

    expect(container).toMatchSnapshot()
  })

  test('Ensure if there is existing data, fields are populated', async () => {
    jest.spyOn(pagerDutyUtils, 'initializePagerDutyConnectorWithStepData').mockReturnValue(
      new Promise<any>(resolve => {
        resolve({
          ...INIT_PAGERDUTY_VALUE,
          identifier: 'PagerDutyConnector101',
          name: 'PagerDutyConnector101'
        })
      })
    )
    const { container } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreatePagerDutyConnector
          accountId="dummyAccountId"
          orgIdentifier="dummyOrgId"
          projectIdentifier="dummyProjectId"
          onClose={noop}
          onSuccess={noop}
          isEditMode={false}
          setIsEditMode={noop}
          connectorInfo={
            {
              name: 'PagerDutyConnector101',
              identifier: 'PagerDutyConnector101',
              description: '',
              accountId: 'dummyAccountId',
              orgIdentifier: 'default',
              projectIdentifier: 'Test_101',
              tags: {},
              type: 'PagerDuty',
              loading: false,
              spec: {
                apiTokenRef: 'pagerduty_api_secret',
                delegateSelectors: []
              }
            } as unknown as ConnectorInfoDTO
          }
        />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('input[name="apiTokenRef"]')).not.toBeNull())

    await setFieldValue({
      container,
      type: InputTypes.TEXTFIELD,
      fieldId: 'apiTokenRef',
      value: 'pagerduty_api_secret'
    })

    // click submit and verify submitted data
    fireEvent.click(container.querySelector('button[type="submit"]')!)
    await waitFor(() =>
      expect(onNextMock).toHaveBeenCalledWith({
        apiTokenRef: 'pagerduty_api_secret',
        delegateSelectors: [],
        description: '',
        accountId: 'dummyAccountId',
        identifier: 'PagerDutyConnector101',
        name: 'PagerDutyConnector101',
        orgIdentifier: 'dummyOrgId',
        projectIdentifier: 'dummyProjectId',
        loading: false,
        spec: {
          apiTokenRef: 'pagerduty_api_secret',
          delegateSelectors: []
        },
        tags: {},
        type: 'PagerDuty'
      })
    )
  })

  test('Ensure edit flow works', async () => {
    const { container } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreatePagerDutyConnector
          accountId="dummyAccountId"
          orgIdentifier="dummyOrgId"
          projectIdentifier="dummyProjectId"
          onClose={noop}
          onSuccess={noop}
          isEditMode={false}
          setIsEditMode={noop}
          connectorInfo={
            {
              name: 'PagerDutyConnector101',
              identifier: 'PagerDutyConnector101',
              description: '',
              accountId: 'dummyAccountId',
              orgIdentifier: 'dummyOrgId',
              projectIdentifier: 'dummyProjectId',
              tags: {},
              type: 'PagerDuty',
              loading: false,
              spec: {
                apiTokenRef: 'pagerduty_api_secret',
                delegateSelectors: []
              }
            } as unknown as ConnectorInfoDTO
          }
        />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('input[name="apiTokenRef"]')).not.toBeNull())

    // update it with new value
    await setFieldValue({
      container,
      type: InputTypes.TEXTFIELD,
      fieldId: 'apiTokenRef',
      value: 'pagerduty_api_secret'
    })

    // click submit and verify submitted data
    fireEvent.click(container.querySelector('button[type="submit"]')!)
    await waitFor(() =>
      expect(onNextMock).toHaveBeenCalledWith({
        apiTokenRef: 'pagerduty_api_secret',
        delegateSelectors: [],
        description: '',
        accountId: 'dummyAccountId',
        identifier: 'PagerDutyConnector101',
        name: 'PagerDutyConnector101',
        orgIdentifier: 'dummyOrgId',
        projectIdentifier: 'dummyProjectId',
        loading: false,
        spec: {
          apiTokenRef: 'pagerduty_api_secret',
          delegateSelectors: []
        },
        tags: {},
        type: 'PagerDuty'
      })
    )
  })
})
