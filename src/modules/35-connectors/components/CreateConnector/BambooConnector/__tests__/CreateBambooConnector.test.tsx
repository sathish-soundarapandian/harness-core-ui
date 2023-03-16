/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { noop } from 'lodash-es'
import { act, fireEvent, render, queryByText } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'

import CreateBambooConnector from '../CreateBambooConnector'
import { bambooMock, mockResponse, mockSecret } from './mocks'

const bambooProps = {
  setIsEditMode: noop,
  onClose: noop,
  onSuccess: noop,
  mock: mockResponse,
  isEditMode: false,
  orgIdentifier: 'testOrg',
  projectIdentifier: 'test',
  accountId: 'testAcc',
  connectorInfo: bambooMock,
  previousStep: jest.fn(),
  nextStep: jest.fn()
}

const updateConnector = jest.fn()
const createConnector = jest.fn()

jest.mock('services/portal', () => ({
  useGetDelegateFromId: jest.fn(),
  useGetDelegateSelectorsUpTheHierarchy: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useGetDelegatesUpTheHierarchy: jest.fn().mockImplementation(() => ({ mutate: jest.fn() }))
}))
jest.mock('services/cd-ng', () => ({
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

describe('Create Bamboo connector wizard', () => {
  test('should render form - fill first step and name on the form', async () => {
    const { container } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateBambooConnector {...bambooProps} />
      </TestWrapper>
    )
    await act(async () => {
      fireEvent.change(container.querySelector('input[name="name"]')!, {
        target: { value: 'dummy name' }
      })
    })
    expect(container).toMatchSnapshot()

    fireEvent.click(container.querySelector('button[type="submit"]')!)

    expect(container).toMatchSnapshot()
  })

  test('should render second step on the form', async () => {
    const { container } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateBambooConnector {...bambooProps} isEditMode={true} />
      </TestWrapper>
    )

    const updatedName = 'dummy name'
    // editing connector name
    await act(async () => {
      fireEvent.change(container.querySelector('input[name="name"]')!, {
        target: { value: updatedName }
      })
    })

    await act(async () => {
      fireEvent.click(container.querySelector('button[type="submit"]')!)
    })

    // step 2
    expect(queryByText(container, 'Bamboo URL')).toBeDefined()
    //updating connector
    await act(async () => {
      fireEvent.click(container.querySelector('button[type="submit"]')!)
    })

    await act(async () => {
      fireEvent.click(container.querySelector('button[type="submit"]')!)
    })

    expect(updateConnector).toBeCalledWith(
      {
        connector: {
          ...bambooMock,
          name: updatedName
        }
      },
      { queryParams: {} }
    )
  })

  test('click on back button', async () => {
    const { container } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateBambooConnector {...bambooProps} isEditMode={true} />
      </TestWrapper>
    )

    const updatedName = 'dummy name'
    // editing connector name
    await act(async () => {
      fireEvent.change(container.querySelector('input[name="name"]')!, {
        target: { value: updatedName }
      })
    })
    await act(async () => {
      fireEvent.click(container.querySelector('button[type="submit"]')!)
    })

    // step 2
    expect(queryByText(container, 'Bamboo URL')).toBeDefined()

    const backBtn = container.querySelector('[data-name="bambooBackButton"]')
    await act(async () => {
      fireEvent.click(backBtn!)
    })
    expect(queryByText(container, 'name')).toBeDefined()
  })

  test('when connectorInfo is not present', async () => {
    const { container } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateBambooConnector {...bambooProps} connectorInfo={undefined} isEditMode={true} />
      </TestWrapper>
    )
    await act(async () => {
      fireEvent.change(container.querySelector('input[name="name"]')!, {
        target: { value: 'dummy name' }
      })
    })

    fireEvent.click(container.querySelector('button[type="submit"]')!)

    expect(updateConnector).toBeCalledWith(
      {
        connector: {
          ...bambooMock,
          name: 'dummy name'
        }
      },
      { queryParams: {} }
    )
  })
})
