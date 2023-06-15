/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { TestWrapper } from '@common/utils/testUtils'
import ServiceNowConnector from '../ServiceNowConnector'
import { mockServiceNowResponse, mockServiceNowSecret, serviceNowBackButtonMock } from './serviceNowMock'
import { backButtonTest } from '../../commonTest'

const createServiceNowConnector = jest.fn()
const updateServiceNowConnector = jest.fn()
jest.mock('services/portal', () => ({
  useGetDelegateFromId: jest.fn().mockImplementation(() => jest.fn())
}))
jest.mock('services/cd-ng', () => ({
  validateTheIdentifierIsUniquePromise: jest.fn().mockImplementation(() => Promise.resolve(mockServiceNowResponse)),
  useCreateConnector: jest.fn().mockImplementation(() => ({ mutate: createServiceNowConnector })),
  useUpdateConnector: jest.fn().mockImplementation(() => ({ mutate: updateServiceNowConnector })),
  getSecretV2Promise: jest.fn().mockImplementation(() => Promise.resolve(mockServiceNowSecret)),
  useGetTestConnectionResult: jest.fn().mockImplementation(() => jest.fn())
}))

describe('Create ServiceNow Connector  Wizard', () => {
  test('Should render form', async () => {
    const { container } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <ServiceNowConnector
          mock={mockServiceNowResponse}
          isEditMode={false}
          onClose={jest.fn()}
          orgIdentifier="testOrg"
          projectIdentifier="test"
          accountId="testAcc"
        />
      </TestWrapper>
    )

    // fill step 1
    await act(async () => {
      fireEvent.change(container.querySelector('input[name="name"]')!, {
        target: { value: 'dummy name' }
      })
    })
    // match step 1
    expect(container).toMatchSnapshot()

    await act(async () => {
      fireEvent.click(container.querySelector('button[type="submit"]')!)
    })

    // match step 2
    expect(container).toMatchSnapshot()
  })

  backButtonTest({
    Element: (
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <ServiceNowConnector
          isEditMode={true}
          connectorInfo={serviceNowBackButtonMock}
          mock={mockServiceNowResponse}
          onClose={jest.fn()}
          orgIdentifier="testOrg"
          projectIdentifier="test"
          accountId="testAcc"
        />
      </TestWrapper>
    ),
    backButtonSelector: '[data-name="serviceNowBackButton"]',
    mock: serviceNowBackButtonMock
  })
})
