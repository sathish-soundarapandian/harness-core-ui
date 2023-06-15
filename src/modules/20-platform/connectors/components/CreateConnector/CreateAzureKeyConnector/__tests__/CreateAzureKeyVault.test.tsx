/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo } from 'react'
import { noop } from 'lodash-es'
import { render, fireEvent, findByText, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react-dom/test-utils'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import { clickSubmit, fillAtForm, InputTypes } from '@common/utils/JestFormHelper'
import routes from '@common/RouteDefinitions'
import { accountPathProps } from '@common/utils/routeUtils'
import type { ResponseBoolean } from 'services/cd-ng'
import CreateAzureKeyVaultConnector from '../CreateAzureKeyVaultConnector'
import mockSecretList from './secretsListMockData.json'
import connectorMockData from './connectorsListMockData.json'
import connectorDetailsMockData from './connectorDetailsMockData.json'
import azureConnectorMockData from './azureConnectorMockData.json'
const showDangerLocal = jest.fn()
const vaultData = {
  status: 'SUCCESS',
  data: {
    encryptionType: 'AZURE_VAULT',
    spec: {
      vaultNames: [
        'test-kv-0mtjtv4a',
        'platform-azure',
        'QAAutomationKeyVault',
        'testingticket19914',
        'cdp-test-vault',
        'Harness-Test2-Spin-Vault',
        'DeploymentSPCredentials'
      ]
    }
  },
  metaData: null,
  correlationId: 'sdfdsf-6f59-44b3-8d02-d6df6d778962'
}
jest.mock('@harness/uicore', () => ({
  ...jest.requireActual('@harness/uicore'),
  ModalErrorHandler: jest.fn(({ bind }) => {
    const handler = useMemo(
      () =>
        ({
          show: jest.fn(),
          showSuccess: jest.fn(),
          showWarning: jest.fn(),
          showDanger: showDangerLocal,
          hide: jest.fn()
        } as any),
      []
    )

    useEffect(() => {
      bind(handler)
    }, [bind, handler])

    return <></>
  })
}))
const commonProps = {
  accountId: 'dummy',
  orgIdentifier: '',
  projectIdentifier: '',
  setIsEditMode: noop,
  onClose: noop,
  onSuccess: noop
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

let vaultError: any = null
let updateConnectorCalled = false
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
    mutate: () => {
      updateConnectorCalled = true
      return Promise.resolve(mockResponse)
    },
    loading: false
  })),
  validateTheIdentifierIsUniquePromise: jest.fn(() => Promise.resolve(mockResponse)),
  useCreateConnector: jest.fn().mockImplementation(() => ({
    mutate: () => Promise.resolve(mockResponse),
    loading: false
  })),
  useGetTestConnectionResult: jest.fn().mockImplementation(() => jest.fn()),
  useGetMetadata: jest.fn().mockImplementation(() => ({
    mutate: () => Promise.resolve(vaultData),
    loading: false,
    error: vaultError
  })),
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
  useGetFileByBranch: jest.fn().mockImplementation(() => ({ refetch: jest.fn() })),
  useCreatePR: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useCreatePRV2: jest.fn().mockImplementation(() => ({ mutate: jest.fn() }))
}))

