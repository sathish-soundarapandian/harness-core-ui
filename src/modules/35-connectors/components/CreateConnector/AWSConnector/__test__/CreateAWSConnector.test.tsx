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
import { mockResponse, mockSecret, mockConnector, awsWithDelegate, hostedMockConnector } from './mock'
import CreateAWSConnector from '../CreateAWSConnector'
import { backButtonTest } from '../../commonTest'

const testPath = routes.toConnectors({ accountId: ':accountId' })
const testPathParams = { accountId: 'dummy' }

const commonProps = {
  accountId: 'dummy',
  orgIdentifier: '',
  projectIdentifier: '',
  setIsEditMode: noop,
  onClose: noop,
  onSuccess: noop
}

const createConnector = jest.fn()
const updateConnector = jest.fn()
const getDelegateSelectors = jest.fn()

jest.mock('services/cd-ng', () => ({
  validateTheIdentifierIsUniquePromise: jest.fn().mockImplementation(() => Promise.resolve(mockResponse)),
  useCreateConnector: jest.fn().mockImplementation(() => ({ mutate: createConnector })),
  useUpdateConnector: jest.fn().mockImplementation(() => ({ mutate: updateConnector })),
  getSecretV2Promise: jest.fn().mockImplementation(() => Promise.resolve(mockSecret)),
  useGetFileContent: jest.fn().mockImplementation(() => ({ refetch: jest.fn() })),
  useGetFileByBranch: jest.fn().mockImplementation(() => ({ refetch: jest.fn() })),
  useCreatePR: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useCreatePRV2: jest.fn().mockImplementation(() => ({ mutate: jest.fn() }))
}))

jest.mock('services/portal', () => ({
  useGetDelegateSelectorsUpTheHierarchy: jest.fn().mockImplementation(() => ({ mutate: getDelegateSelectors })),
  useGetDelegatesUpTheHierarchy: jest.fn().mockImplementation(() => ({ mutate: jest.fn() }))
}))

describe('Create AWS connector Wizard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should render form', async () => {
    const { container } = render(
      <TestWrapper path={testPath} pathParams={testPathParams}>
        <CreateAWSConnector {...commonProps} isEditMode={false} connectorInfo={undefined} />
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
  test('Should render form for edit', async () => {
    const { container } = render(
      <TestWrapper path={testPath} pathParams={testPathParams}>
        <CreateAWSConnector
          {...commonProps}
          isEditMode={true}
          connectorInfo={mockConnector.data.connector as any}
          mock={mockResponse}
          connectivityMode={ConnectivityModeType.Delegate}
        />
      </TestWrapper>
    )
    // editing connector name
    const updatedName = 'dummy name'
    await act(async () => {
      fireEvent.change(container.querySelector('input[name="name"]')!, {
        target: { value: 'dummy name' }
      })
    })
    expect(container).toMatchSnapshot()
    await act(async () => {
      fireEvent.click(container.querySelector('button[type="submit"]')!)
    })
    // step 2
    expect(queryByText(container, 'AWS Access Key')).toBeDefined()
    expect(container).toMatchSnapshot()

    //connectivity mode step
    await act(async () => {
      fireEvent.click(container.querySelector('button[type="submit"]')!)
    })

    // delegate selector step
    await act(async () => {
      fireEvent.click(container.querySelector('button[type="submit"]')!)
    })
    const delegateSelector = container.querySelector('[data-name="DelegateSelectors"]')
    expect(delegateSelector).toBeTruthy()

    // test connection
    await act(async () => {
      fireEvent.click(container.querySelector('button[type="submit"]')!)
    })

    expect(updateConnector).toBeCalledTimes(1)

    expect(updateConnector).toBeCalledWith(
      {
        connector: {
          ...mockConnector.data.connector,
          name: updatedName
        }
      },
      { queryParams: {} }
    )
  })

  test('Should render form for edit for hosted', async () => {
    const { container } = render(
      <TestWrapper path={testPath} pathParams={testPathParams}>
        <CreateAWSConnector
          {...commonProps}
          isEditMode={true}
          connectorInfo={hostedMockConnector.data.connector as any}
          mock={mockResponse}
          connectivityMode={ConnectivityModeType.Manager}
        />
      </TestWrapper>
    )
    // editing connector name
    const updatedName = 'dummy name'
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
    expect(queryByText(container, 'AWS Access Key')).toBeDefined()
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
          ...hostedMockConnector.data.connector,
          name: updatedName
        }
      },
      { queryParams: {} }
    )
  })

  backButtonTest({
    Element: (
      <TestWrapper path={testPath} pathParams={testPathParams}>
        <CreateAWSConnector
          {...commonProps}
          isEditMode={true}
          connectorInfo={mockConnector.data.connector as any}
          mock={mockResponse}
        />
      </TestWrapper>
    ),
    backButtonSelector: '[data-name="awsBackButton"]',
    mock: mockConnector.data.connector as any
  })

  test('Should edit a connector with delegates', async () => {
    const { container } = render(
      <TestWrapper path={testPath} pathParams={testPathParams}>
        <CreateAWSConnector
          {...commonProps}
          isEditMode={true}
          connectorInfo={awsWithDelegate.data.connector as any}
          mock={mockResponse}
          connectivityMode={ConnectivityModeType.Delegate}
        />
      </TestWrapper>
    )
    // editing connector name
    const updatedName = 'connector with delegate'
    await act(async () => {
      fireEvent.change(container.querySelector('input[name="name"]')!, {
        target: { value: updatedName }
      })
    })
    expect(container).toMatchSnapshot()
    await act(async () => {
      fireEvent.click(container.querySelector('button[type="submit"]')!)
    })

    //connectivity mode step
    await act(async () => {
      fireEvent.click(container.querySelector('button[type="submit"]')!)
    })

    // delegate selector step
    await act(async () => {
      fireEvent.click(container.querySelector('button[type="submit"]')!)
    })
    const tagElm = queryByText(container, 'dummyDelegateSelector')
    expect(tagElm).toBeTruthy()

    // test connection
    await act(async () => {
      fireEvent.click(container.querySelector('button[type="submit"]')!)
    })

    expect(updateConnector).toBeCalledTimes(1)

    expect(updateConnector).toBeCalledWith(
      {
        connector: {
          ...awsWithDelegate.data.connector,
          name: updatedName
        }
      },
      { queryParams: {} }
    )
  })
})
