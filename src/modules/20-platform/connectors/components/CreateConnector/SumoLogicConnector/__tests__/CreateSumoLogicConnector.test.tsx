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
import type { UseGetReturn } from 'restful-react'
import { TestWrapper } from '@common/utils/testUtils'
import { fillAtForm, InputTypes, setFieldValue } from '@common/utils/JestFormHelper'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import * as cvService from 'services/cv'
import * as sumoLogicUtils from '../utils'
import { onNextMock } from '../../CommonCVConnector/__mocks__/CommonCVConnectorMocks'

const callBuildSumoLogicPayload = jest.fn()
// tells jest we intent to mock CVConnectorHOC and use mock in __mocks__
jest.mock('../../CommonCVConnector/CVConnectorHOC')
// file that imports mocked component must be placed after jest.mock
import CreateSumoLogicConnector from '../CreateSumoLogicConnector'

const INIT_SUMOLOGIC_VALUE = {
  url: 'endpoint1',
  accessIdRef: undefined,
  accessKeyRef: undefined,
  delegateSelectors: [],
  name: '',
  identifier: '',
  description: '',
  accountId: 'dummyAccountId',
  orgIdentifier: 'dummyOrgId',
  projectIdentifier: 'dummyProjectId',
  tags: {},
  type: 'SumoLogic',
  loading: false
}