describe('Create Secret Manager Wizard', () => {
  test('should be able to render first step form', async () => {
    const { container, getByText, getAllByText, findAllByText } = render(
      <TestWrapper path={routes.toConnectors({ ...accountPathProps })} pathParams={{ accountId: 'dummy' }}>
        <CreateAzureKeyVaultConnector {...commonProps} isEditMode={false} connectorInfo={undefined} />
      </TestWrapper>
    )

    // Step 1
    fillAtForm([
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'name',
        value: 'dummy name'
      }
    ])

    expect(container).toMatchSnapshot()

    await act(async () => {
      clickSubmit(container)
    })

    // Step 2
    const delegateOutClusterCard = container.querySelector('input[value="ManualConfig"]')
    const delegateInClusterCard = container.querySelector('input[value="InheritFromDelegate"]')
    expect(delegateOutClusterCard!).toBeInTheDocument()
    expect(delegateInClusterCard!).toBeInTheDocument()
    act(() => {
      fireEvent.click(delegateOutClusterCard!)
    })
    expect(delegateInClusterCard!).not.toBeInTheDocument()

    const clientIds = await findAllByText('common.clientId')
    expect(clientIds[0]).toBeTruthy()

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
        fieldId: 'subscription',
        value: 'dummy subscription'
      }
    ])

    await act(async () => {
      fireEvent.click(getByText('createOrSelectSecret'))
    })

    const modal = findDialogContainer()
    const secret = await findByText(modal!, 'mockSecret')
    await act(async () => {
      fireEvent.click(secret)
    })
    const applyBtn = await waitFor(() => findByText(modal!, 'entityReference.apply'))
    await act(async () => {
      fireEvent.click(applyBtn)
    })

    expect(container).toMatchSnapshot()

    await act(async () => {
      clickSubmit(container)
    })

    // Step 3
    expect(getAllByText('delegate.DelegateselectionLabel')[1]).toBeTruthy()

    await act(async () => {
      clickSubmit(container)
    })

    // Step 4
    expect(getAllByText('connectors.azureKeyVault.labels.setupVault')[1]).toBeTruthy()
    expect(container).toMatchSnapshot()
  })

  test('should be able to render delegate_in_cluster and go to next step', async () => {
    const { container, getByText, getAllByText } = render(
      <TestWrapper path={routes.toConnectors({ ...accountPathProps })} pathParams={{ accountId: 'dummy' }}>
        <CreateAzureKeyVaultConnector {...commonProps} isEditMode={false} connectorInfo={undefined} />
      </TestWrapper>
    )

    // Step 1
    fillAtForm([
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'name',
        value: 'dummy name'
      }
    ])

    expect(container).toMatchSnapshot()

    await act(async () => {
      clickSubmit(container)
    })

    // Step 2
    const delegateOutClusterCard = container.querySelector('input[value="ManualConfig"]')
    const delegateInClusterCard = container.querySelector('input[value="InheritFromDelegate"]')
    expect(delegateOutClusterCard!).toBeInTheDocument()
    expect(delegateInClusterCard!).toBeInTheDocument()
    act(() => {
      fireEvent.click(delegateInClusterCard!)
    })
    expect(delegateOutClusterCard!).not.toBeInTheDocument()

    const authenticationDropdown = container.querySelector('input[name="managedIdentity"]')
    await userEvent.click(authenticationDropdown!)

    const userAssignedManagedIdentity = getByText('connectors.azure.managedIdentities.userAssigned')
    await userEvent.click(userAssignedManagedIdentity!)

    fillAtForm([
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'subscription',
        value: 'dummy subscription'
      },
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'clientId',
        value: 'dummy clientId'
      }
    ])

    await userEvent.click(authenticationDropdown!)
    const systemAssignedManagedIdentity = getByText('connectors.azure.managedIdentities.systemAssigned')
    await userEvent.click(systemAssignedManagedIdentity!)

    await act(async () => {
      clickSubmit(container)
    })

    // Step 3
    expect(getAllByText('delegate.DelegateselectionLabel')[1]).toBeTruthy()
    expect(container).toMatchSnapshot()
  })

  test('edit connector', async () => {
    const { container, getAllByText } = render(
      <TestWrapper path={routes.toConnectors({ ...accountPathProps })} pathParams={{ accountId: 'dummy' }}>
        <CreateAzureKeyVaultConnector
          {...commonProps}
          isEditMode={true}
          connectorInfo={azureConnectorMockData.data.connector as any}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()

    await act(async () => {
      clickSubmit(container)
    })

    // Step 2
    expect(getAllByText('common.clientId')[0]).toBeTruthy()

    expect(container).toMatchSnapshot()

    await act(async () => {
      clickSubmit(container)
    })

    // Step 3
    expect(getAllByText('delegate.DelegateselectionLabel')[1]).toBeTruthy()

    await act(async () => {
      clickSubmit(container)
    })

    // Step 4
    expect(getAllByText('connectors.azureKeyVault.labels.setupVault')[1]).toBeTruthy()
    expect(container).toMatchSnapshot()
    expect(updateConnectorCalled).toEqual(false)
    await act(async () => {
      clickSubmit(container)
    })
    await waitFor(() => expect(updateConnectorCalled).toEqual(true))
    expect(updateConnectorCalled).toEqual(true)
  })

  test('when vault data fetching fails', async () => {
    vaultError = 'error message'
    const { container, getByText, getAllByText, findAllByText } = render(
      <TestWrapper path={routes.toConnectors({ ...accountPathProps })} pathParams={{ accountId: 'dummy' }}>
        <CreateAzureKeyVaultConnector {...commonProps} isEditMode={false} connectorInfo={undefined} />
      </TestWrapper>
    )

    // Step 1
    fillAtForm([
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'name',
        value: 'dummy name'
      }
    ])

    await act(async () => {
      clickSubmit(container)
    })

    // Step 2
    const delegateOutClusterCard = container.querySelector('input[value="ManualConfig"]')
    const delegateInClusterCard = container.querySelector('input[value="InheritFromDelegate"]')
    expect(delegateOutClusterCard!).toBeInTheDocument()
    expect(delegateInClusterCard!).toBeInTheDocument()
    act(() => {
      fireEvent.click(delegateOutClusterCard!)
    })
    expect(delegateInClusterCard!).not.toBeInTheDocument()

    const clientIds = await findAllByText('common.clientId')
    expect(clientIds[0]).toBeTruthy()

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
        fieldId: 'subscription',
        value: 'dummy subscription'
      }
    ])

    await act(async () => {
      fireEvent.click(getByText('createOrSelectSecret'))
    })

    const modal = findDialogContainer()
    const secret = await findByText(modal!, 'mockSecret')
    await act(async () => {
      fireEvent.click(secret)
    })
    const applyBtn = await waitFor(() => findByText(modal!, 'entityReference.apply'))
    await act(async () => {
      fireEvent.click(applyBtn)
    })

    await act(async () => {
      clickSubmit(container)
    })

    // Step 3
    expect(getAllByText('delegate.DelegateselectionLabel')[1]).toBeTruthy()

    await act(async () => {
      clickSubmit(container)
    })

    // Step 4
    expect(getAllByText('connectors.azureKeyVault.labels.setupVault')[1]).toBeTruthy()
    await waitFor(() => expect(showDangerLocal).toBeCalled())
    expect(showDangerLocal).toBeCalled()
  })
})
