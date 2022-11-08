/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, getByText, render, waitFor } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'
import { mockResponse } from '@connectors/components/CreateConnector/K8sConnector/__test__/k8Mocks'
import { testConnectionResponse } from '@ce/pages/cloud-integration/__tests__/mocks'
import { useCreateConnector } from 'services/cd-ng'

import Overview from '../steps/Overview'
import DownloadYaml from '../steps/DownloadYaml'
import TestConnection from '../steps/TestConnection'
import { DelegateErrorHandler } from '../steps/DelegateErrorHandler'

const params = {
  accountId: 'TEST_ACC'
}

const testConnectionStepProps = {
  name: 'Test Connection',
  closeModal: jest.fn(),
  prevStepData: { name: 'test-quickcreate', identifier: 'testquickcreate', connectorsCreated: false }
}

jest.mock('services/cd-ng', () => ({
  validateTheIdentifierIsUniquePromise: jest.fn().mockImplementation(() => Promise.resolve(mockResponse)),
  useGetTestConnectionResult: jest.fn().mockImplementation(() => ({
    loading: false,
    mutate: async () => testConnectionResponse
  })),
  useCreateConnector: jest.fn().mockImplementation(() => ({
    mutate: async () => ({ status: 'SUCCESS' }),
    loading: false
  }))
}))

jest.mock('services/portal', () => ({
  validateKubernetesYamlPromise: jest.fn().mockImplementation(() => Promise.resolve({ data: {} })),
  useGenerateKubernetesYaml: jest.fn().mockImplementation(() => ({
    mutate: async () => ''
  })),
  useGetDelegatesHeartbeatDetailsV2: jest.fn().mockImplementation(() => {
    return { data: { resource: { numberOfConnectedDelegates: 2 } }, refetch: jest.fn(), error: null, loading: false }
  })
}))

describe('Test Cases for Quick Create Steos', () => {
  test('Should be able to render Overview step', async () => {
    const nextStepMock = jest.fn()

    const { container } = render(
      <TestWrapper pathParams={params}>
        <Overview name={'Overview'} nextStep={nextStepMock} />
      </TestWrapper>
    )

    const nameInput = container.querySelector('input[name="name"]')!
    fireEvent.change(nameInput, { target: { value: 'test-quickcreate' } })

    fireEvent.click(getByText(container, 'continue'))

    await waitFor(() =>
      expect(nextStepMock).toHaveBeenCalledWith({
        identifier: 'testquickcreate',
        name: 'test-quickcreate',
        yaml: undefined
      })
    )
  })

  test('Should be able to render Download Yaml step', async () => {
    const nextStepMock = jest.fn()

    const { container } = render(
      <TestWrapper pathParams={params}>
        <DownloadYaml
          name={'Download Yaml'}
          nextStep={nextStepMock}
          prevStepData={{ name: 'test-quickcreate', identifier: 'testquickcreate' }}
        />
      </TestWrapper>
    )
    expect(getByText(container, 'ce.k8sQuickCreate.downloadAndApplyYaml')).toBeDefined()
    fireEvent.click(getByText(container, 'ce.cloudIntegration.autoStoppingModal.installComponents.previewYaml'))

    fireEvent.click(getByText(container, 'continue'))
    await waitFor(() => expect(nextStepMock).toHaveBeenCalled())
  })

  test('Should be able to render Test Connection step', async () => {
    const { container } = render(
      <TestWrapper pathParams={params}>
        <TestConnection {...testConnectionStepProps} />
      </TestWrapper>
    )
    expect(getByText(container, 'ce.k8sQuickCreate.createAndTest')).toBeDefined()

    await waitFor(() => expect(getByText(container, 'finish')).toBeEnabled())
    fireEvent.click(getByText(container, 'finish'))

    await waitFor(() => expect(testConnectionStepProps.closeModal).toHaveBeenCalled())
  })

  test('Should be able to render Test Connection step / Connector Error', async () => {
    ;(useCreateConnector as jest.Mock).mockImplementation(() => ({
      data: [],
      refetch: jest.fn(),
      error: { data: { responseMessages: ['error'] } },
      loading: false
    }))

    const { container } = render(
      <TestWrapper pathParams={params}>
        <TestConnection {...testConnectionStepProps} />
      </TestWrapper>
    )

    expect(container.querySelector('div[class*="errorHandler"]')).toBeDefined()
  })

  test('Should be able to render Delegate Error Handler', async () => {
    const { container } = render(
      <TestWrapper pathParams={params}>
        <DelegateErrorHandler />
      </TestWrapper>
    )
    expect(getByText(container, 'ce.k8sQuickCreate.testConnection.delegateError.error')).toBeDefined()
  })
})
