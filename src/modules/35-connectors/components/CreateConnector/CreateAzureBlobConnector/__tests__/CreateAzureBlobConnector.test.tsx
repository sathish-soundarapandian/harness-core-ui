/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { noop } from 'lodash-es'
import { render, fireEvent, findByText, waitFor } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import { clickSubmit, fillAtForm, InputTypes } from '@common/utils/JestFormHelper'
import routes from '@common/RouteDefinitions'
import { accountPathProps } from '@common/utils/routeUtils'
import type { ConnectorInfoDTO, ResponseBoolean } from 'services/cd-ng'
import CreateAzureBlobConnector from '../CreateAzureBlobConnector'
import mockSecretList from '../../CreateAzureKeyConnector/__tests__/secretsListMockData.json'
import connectorMockData from './connectorsListMockData.json'
import connectorDetailsMockData from '../../CreateAzureKeyConnector/__tests__/connectorDetailsMockData.json'
import { backButtonTest } from '../../commonTest'

const commonProps = {
  accountId: 'dummy',
  orgIdentifier: '',
  projectIdentifier: '',
  setIsEditMode: noop,
  onClose: noop,
  onSuccess: noop
}

const connectorInfo: ConnectorInfoDTO = {
  name: 'devConnector',
  identifier: 'devConnector',
  description: 'devConnector description',
  orgIdentifier: undefined,
  projectIdentifier: undefined,
  tags: {},
  type: 'AzureBlob',
  spec: {
    clientId: 'dummy',
    tenantId: 'dummy',
    secret: 'dummy',
    containerURL: 'dummy'
  }
}

export const mockResponse: ResponseBoolean = {
  status: 'SUCCESS',
  data: true,
  metaData: {},
  correlationId: ''
}

export const mockSecret = {
  status: 'SUCCESS',
  data: {
    secret: {
      type: 'SecretText',
      name: 'mockSecret',
      identifier: 'mockSecret',
      tags: {},
      description: '',
      spec: { secretManagerIdentifier: 'harnessSecretManager' }
    },
    createdAt: 1611917313699,
    updatedAt: 1611917313699,
    draft: false
  },
  metaData: null,
  correlationId: 'abb45801-d524-44ab-824c-aa532c367f39'
}

jest.mock('services/portal', () => ({
  useGetDelegateTags: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useGetDelegateSelectorsUpTheHierarchy: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useGetDelegatesUpTheHierarchy: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useGetDelegateFromId: jest.fn().mockImplementation(() => {
    return { ...mockResponse, refetch: jest.fn(), error: null, loading: false }
  })
}))

jest.mock('services/cd-ng', () => ({
  useUpdateConnector: jest.fn().mockImplementation(() => ({
    mutate: () => Promise.resolve(mockResponse),
    loading: false
  })),
  validateTheIdentifierIsUniquePromise: jest.fn(() => Promise.resolve(mockResponse)),
  useCreateConnector: jest.fn().mockImplementation(() => ({
    mutate: () => Promise.resolve(mockResponse),
    loading: false
  })),
  useGetTestConnectionResult: jest.fn().mockImplementation(() => jest.fn()),
  listSecretsV2Promise: jest.fn().mockImplementation(() => Promise.resolve(mockSecretList)),
  useGetSecretV2: jest.fn().mockImplementation(() => {
    return { data: mockSecretList, refetch: jest.fn() }
  }),
  useGetConnectorList: jest.fn().mockImplementation(() => {
    return { ...connectorMockData, refetch: jest.fn(), error: null, loading: false }
  }),
  useGetConnector: jest.fn().mockImplementation(() => {
    return { data: connectorDetailsMockData, refetch: jest.fn() }
  }),
  usePostSecret: jest.fn().mockImplementation(() => ({ mutate: () => Promise.resolve(mockResponse) })),
  usePostSecretFileV2: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  usePutSecret: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  usePutSecretFileV2: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  getSecretV2Promise: jest.fn().mockImplementation(() => Promise.resolve(mockSecret)),
  useGetFileContent: jest.fn().mockImplementation(() => ({ refetch: jest.fn() })),
  useCreatePR: jest.fn().mockImplementation(() => ({ mutate: jest.fn() }))
}))

