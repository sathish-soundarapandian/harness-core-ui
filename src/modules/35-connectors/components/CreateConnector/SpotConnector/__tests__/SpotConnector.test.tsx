/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { fireEvent, render, waitFor } from '@testing-library/react'
import React from 'react'
import { act } from 'react-dom/test-utils'
import { TestWrapper } from '@common/utils/testUtils'
import { ConnectivityModeType } from '@common/components/ConnectivityMode/ConnectivityMode'
import SpotConnector from '../SpotConnector'
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

describe('<SpotConnector />', () => {
  afterEach(() => {
    createConnector.mockReset()
  })
  test('new connector creation step 1', async () => {
    const { getByText, container } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <SpotConnector {...commonProps} isEditMode={false} connectorInfo={connectorInfoMock} mock={mockResponse} />
      </TestWrapper>
    )
    expect(getByText('connectors.title.spot')).toBeInTheDocument()
    expect(getByText('credentials')).toBeInTheDocument()
    expect(getByText('connectors.selectConnectivityMode')).toBeInTheDocument()

    // Change name
    await act(async () => {
      fireEvent.change(container.querySelector('input[name="name"]')!, {
        target: { value: 'Dummy Spot' }
      })
    })

    await act(async () => {
      fireEvent.click(getByText('continue')!)
    })

    expect(getByText('small-tick')).toBeInTheDocument()
    expect(container.querySelector('.StepWizard--activeStep p')?.textContent).toBe('credentials')
  })

  test('step navigation', async () => {
    const { getByText, container } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <SpotConnector {...commonProps} isEditMode={false} connectorInfo={connectorInfoMock} mock={mockResponse} />
      </TestWrapper>
    )

    await act(async () => {
      fireEvent.change(container.querySelector('input[name="name"]')!, {
        target: { value: 'Dummy Spot' }
      })
    })

    await act(async () => {
      fireEvent.click(getByText('continue')!)
    })

    expect(getByText('authentication')).toBeInTheDocument()

    await act(async () => {
      fireEvent.click(getByText('back')!)
    })

    expect(container.querySelector('input[name="name"]')).toBeInTheDocument()
  })

  test('new connector creation step 2', async () => {
    const { getByText, container } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <SpotConnector {...commonProps} isEditMode={false} connectorInfo={connectorInfoMock} mock={mockResponse} />
      </TestWrapper>
    )

    await act(async () => {
      fireEvent.change(container.querySelector('input[name="name"]')!, {
        target: { value: 'Dummy Spot' }
      })
    })

    await act(async () => {
      fireEvent.click(getByText('continue')!)
    })

    expect(getByText('authentication')).toBeInTheDocument()
    expect(getByText('connectors.spotAccountId')).toBeInTheDocument()
    expect(getByText('connectors.apiToken')).toBeInTheDocument()

    // Change account id
    await act(async () => {
      fireEvent.change(container.querySelector('input[name="spotAccountIdtextField"]')!, {
        target: { value: 'Dummy Acc Id' }
      })
    })

    // Change token
    act(() => {
      fireEvent.click(getByText('createOrSelectSecret'))
    })

    await waitFor(() => getByText('common.entityReferenceTitle'))

    act(() => {
      fireEvent.click(getByText('SpotSecretToken')!)
    })

    act(() => {
      fireEvent.click(getByText('entityReference.apply')!)
    })
    expect(getByText('secrets.secret.configureSecret')).toBeInTheDocument()
    expect(getByText('<SpotSecretToken>')).toBeInTheDocument()
  })

  test('new connector creation final steps', async () => {
    const { getByText, container } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <SpotConnector {...commonProps} isEditMode={false} connectorInfo={connectorInfoMock} mock={mockResponse} />
      </TestWrapper>
    )

    await act(async () => {
      fireEvent.change(container.querySelector('input[name="name"]')!, {
        target: { value: 'Dummy Spot' }
      })
    })

    await act(async () => {
      fireEvent.click(getByText('continue')!)
    })

    // Change account id
    await act(async () => {
      fireEvent.change(container.querySelector('input[name="spotAccountIdtextField"]')!, {
        target: { value: 'Dummy Acc Id' }
      })
    })

    // Change token
    act(() => {
      fireEvent.click(getByText('createOrSelectSecret'))
    })

    await waitFor(() => getByText('common.entityReferenceTitle'))

    act(() => {
      fireEvent.click(getByText('SpotSecretToken')!)
    })

    act(() => {
      fireEvent.click(getByText('entityReference.apply')!)
    })

    await act(async () => {
      fireEvent.click(getByText('continue')!)
    })

    await act(async () => {
      fireEvent.click(getByText('common.connectThroughPlatformInfo')!)
    })

    await act(async () => {
      fireEvent.click(getByText('saveAndContinue')!)
    })

    expect(createConnector).toBeCalledWith(
      {
        connector: {
          description: '',
          identifier: 'Dummy_Spot',
          name: 'Dummy Spot',
          orgIdentifier: 'default',
          projectIdentifier: 'Depanshu_spot',
          spec: {
            credential: {
              spec: {
                spotAccountId: 'Dummy Acc Id',
                apiTokenRef: 'account.SpotSecretToken'
              },
              type: 'PermanentTokenConfig'
            },
            executeOnDelegate: false
          },
          tags: {},
          type: 'Spot'
        }
      },
      {
        queryParams: {}
      }
    )
  })

  test('edit mode', async () => {
    const { getAllByText, getByText, container } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <SpotConnector {...commonProps} isEditMode connectorInfo={connectorInfoMock} />
      </TestWrapper>
    )

    await act(async () => {
      fireEvent.change(container.querySelector('input[name="name"]')!, {
        target: { value: 'Dummy Spot' }
      })
    })

    await act(async () => {
      fireEvent.click(getByText('continue')!)
    })

    expect(getAllByText('<SpotSecretToken>').length).toBe(2)
  })

  test('delegate setup', async () => {
    const { getByText, container } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <SpotConnector
          {...commonProps}
          isEditMode={false}
          connectorInfo={connectorInfoMock}
          mock={mockResponse}
          connectivityMode={ConnectivityModeType.Delegate}
        />
      </TestWrapper>
    )

    expect(getByText('delegate.DelegateselectionLabel')).toBeInTheDocument()

    await act(async () => {
      fireEvent.change(container.querySelector('input[name="name"]')!, {
        target: { value: 'Dummy Spot' }
      })
    })

    await act(async () => {
      fireEvent.click(getByText('continue')!)
    })

    // Change account id
    await act(async () => {
      fireEvent.change(container.querySelector('input[name="spotAccountIdtextField"]')!, {
        target: { value: 'Dummy Acc Id' }
      })
    })

    // Change token
    act(() => {
      fireEvent.click(getByText('createOrSelectSecret'))
    })

    await waitFor(() => getByText('common.entityReferenceTitle'))

    act(() => {
      fireEvent.click(getByText('SpotSecretToken')!)
    })

    act(() => {
      fireEvent.click(getByText('entityReference.apply')!)
    })

    await act(async () => {
      fireEvent.click(getByText('continue')!)
    })

    await act(async () => {
      fireEvent.click(getByText('common.connectThroughDelegateInfo')!)
    })

    await act(async () => {
      fireEvent.click(getByText('continue')!)
    })

    expect(getByText('connectors.delegate.configure')).toBeInTheDocument()

    await act(async () => {
      fireEvent.click(container.querySelector('input[value="DelegateOptions.DelegateOptionsAny"]')!)
    })

    await act(async () => {
      fireEvent.click(getByText('saveAndContinue')!)
    })

    expect(createConnector).toBeCalledWith(
      {
        connector: {
          description: '',
          identifier: 'Dummy_Spot',
          name: 'Dummy Spot',
          orgIdentifier: 'default',
          projectIdentifier: 'Depanshu_spot',
          spec: {
            credential: {
              spec: {
                spotAccountId: 'Dummy Acc Id',
                apiTokenRef: 'account.SpotSecretToken'
              },
              type: 'PermanentTokenConfig'
            },
            executeOnDelegate: true,
            delegateSelectors: []
          },
          tags: {},
          type: 'Spot'
        }
      },
      {
        queryParams: {}
      }
    )
  })
})
