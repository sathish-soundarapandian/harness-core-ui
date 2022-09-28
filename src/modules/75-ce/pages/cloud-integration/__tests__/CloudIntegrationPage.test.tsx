/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, getByText, waitFor, getAllByText } from '@testing-library/react'
import { Provider } from 'urql'
import { fromValue, never } from 'wonka'
import type { DocumentNode } from 'graphql'
import { findDialogContainer, findPopoverContainer, TestWrapper } from '@common/utils/testUtils'
import { FetchCcmMetaDataDocument } from 'services/ce/services'
import { useGetConnectorListV2 } from 'services/cd-ng'

import CloudIntegrationPage from '../CloudIntegrationPage'

import {
  ccmMetadataResponse,
  ccmK8sListResponse,
  ccmK8sMetaResponse,
  listV2Response,
  testConnectionResponse,
  noConnectorsRes
} from './mocks'

const params = {
  accountId: 'TEST_ACC'
}

jest.mock('services/cd-ng', () => ({
  useGetCCMK8SConnectorList: jest.fn().mockImplementation(() => ({
    loading: false,
    mutate: async () => ccmK8sListResponse
  })),
  useGetConnectorListV2: jest.fn().mockImplementation(() => ({
    loading: false,
    mutate: async () => listV2Response
  })),
  useGetTestConnectionResult: jest.fn().mockImplementation(() => ({
    loading: false,
    mutate: async () => testConnectionResponse
  })),
  useCreateConnector: jest.fn().mockImplementation(() => ({
    mutate: async () => ({ status: 'SUCCESS' }),
    loading: false
  })),
  useUpdateConnector: jest.fn().mockImplementation(() => ({
    mutate: async () => ({ status: 'SUCCESS' }),
    loading: false
  })),
  useDeleteConnector: jest.fn().mockImplementation(() => ({
    mutate: async () => ({ status: 'SUCCESS' }),
    loading: false
  }))
}))

jest.mock('services/ce', () => ({
  useCCMK8SMetadata: jest.fn().mockImplementation(() => ({
    loading: false,
    mutate: async () => ccmK8sMetaResponse
  }))
}))

jest.mock('@common/hooks', () => ({
  ...(jest.requireActual('@common/hooks') as any),
  useMutateAsGet: jest.fn().mockImplementation(() => {
    return { data: '', loading: false }
  })
}))

const responseState = {
  executeQuery: ({ query }: { query: DocumentNode }) => {
    if (query === FetchCcmMetaDataDocument) {
      return fromValue(ccmMetadataResponse)
    }
  }
}

const noConnectorsResponseState = {
  executeQuery: ({ query }: { query: DocumentNode }) => {
    if (query === FetchCcmMetaDataDocument) {
      return fromValue(noConnectorsRes)
    }
  }
}

const loadingState = {
  executeQuery: () => never
}

describe('Test Cases for Cloud Integration Page', () => {
  test('Should be able to render the page', async () => {
    const { container } = render(
      <TestWrapper pathParams={params}>
        <Provider value={responseState as any}>
          <CloudIntegrationPage />
        </Provider>
      </TestWrapper>
    )

    await waitFor(() => {
      expect(getByText(container, 'ce.cloudIntegration.sideNavText')).toBeDefined()
      expect(getByText(container, 'connector1')).toBeDefined()
    })
  })

  test('Should be able to render the page / No Connectors', async () => {
    const { container } = render(
      <TestWrapper pathParams={params}>
        <Provider value={noConnectorsResponseState as any}>
          <CloudIntegrationPage />
        </Provider>
      </TestWrapper>
    )

    expect(getByText(container, 'ce.cloudIntegration.emptyStateDesc')).toBeDefined()
  })

  test('Should be able to render the page / Loading', async () => {
    const { container } = render(
      <TestWrapper pathParams={params}>
        <Provider value={loadingState as any}>
          <CloudIntegrationPage />
        </Provider>
      </TestWrapper>
    )

    expect(container.querySelector('[data-icon="steps-spinner"]')).toBeDefined()
  })
})

