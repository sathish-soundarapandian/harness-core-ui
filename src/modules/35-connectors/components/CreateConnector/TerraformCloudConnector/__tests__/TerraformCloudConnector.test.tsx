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
import TerraformCloudConnector from '../TerraformCloudConnector'
import { commonProps, connectorInfoMock, mockResponse, mockSecret, mockSecretList } from './mock'

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

describe('<TerraformCloudConnector />', () => {
  afterEach(() => {
    createConnector.mockReset()
  })

  test('TerraformCloud Connector Wizard Steps Flow', async () => {
    const { getByText, container } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <TerraformCloudConnector
          {...commonProps}
          isEditMode={false}
          connectorInfo={connectorInfoMock}
          mock={mockResponse}
        />
      </TestWrapper>
    )

    fireEvent.change(container.querySelector('input[name="name"]')!, {
      target: { value: 'Test TerraformCloud Connector' }
    })

    await act(async () => {
      fireEvent.click(getByText('continue')!)
    })

    expect(getByText('small-tick')).toBeInTheDocument()
    // Validate next active step to be highlighted
    expect(container.querySelector('.StepWizard--activeStep p')?.textContent).toBe('credentials')
    const stepWizardDetailsSection = container.querySelector('.StepWizard--stepDetails')! as HTMLElement
    expect(within(stepWizardDetailsSection).queryByText('credentials')).toBeInTheDocument()

    // move to identifier step
    fireEvent.click(getByText('back')!)
    expect(container.querySelector('input[name="name"]')).toBeInTheDocument()
    // move to authentication step
    await act(async () => {
      fireEvent.click(getByText('continue')!)
    })

    // Change Terraform Cloud URL
    fireEvent.change(container.querySelector('input[name="terraformCloudUrl"]')!, {
      target: { value: 'http://sample_url_terraformcloud.com/' }
    })

    // Change token
    fireEvent.click(getByText('createOrSelectSecret'))

    await waitFor(() => getByText('common.entityReferenceTitle'))

    fireEvent.click(getByText('TerraformToken')!)

    fireEvent.click(getByText('entityReference.apply')!)
    expect(getByText('secrets.secret.configureSecret')).toBeInTheDocument()
    expect(getByText('<TerraformToken>')).toBeInTheDocument()

    await act(async () => {
      fireEvent.click(getByText('continue')!)
    })

    fireEvent.click(getByText('common.connectThroughPlatformInfo')!)

    await act(async () => {
      fireEvent.click(getByText('saveAndContinue')!)
    })

    expect(createConnector).toBeCalledWith(
      {
        connector: {
          name: 'Test TerraformCloud Connector',
          identifier: 'Test_TerraformCloud_Connector',
          description: '',
          orgIdentifier: 'default',
          projectIdentifier: 'defaultproject',
          type: 'TerraformCloud',
          tags: {},
          spec: {
            terraformCloudUrl: 'http://sample_url_terraformcloud.com/',
            credential: {
              type: 'ApiToken',
              spec: {
                apiToken: 'account.TerraformToken'
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

  test('TerraformCloud Connector in edit mode and delegate selection flow ', async () => {
    const { getAllByText, getByText, container } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <TerraformCloudConnector
          {...commonProps}
          isEditMode
          connectorInfo={connectorInfoMock}
          mock={mockResponse}
          connectivityMode={ConnectivityModeType.Delegate}
        />
      </TestWrapper>
    )

    fireEvent.change(container.querySelector('input[name="name"]')!, {
      target: { value: 'Test TerraformCloud Connector' }
    })
    await act(async () => {
      fireEvent.click(getByText('continue')!)
    })
    expect(getAllByText('<TerraformToken>').length).toBe(1)

    await act(async () => {
      fireEvent.click(getByText('continue')!)
    })
    fireEvent.click(getByText('common.connectThroughDelegateInfo')!)

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

    expect(updateConnector).toBeCalledWith(
      {
        connector: {
          name: 'Test TerraformCloud Connector',
          identifier: 'TerraformConnector',
          description: 'test description',
          orgIdentifier: 'default',
          projectIdentifier: 'defaultproject',
          type: 'TerraformCloud',
          tags: { tag1: '', tag2: '', tag3: '' },
          spec: {
            terraformCloudUrl: 'http://sample_url_terraform.com/',
            credential: {
              type: 'ApiToken',
              spec: {
                apiToken: 'TerraformToken'
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
})
