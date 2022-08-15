/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { noop } from 'lodash-es'
import { render, fireEvent, queryByText } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { TestWrapper } from '@common/utils/testUtils'
import { ConnectivityModeType } from '@common/components/ConnectivityMode/ConnectivityMode'
import routes from '@common/RouteDefinitions'
import CreateDockerConnector from '../CreateDockerConnector'
import { mockResponse, delegateDockerMock, hostedDockerMock, mockSecret, backButtonMock } from './mocks'
import { backButtonTest } from '../../commonTest'

const testPath = routes.toConnectors({ accountId: ':accountId' })
const testPathParams = { accountId: 'dummy' }

const createConnector = jest.fn()
const updateConnector = jest.fn()
jest.mock('services/portal', () => ({
  useGetDelegateFromId: jest.fn().mockImplementation(() => jest.fn()),
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
  useCreatePR: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useCreatePRV2: jest.fn().mockImplementation(() => ({ mutate: jest.fn() }))
}))

describe('Create Docker Connector  Wizard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should render form', async () => {
    const { container } = render(
      <TestWrapper path={testPath} pathParams={testPathParams}>
        <CreateDockerConnector
          setIsEditMode={noop}
          onClose={noop}
          onSuccess={noop}
          mock={mockResponse}
          isEditMode={false}
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

    await act(async () => {
      fireEvent.click(container.querySelector('button[type="submit"]')!)
    })

    // match step 2
    expect(container).toMatchSnapshot()
  })

  test('Should render form for editing provider type when delegate', async () => {
    const { container } = render(
      <TestWrapper path={testPath} pathParams={testPathParams}>
        <CreateDockerConnector
          onClose={noop}
          setIsEditMode={noop}
          onSuccess={noop}
          isEditMode={true}
          connectorInfo={delegateDockerMock}
          mock={mockResponse}
          orgIdentifier="testOrg"
          projectIdentifier="test"
          accountId="testAcc"
          connectivityMode={ConnectivityModeType.Delegate}
        />
      </TestWrapper>
    )
    const updatedName = 'dummy name'
    // editing connector name
    await act(async () => {
      fireEvent.change(container.querySelector('input[name="name"]')!, {
        target: { value: updatedName }
      })
    })
    expect(container).toMatchSnapshot()
    await act(async () => {
      fireEvent.click(container.querySelector('button[type="submit"]')!)
    })
    // step 2
    expect(queryByText(container, 'Docker Registry URL')).toBeDefined()
    expect(container).toMatchSnapshot()

    //connectivity mode step
    await act(async () => {
      fireEvent.click(container.querySelector('button[type="submit"]')!)
    })

    // delegate selector step
    await act(async () => {
      fireEvent.click(container.querySelector('button[type="submit"]')!)
    })

    // test connection
    await act(async () => {
      fireEvent.click(container.querySelector('button[type="submit"]')!)
    })

    expect(updateConnector).toBeCalledTimes(1)
    expect(updateConnector).toBeCalledWith(
      {
        connector: {
          ...delegateDockerMock,
          name: updatedName
        }
      },
      { queryParams: {} }
    )
  })

  test('Should render form for editing provider type when hosted', async () => {
    const { container } = render(
      <TestWrapper path={testPath} pathParams={testPathParams}>
        <CreateDockerConnector
          onClose={noop}
          setIsEditMode={noop}
          onSuccess={noop}
          isEditMode={true}
          connectorInfo={hostedDockerMock}
          mock={mockResponse}
          orgIdentifier="testOrg"
          projectIdentifier="test"
          accountId="testAcc"
          connectivityMode={ConnectivityModeType.Manager}
        />
      </TestWrapper>
    )
    const updatedName = 'dummy name'
    // editing connector name
    await act(async () => {
      fireEvent.change(container.querySelector('input[name="name"]')!, {
        target: { value: updatedName }
      })
    })
    expect(container).toMatchSnapshot()
    await act(async () => {
      fireEvent.click(container.querySelector('button[type="submit"]')!)
    })
    // step 2
    expect(queryByText(container, 'Docker Registry URL')).toBeDefined()
    expect(container).toMatchSnapshot()

    //connectivity mode step
    await act(async () => {
      fireEvent.click(container.querySelector('button[type="submit"]')!)
    })

    // test connection
    await act(async () => {
      fireEvent.click(container.querySelector('button[type="submit"]')!)
    })

    expect(updateConnector).toBeCalledTimes(1)
    expect(updateConnector).toBeCalledWith(
      {
        connector: {
          ...hostedDockerMock,
          name: updatedName
        }
      },
      { queryParams: {} }
    )
  })

  backButtonTest({
    Element: (
      <TestWrapper path={testPath} pathParams={testPathParams}>
        <CreateDockerConnector
          onClose={noop}
          setIsEditMode={noop}
          onSuccess={noop}
          isEditMode={true}
          connectorInfo={backButtonMock}
          mock={mockResponse}
          orgIdentifier="testOrg"
          projectIdentifier="test"
          accountId="testAcc"
        />
      </TestWrapper>
    ),
    backButtonSelector: '[data-name="dockerBackButton"]',
    mock: backButtonMock
  })
})