describe('Create Secret Manager Wizard', () => {
  test('should be able to render create form', async () => {
    const { container, getByText } = render(
      <TestWrapper path={routes.toConnectors({ ...accountPathProps })} pathParams={{ accountId: 'dummy' }}>
        <CreateAzureBlobConnector {...commonProps} isEditMode={false} connectorInfo={undefined} />
      </TestWrapper>
    )
    waitFor(() => expect(getByText('name')).not.toBeNull())
    // Step 1
    fillAtForm([
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'name',
        value: 'dummy name'
      }
    ])

    act(() => {
      clickSubmit(container)
    })

    // Step 2
    await waitFor(() => getByText('common.clientId'))

    fillAtForm([
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'clientId',
        value: 'dummy clientId'
      },
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'tenantId',
        value: 'dummy tenantId'
      },
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'containerURL',
        value: 'dummy URL'
      }
    ])

    act(() => {
      fireEvent.click(getByText('createOrSelectSecret'))
    })

    const modal = findDialogContainer()
    const secret = await findByText(modal!, 'mockSecret')
    act(() => {
      fireEvent.click(secret)
    })
    const applyBtn = await waitFor(() => findByText(modal!, 'entityReference.apply'))
    act(() => {
      fireEvent.click(applyBtn)
    })
    await waitFor(() => getByText('secrets.secret.configureSecret'))
    expect(container).toMatchSnapshot()

    act(() => {
      clickSubmit(container)
    })

    // Step 3
    await waitFor(() => getByText('delegate.DelegateselectionLabel'))

    act(() => {
      clickSubmit(container)
    })
    //Step 4
    await waitFor(() => getByText('connectors.createdSuccessfully'))
  })

  backButtonTest({
    Element: (
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateAzureBlobConnector
          {...commonProps}
          isEditMode={true}
          connectorInfo={connectorInfo}
          mock={mockResponse}
        />
      </TestWrapper>
    ),
    backButtonSelector: '[data-name="azureBlobBackButton"]',
    mock: connectorInfo
  })

  test('should be able to render edit form', async () => {
    const { container, getByText, getAllByText } = render(
      <TestWrapper path={routes.toConnectors({ ...accountPathProps })} pathParams={{ accountId: 'dummy' }}>
        <CreateAzureBlobConnector {...commonProps} isEditMode={true} connectorInfo={connectorInfo} />
      </TestWrapper>
    )

    // Step 1
    waitFor(() => expect(getByText('name')).not.toBeNull())
    const updatedName = 'new value'
    act(() => {
      fireEvent.change(container.querySelector('input[name="name"]')!, {
        target: { value: updatedName }
      })
    })

    act(() => {
      clickSubmit(container)
    })

    // Step 2
    await waitFor(() => expect(getAllByText('common.clientId')[0]).toBeTruthy())

    act(() => {
      fireEvent.change(container.querySelector('input[name="clientId"]')!, {
        target: { value: updatedName }
      })
    })
    act(() => {
      fireEvent.change(container.querySelector('input[name="tenantId"]')!, {
        target: { value: updatedName }
      })
    })
    act(() => {
      fireEvent.change(container.querySelector('input[name="containerURL"]')!, {
        target: { value: updatedName }
      })
    })

    act(() => {
      fireEvent.click(getByText('createOrSelectSecret'))
    })

    const modal = findDialogContainer()
    const secret = await findByText(modal!, 'mockSecret')
    act(() => {
      fireEvent.click(secret)
    })
    const applyBtn = await waitFor(() => findByText(modal!, 'entityReference.apply'))
    act(() => {
      fireEvent.click(applyBtn)
    })

    await waitFor(() => getByText('secrets.secret.configureSecret'))
    expect(container).toMatchSnapshot()

    act(() => {
      clickSubmit(container)
    })

    // Step 3
    await waitFor(() => getByText('delegate.DelegateselectionLabel'))

    act(() => {
      clickSubmit(container)
    })
    //Step 4
    await waitFor(() => getByText('connectors.createdSuccessfully'))
  })
})
