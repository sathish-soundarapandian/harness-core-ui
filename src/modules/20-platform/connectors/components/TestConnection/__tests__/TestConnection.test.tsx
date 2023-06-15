/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, act, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { TestWrapper } from '@common/utils/testUtils'
import testConnectionSuccess from '@connectors/common/ConnectorTestConnection/__tests__/mockData/test-connection-success.json'
import delegateNameresponse from '@connectors/common/ConnectorTestConnection/__tests__/mockData/delegate-name-response-error.json'

import {
  ManualK8s,
  K8WithInheritFromDelegate
} from '@connectors/common/ConnectorTestConnection/__tests__/mockData/connectorsMock'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import TestConnection from '../TestConnection'

jest.mock('services/portal', () => ({
  useGetDelegateFromId: jest.fn().mockImplementation(() => {
    return { ...delegateNameresponse, refetch: jest.fn(), error: null, loading: false }
  })
}))

jest.mock('services/cd-ng', () => ({
  useGetTestConnectionResult: jest.fn().mockImplementation(() => {
    return { data: testConnectionSuccess, refetch: jest.fn(), error: null }
  })
}))

describe('Test Connection', () => {
  test('render test connection', () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId" pathParams={{ accountId: 'dummy' }}>
        <MemoryRouter>
          <TestConnection
            connector={ManualK8s as ConnectorInfoDTO}
            testUrl={'kubernetes_mock_url'}
            refetchConnector={jest.fn()}
          />
        </MemoryRouter>
      </TestWrapper>
    )
    expect(getByText('connectors.stepThreeName')).toBeDefined()
    expect(container).toMatchSnapshot()
  })

  test('render test connection verify out of cluster ', async () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId" pathParams={{ accountId: 'dummy' }}>
        <MemoryRouter>
          <TestConnection
            connector={K8WithInheritFromDelegate as ConnectorInfoDTO}
            testUrl={'kubernetes_mock_url'}
            refetchConnector={jest.fn()}
          />
        </MemoryRouter>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
    const testBtn = container.querySelector('[type="button"]')
    expect(testBtn).not.toBeNull()
    expect(getByText('connectors.stepThreeName')).toBeDefined()
    if (testBtn) {
      await act(async () => {
        fireEvent.click(testBtn)
      })
    }

    expect(container).toMatchSnapshot()
  })
})
