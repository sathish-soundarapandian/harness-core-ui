/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { fireEvent, render } from '@testing-library/react'
import React from 'react'
import { act } from 'react-dom/test-utils'
import { TestWrapper } from '@common/utils/testUtils'
import PCFConnector from '../PCFConnector'
import { commonProps, connectorInfoMock, mockResponse, mockSecret, mockSecretList } from './mocks'

const updateConnector = jest.fn()
const createConnector = jest.fn()
jest.mock('services/portal', () => ({
  useGetDelegateTags: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useGetDelegateFromId: jest.fn().mockImplementation(() => jest.fn()),
  useGetDelegateSelectorsUpTheHierarchy: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useGetDelegatesUpTheHierarchy: jest.fn().mockImplementation(() => ({ mutate: jest.fn() }))
}))

jest.mock('services/cd-ng', () => ({
  listSecretsV2Promise: jest.fn().mockImplementation(() => Promise.resolve(mockSecretList)),
  validateTheIdentifierIsUniquePromise: jest.fn().mockImplementation(() => Promise.resolve(mockResponse)),
  useCreateConnector: jest.fn().mockImplementation(() => ({ mutate: createConnector })),
  useUpdateConnector: jest.fn().mockImplementation(() => ({ mutate: updateConnector })),
  getSecretV2Promise: jest.fn().mockImplementation(() => Promise.resolve(mockSecret)),
  useGetTestConnectionResult: jest.fn().mockImplementation(() => jest.fn()),
  useGetFileContent: jest.fn().mockImplementation(() => ({ refetch: jest.fn() })),
  useGetFileByBranch: jest.fn().mockImplementation(() => ({ refetch: jest.fn() })),
  useCreatePR: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useCreatePRV2: jest.fn().mockImplementation(() => ({ mutate: jest.fn() }))
}))

describe('<PCFConnector />', () => {
  afterEach(() => {
    createConnector.mockReset()
  })
  test('new connector creation step 1', async () => {
    const { getByText, container } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <PCFConnector {...commonProps} isEditMode={false} connectorInfo={connectorInfoMock} mock={mockResponse} />
      </TestWrapper>
    )
    expect(getByText('connectors.title.tas')).toBeInTheDocument()
    expect(getByText('credentials')).toBeInTheDocument()
    expect(getByText('connectors.selectConnectivityMode')).toBeInTheDocument()

    // Change connector name
    await act(async () => {
      fireEvent.change(container.querySelector('input[name="name"]')!, {
        target: { value: 'Test TAS Connector' }
      })
    })

    await act(async () => {
      fireEvent.click(getByText('continue')!)
    })

    expect(getByText('small-tick')).toBeInTheDocument()
    // Validate next active step to be highlighted
    expect(container.querySelector('.StepWizard--activeStep p')?.textContent).toBe('credentials')
  })

  test('step navigation', async () => {
    const { getByText, container } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <PCFConnector {...commonProps} isEditMode={false} connectorInfo={connectorInfoMock} mock={mockResponse} />
      </TestWrapper>
    )

    await act(async () => {
      fireEvent.change(container.querySelector('input[name="name"]')!, {
        target: { value: 'Test TAS Connector' }
      })
    })

    await act(async () => {
      fireEvent.click(getByText('continue')!)
    })

    expect(getByText('details')).toBeInTheDocument()

    await act(async () => {
      fireEvent.click(getByText('back')!)
    })

    expect(container.querySelector('input[name="name"]')).toBeInTheDocument()
  })
})
