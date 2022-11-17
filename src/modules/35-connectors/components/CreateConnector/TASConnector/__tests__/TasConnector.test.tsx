/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { fireEvent, render, within, waitFor } from '@testing-library/react'
import React from 'react'
import { act } from 'react-dom/test-utils'
import { TestWrapper } from '@common/utils/testUtils'
import { ConnectivityModeType } from '@common/components/ConnectivityMode/ConnectivityMode'
import TASConnector from '../TASConnector'
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

describe('<TASConnector />', () => {
  afterEach(() => {
    createConnector.mockReset()
  })
  test('TAS Overview Step', async () => {
    const { getByText, container } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <TASConnector {...commonProps} isEditMode={false} connectorInfo={connectorInfoMock} mock={mockResponse} />
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

  test('Step navigation from Overview to Credential', async () => {
    const { getByText, container } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <TASConnector {...commonProps} isEditMode={false} connectorInfo={connectorInfoMock} mock={mockResponse} />
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
    const stepWizardDetailsSection = container.querySelector('.StepWizard--stepDetails')! as HTMLElement
    expect(within(stepWizardDetailsSection).queryByText('credentials')).toBeInTheDocument()

    await act(async () => {
      fireEvent.click(getByText('back')!)
    })
    expect(container.querySelector('input[name="name"]')).toBeInTheDocument()
  })

  test('TAS Connector Credential Step', async () => {
    const { getByText, container } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <TASConnector {...commonProps} isEditMode={false} connectorInfo={connectorInfoMock} mock={mockResponse} />
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

    expect(getByText('pipelineSteps.endpointLabel')).toBeInTheDocument()
    expect(getByText('authentication')).toBeInTheDocument()
    expect(getByText('username')).toBeInTheDocument()
    expect(getByText('password')).toBeInTheDocument()

    // Change Endpoint URL
    await act(async () => {
      fireEvent.change(container.querySelector('input[name="endpointUrl"]')!, {
        target: { value: 'http://sample_url_tas.com/' }
      })
    })

    // Change username
    await act(async () => {
      fireEvent.change(container.querySelector('input[name="usernametextField"]')!, {
        target: { value: 'AdminUser' }
      })
    })

    // Change token
    act(() => {
      fireEvent.click(getByText('createOrSelectSecret'))
    })

    await waitFor(() => getByText('common.entityReferenceTitle'))

    act(() => {
      fireEvent.click(getByText('TasToken')!)
    })

    act(() => {
      fireEvent.click(getByText('entityReference.apply')!)
    })
    expect(getByText('secrets.secret.configureSecret')).toBeInTheDocument()
    expect(getByText('<TasToken>')).toBeInTheDocument()
  })

  test('TAS Connector Connectivity Mode Step', async () => {
    const { getByText, container } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <TASConnector {...commonProps} isEditMode={false} connectorInfo={connectorInfoMock} mock={mockResponse} />
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

    // Change Endpoint URL
    await act(async () => {
      fireEvent.change(container.querySelector('input[name="endpointUrl"]')!, {
        target: { value: 'http://sample_url_tas.com/' }
      })
    })

    // Change username
    await act(async () => {
      fireEvent.change(container.querySelector('input[name="usernametextField"]')!, {
        target: { value: 'AdminUser' }
      })
    })

    // Change token
    act(() => {
      fireEvent.click(getByText('createOrSelectSecret'))
    })

    await waitFor(() => getByText('common.entityReferenceTitle'))

    act(() => {
      fireEvent.click(getByText('TasToken')!)
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
          name: 'Test TAS Connector',
          identifier: 'Test_TAS_Connector',
          description: '',
          orgIdentifier: 'default',
          projectIdentifier: 'defaultproject',
          type: 'Tas',
          tags: {},
          spec: {
            credential: {
              type: 'ManualConfig',
              spec: {
                endpointUrl: 'http://sample_url_tas.com/',
                passwordRef: 'account.TasToken',
                username: 'AdminUser'
              }
            },
            executeOnDelegate: false
          }
        }
      },
      {
        queryParams: {}
      }
    )
  })

  test('TAS Connector Delegate setup', async () => {
    const { getByText, container } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <TASConnector
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
        target: { value: 'Test TAS Connector' }
      })
    })

    await act(async () => {
      fireEvent.click(getByText('continue')!)
    })

    // Change Endpoint URL
    await act(async () => {
      fireEvent.change(container.querySelector('input[name="endpointUrl"]')!, {
        target: { value: 'http://sample_url_tas.com/' }
      })
    })

    // Change username
    await act(async () => {
      fireEvent.change(container.querySelector('input[name="usernametextField"]')!, {
        target: { value: 'AdminUser' }
      })
    })

    // Change token
    act(() => {
      fireEvent.click(getByText('createOrSelectSecret'))
    })

    await waitFor(() => getByText('common.entityReferenceTitle'))

    act(() => {
      fireEvent.click(getByText('TasToken')!)
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
          name: 'Test TAS Connector',
          identifier: 'Test_TAS_Connector',
          description: '',
          orgIdentifier: 'default',
          projectIdentifier: 'defaultproject',
          type: 'Tas',
          tags: {},
          spec: {
            credential: {
              type: 'ManualConfig',
              spec: {
                endpointUrl: 'http://sample_url_tas.com/',
                passwordRef: 'account.TasToken',
                username: 'AdminUser'
              }
            },
            executeOnDelegate: true,
            delegateSelectors: []
          }
        }
      },
      {
        queryParams: {}
      }
    )
  })

  test('TAS Connector edit mode', async () => {
    const { getAllByText, getByText, container } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <TASConnector {...commonProps} isEditMode connectorInfo={connectorInfoMock} />
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
    expect(getAllByText('<TasToken>').length).toBe(1)
  })
})
