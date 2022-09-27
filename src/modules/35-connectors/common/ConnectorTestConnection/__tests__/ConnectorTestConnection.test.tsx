/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import ConnectorTestConnection from '../ConnectorTestConnection'
import delegateNameresponse from './mockData/delegate-name-response-error.json'
import testConnectionSuccess from './mockData/test-connection-success.json'
import { K8WithInheritFromDelegate, ManualK8s, Docker, Nexus, Artifactory, GCP, AWS } from './mockData/connectorsMock'

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

describe('Verification step for out of cluster delegate', () => {
  test('render ConnectorTestConnection for K8s in edit screen', async () => {
    const { container, findByText } = render(
      <MemoryRouter>
        <TestWrapper>
          <ConnectorTestConnection
            type="K8sCluster"
            name="sample-name"
            connectorInfo={ManualK8s as ConnectorInfoDTO}
            isStep={false}
          />
        </TestWrapper>
      </MemoryRouter>
    )

    await waitFor(() => expect(findByText('connectors.testConnectionStep.placeholderErrors')).not.toBeNull())

    expect(container).toMatchSnapshot()
  }),
    test('render ConnectorTestConnection for K8s and last step', () => {
      const { container } = render(
        <MemoryRouter>
          <TestWrapper>
            <ConnectorTestConnection
              type="K8sCluster"
              name="sample-name"
              connectorInfo={K8WithInheritFromDelegate as ConnectorInfoDTO}
              isStep={true}
            />
          </TestWrapper>
        </MemoryRouter>
      )

      expect(container).toMatchSnapshot()
    }),
    test('render ConnectorTestConnection for Docker', () => {
      const { container } = render(
        <MemoryRouter>
          <TestWrapper>
            <ConnectorTestConnection
              type="DockerRegistry"
              name="sample-name"
              connectorInfo={Docker as ConnectorInfoDTO}
              isStep={true}
            />
          </TestWrapper>
        </MemoryRouter>
      )

      expect(container).toMatchSnapshot()
    }),
    test('render ConnectorTestConnection for Nexus', () => {
      const { container } = render(
        <MemoryRouter>
          <TestWrapper>
            <ConnectorTestConnection
              type="Nexus"
              name="sample-name"
              connectorInfo={Nexus as ConnectorInfoDTO}
              isStep={true}
            />
          </TestWrapper>
        </MemoryRouter>
      )

      expect(container).toMatchSnapshot()
    }),
    // eslint-disable-next-line jest/no-disabled-tests
    test.skip('render ConnectorTestConnection for GCP', () => {
      const { container } = render(
        <MemoryRouter>
          <TestWrapper>
            <ConnectorTestConnection
              type="Gcp"
              name="sample-name"
              connectorInfo={GCP as ConnectorInfoDTO}
              isStep={true}
            />
          </TestWrapper>
        </MemoryRouter>
      )

      expect(container).toMatchSnapshot()
    }),
    // eslint-disable-next-line jest/no-disabled-tests
    test.skip('render ConnectorTestConnection for AWS', () => {
      const { container } = render(
        <MemoryRouter>
          <TestWrapper>
            <ConnectorTestConnection
              type="Aws"
              name="sample-name"
              connectorInfo={AWS as ConnectorInfoDTO}
              isStep={true}
            />
          </TestWrapper>
        </MemoryRouter>
      )

      expect(container).toMatchSnapshot()
    }),
    // eslint-disable-next-line jest/no-disabled-tests
    test.skip('render ConnectorTestConnection for Artifactory', () => {
      const { container } = render(
        <MemoryRouter>
          <TestWrapper>
            <ConnectorTestConnection
              type="Artifactory"
              name="sample-name"
              connectorInfo={Artifactory as ConnectorInfoDTO}
              isStep={true}
            />
          </TestWrapper>
        </MemoryRouter>
      )

      expect(container).toMatchSnapshot()
    })
})