jest.mock('@connectors/pages/connectors/utils/ConnectorUtils', () => ({
  buildDatadogPayload: callBuildSumoLogicPayload
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

describe('Create Sumo Logic connector Wizard', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  beforeEach(() => {
    jest
      .spyOn(cvService, 'useGetSumoLogicEndPoints')
      .mockReturnValue({ data: { data: ['endpoint1', 'endpoint2'] }, loading: false } as UseGetReturn<
        any,
        any,
        any,
        any
      >)
  })

  test('Ensure validation works', async () => {
    jest.spyOn(sumoLogicUtils, 'initializeSumoLogicConnectorWithStepData').mockReturnValue(
      new Promise<any>(resolve => {
        resolve(INIT_SUMOLOGIC_VALUE)
      })
    )

    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateSumoLogicConnector
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

    await waitFor(() => expect(getByText('connectors.sumologic.urlLabel')).not.toBeNull())
    // click submit and verify validation string is visible
    fireEvent.click(container.querySelector('button[type="submit"]')!)
    // check error is visible for secrets
    await waitFor(() => expect(getByText('connectors.sumologic.encryptedAccessIdValidation')).not.toBeNull())
    await waitFor(() => expect(getByText('connectors.sumologic.encryptedAccessKeyValidation')).not.toBeNull())
    expect(onNextMock).not.toHaveBeenCalled()
  })

  test('Ensure create flow works', async () => {
    jest.spyOn(sumoLogicUtils, 'initializeSumoLogicConnectorWithStepData').mockReturnValue(
      new Promise<any>(resolve => {
        resolve(INIT_SUMOLOGIC_VALUE)
      })
    )
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateSumoLogicConnector
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
    await waitFor(() => expect(getByText('connectors.sumologic.urlLabel')).not.toBeNull())
    await fillAtForm([
      {
        container,
        type: InputTypes.SELECT,
        fieldId: 'url',
        value: 'endpoint2'
      }
    ])
    // fill out ACCESS KEY Secret
    await setFieldValue({
      container,
      type: InputTypes.TEXTFIELD,
      fieldId: 'accessKeyRef',
      value: 'dsf-auto'
    })
    // fill out ACCESS ID Secret
    await setFieldValue({
      container,
      type: InputTypes.TEXTFIELD,
      fieldId: 'accessIdRef',
      value: 'dsf-new'
    })

    // click submit and verify submitted data
    fireEvent.click(container.querySelector('button[type="submit"]')!)

    await waitFor(() =>
      expect(onNextMock).toHaveBeenCalledWith({
        ...INIT_SUMOLOGIC_VALUE,
        accessKeyRef: 'dsf-auto',
        accessIdRef: 'dsf-new',
        url: 'endpoint2'
      })
    )
    expect(container).toMatchSnapshot()
  })

  test('Ensure if there is existing data, fields are populated', async () => {
    jest.spyOn(sumoLogicUtils, 'initializeSumoLogicConnectorWithStepData').mockReturnValue(
      new Promise<any>(resolve => {
        resolve({
          ...INIT_SUMOLOGIC_VALUE,
          url: 'endpoint2',
          identifier: 'SumoLogicConnector101',
          name: 'SumoLogicConnector101'
        })
      })
    )
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateSumoLogicConnector
          accountId="dummyAccountId"
          orgIdentifier="dummyOrgId"
          projectIdentifier="dummyProjectId"
          onClose={noop}
          onSuccess={noop}
          isEditMode={false}
          setIsEditMode={noop}
          connectorInfo={
            {
              name: 'SumoLogicConnector101',
              identifier: 'SumoLogicConnector101',
              description: '',
              accountId: 'dummyAccountId',
              orgIdentifier: 'default',
              projectIdentifier: 'Test_101',
              tags: {},
              type: 'SumoLogic',
              loading: false,
              spec: {
                url: 'endpoint2',
                accessIdRef: 'sumologic_app_id',
                accessKeyRef: 'sumologic_app_key',
                delegateSelectors: []
              }
            } as unknown as ConnectorInfoDTO
          }
        />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('connectors.sumologic.urlLabel')).not.toBeNull())
    // expect recieved value to be there
    await waitFor(() => expect(container.querySelector(`input[value=endpoint2]`)).not.toBeNull())

    // change old url
    await fillAtForm([
      {
        container,
        type: InputTypes.SELECT,
        fieldId: 'url',
        value: 'endpoint2'
      }
    ])
    await setFieldValue({
      container,
      type: InputTypes.TEXTFIELD,
      fieldId: 'accessKeyRef',
      value: 'sumologic_app_key'
    })
    // fill out APP Secret
    await setFieldValue({
      container,
      type: InputTypes.TEXTFIELD,
      fieldId: 'accessIdRef',
      value: 'sumologic_app_id'
    })

    // click submit and verify submitted data
    fireEvent.click(container.querySelector('button[type="submit"]')!)
    await waitFor(() =>
      expect(onNextMock).toHaveBeenCalledWith({
        accessKeyRef: 'sumologic_app_key',
        accessIdRef: 'sumologic_app_id',
        delegateSelectors: [],
        description: '',
        accountId: 'dummyAccountId',
        identifier: 'SumoLogicConnector101',
        name: 'SumoLogicConnector101',
        orgIdentifier: 'dummyOrgId',
        projectIdentifier: 'dummyProjectId',
        loading: false,
        spec: {
          accessKeyRef: 'sumologic_app_key',
          accessIdRef: 'sumologic_app_id',
          delegateSelectors: [],
          url: 'endpoint2'
        },
        tags: {},
        type: 'SumoLogic',
        url: 'endpoint2'
      })
    )
  })

  test('Ensure edit flow works', async () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateSumoLogicConnector
          accountId="dummyAccountId"
          orgIdentifier="dummyOrgId"
          projectIdentifier="dummyProjectId"
          onClose={noop}
          onSuccess={noop}
          isEditMode={false}
          setIsEditMode={noop}
          connectorInfo={
            {
              name: 'SumoLogicConnector101',
              identifier: 'SumoLogicConnector101',
              description: '',
              orgIdentifier: 'dummyOrgId',
              projectIdentifier: 'dummyProjectId',
              tags: {},
              type: 'SumoLogic',
              loading: false,
              spec: {
                url: 'endpoint1',
                accessIdRef: 'sumologic_app_id',
                accessKeyRef: 'sumologic_app_key',
                delegateSelectors: []
              }
            } as unknown as ConnectorInfoDTO
          }
        />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('connectors.sumologic.urlLabel')).not.toBeNull())

    // expect recieved value to be there
    await waitFor(() => expect(container.querySelector(`input[value="endpoint2"]`)).not.toBeNull())
    // update it with new value
    await setFieldValue({ container, fieldId: 'url', value: 'endpoint2', type: InputTypes.SELECT })
    await fillAtForm([
      {
        container,
        type: InputTypes.SELECT,
        fieldId: 'url',
        value: 'endpoint2'
      }
    ])
    await setFieldValue({
      container,
      type: InputTypes.TEXTFIELD,
      fieldId: 'accessKeyRef',
      value: 'sumologic_app_key'
    })
    // fill out APP Secret
    await setFieldValue({
      container,
      type: InputTypes.TEXTFIELD,
      fieldId: 'accessIdRef',
      value: 'sumologic_app_id'
    })

    // click submit and verify submitted data
    fireEvent.click(container.querySelector('button[type="submit"]')!)
    await waitFor(() =>
      expect(onNextMock).toHaveBeenCalledWith({
        accessKeyRef: 'sumologic_app_key',
        accessIdRef: 'sumologic_app_id',
        delegateSelectors: [],
        description: '',
        accountId: 'dummyAccountId',
        identifier: 'SumoLogicConnector101',
        name: 'SumoLogicConnector101',
        orgIdentifier: 'dummyOrgId',
        projectIdentifier: 'dummyProjectId',
        loading: false,
        spec: {
          accessKeyRef: 'sumologic_app_key',
          accessIdRef: 'sumologic_app_id',
          delegateSelectors: [],
          url: 'endpoint1'
        },
        tags: {},
        type: 'SumoLogic',
        url: 'endpoint2'
      })
    )
  })
})