describe('Test Cases for K8sClustersTab', () => {
  test('Should be able to open Delete Connector Modal', async () => {
    const { container } = render(
      <TestWrapper pathParams={params}>
        <Provider value={responseState as any}>
          <CloudIntegrationPage />
        </Provider>
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelectorAll(`[data-icon="Options"]`)[0]).toBeDefined())
    fireEvent.click(container.querySelectorAll(`[data-icon="Options"]`)[0])

    const menu = findPopoverContainer() as HTMLElement
    fireEvent.click(getByText(menu, 'ce.cloudIntegration.deleteConnector'))

    const dialog = findDialogContainer() as HTMLElement
    expect(getByText(dialog, 'ce.cloudIntegration.deleteConnectorDialog.header')).toBeDefined()
    fireEvent.click(getByText(dialog, 'delete'))
  })

  test('Should be able to open Enable Reporting', async () => {
    const { container } = render(
      <TestWrapper pathParams={params}>
        <Provider value={responseState as any}>
          <CloudIntegrationPage />
        </Provider>
      </TestWrapper>
    )

    await waitFor(() => expect(getAllByText(container, 'ce.cloudIntegration.enableCloudCosts')[0]).toBeDefined())
    fireEvent.click(getAllByText(container, 'ce.cloudIntegration.enableCloudCosts')[0])

    const reportingDialog = findDialogContainer() as HTMLElement
    await waitFor(() => {
      expect(getAllByText(reportingDialog, 'ce.cloudIntegration.costVisibilityDialog.step1.title')).toBeDefined()
    })
    fireEvent.click(getByText(reportingDialog, 'ce.cloudIntegration.enableAutoStopping'))
    window.open = jest.fn()
    fireEvent.click(getByText(reportingDialog, 'continue'))
    await waitFor(() => {
      fireEvent.click(getByText(reportingDialog, 'finish'))
    })
  })

  test('Should be able to open Enable AutoStopping', async () => {
    const { container } = render(
      <TestWrapper pathParams={params}>
        <Provider value={responseState as any}>
          <CloudIntegrationPage />
        </Provider>
      </TestWrapper>
    )

    await waitFor(() => expect(getAllByText(container, 'common.ce.autostopping')[0]).toBeDefined())
    fireEvent.click(getAllByText(container, 'common.ce.autostopping')[0])

    const autoStoppingDialog = findDialogContainer() as HTMLElement

    // Create Secret Step
    await waitFor(() => {
      expect(getByText(autoStoppingDialog, 'secrets.createSecret')).toBeDefined()
    })
    window.open = jest.fn()
    fireEvent.click(getByText(autoStoppingDialog, 'ce.cloudIntegration.autoStoppingModal.createSecret.createKey'))
    expect(window.open).toHaveBeenCalledTimes(1)

    fireEvent.click(getByText(autoStoppingDialog, 'continue'))

    // Install Components Step
    expect(
      getAllByText(autoStoppingDialog, 'ce.cloudIntegration.autoStoppingModal.installComponents.title')[1]
    ).toBeDefined()
    fireEvent.click(
      getByText(autoStoppingDialog, 'ce.cloudIntegration.autoStoppingModal.installComponents.previewYaml')
    )
    fireEvent.click(getByText(autoStoppingDialog, 'finish'))
  })
})

describe('Test Cases for Cloud Accounts Tab', () => {
  test('Should be able to render Cloud Accounts Tab', async () => {
    const { container } = render(
      <TestWrapper pathParams={params}>
        <Provider value={responseState as any}>
          <CloudIntegrationPage />
        </Provider>
      </TestWrapper>
    )

    fireEvent.click(getByText(container, 'ce.cloudIntegration.cloudAccounts'))
    await waitFor(() => expect(getByText(container, 'azureConnector')).toBeDefined())
  })

  test('Should be able to render Cloud Accounts Tab / Loading', async () => {
    ;(useGetConnectorListV2 as jest.Mock).mockImplementation(() => ({
      loading: true,
      mutate: async () => []
    }))

    const { container } = render(
      <TestWrapper pathParams={params}>
        <Provider value={responseState as any}>
          <CloudIntegrationPage />
        </Provider>
      </TestWrapper>
    )

    fireEvent.click(getByText(container, 'ce.cloudIntegration.cloudAccounts'))

    await waitFor(() => {
      expect(container.querySelector('[data-icon="steps-spinner"]')).toBeDefined()
    })
  })

  test('Should be able to render Cloud Accounts Tab / No search results', async () => {
    ;(useGetConnectorListV2 as jest.Mock).mockImplementation(() => ({
      loading: false,
      mutate: async () => []
    }))

    const { container } = render(
      <TestWrapper pathParams={params}>
        <Provider value={responseState as any}>
          <CloudIntegrationPage />
        </Provider>
      </TestWrapper>
    )

    fireEvent.click(getByText(container, 'ce.cloudIntegration.cloudAccounts'))

    const searchBox = container.querySelector('.bp3-input')
    fireEvent.change(searchBox!, { target: { value: 'undefinedConnector' } })

    await waitFor(() => expect(getByText(container, 'ce.cloudIntegration.noSearchResults')).toBeDefined())
  })
})
