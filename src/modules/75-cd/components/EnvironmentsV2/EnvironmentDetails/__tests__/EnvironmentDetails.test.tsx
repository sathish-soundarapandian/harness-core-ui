/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { environmentPathProps, modulePathProps, projectPathProps } from '@common/utils/routeUtils'
import EnvironmentDetails from '../EnvironmentDetails'

import mockEnvironmentDetail from './__mocks__/mockEnvironmentDetail.json'

jest.mock('services/cd-ng', () => ({
  useGetEnvironmentV2: jest.fn().mockImplementation(() => {
    return {
      data: mockEnvironmentDetail,
      refetch: jest.fn()
    }
  }),
  useGetYamlSchema: jest.fn().mockImplementation(() => {
    return {
      data: {
        name: 'testenv',
        identifier: 'test-env',
        lastModifiedAt: ''
      },
      refetch: jest.fn()
    }
  }),
  useGetClusterList: jest.fn().mockImplementation(() => {
    return {
      data: {
        data: {
          content: [
            {
              clusterRef: 'test-cluster-a',
              linkedAt: '123'
            },
            {
              clusterRef: 'test-cluster-b',
              linkedAt: '2'
            }
          ]
        }
      },
      refetch: jest.fn()
    }
  }),
  useDeleteCluster: jest.fn().mockResolvedValue({})
}))

describe('EnvironmentDetails tests', () => {
  test('initial render', async () => {
    render(
      <TestWrapper
        path={routes.toEnvironmentDetails({
          ...projectPathProps,
          ...modulePathProps,
          ...environmentPathProps
        })}
        pathParams={{
          accountId: 'dummy',
          projectIdentifier: 'dummy',
          orgIdentifier: 'dummy',
          module: 'cd',
          environmentIdentifier: 'Env_1',
          sectionId: 'CONFIGURATION'
        }}
      >
        <EnvironmentDetails />
      </TestWrapper>
    )

    await waitFor(() => expect(screen.queryByText('cd.gitOpsCluster')).toBeNull())
  })

  test('is gitops tab visible', async () => {
    render(
      <TestWrapper
        path={routes.toEnvironmentDetails({
          ...projectPathProps,
          ...modulePathProps,
          ...environmentPathProps
        })}
        pathParams={{
          accountId: 'dummy',
          projectIdentifier: 'dummy',
          orgIdentifier: 'dummy',
          module: 'cd',
          environmentIdentifier: 'Env_1',
          sectionId: 'CONFIGURATION'
        }}
        defaultFeatureFlagValues={{
          ARGO_PHASE2_MANAGED: true
        }}
      >
        <EnvironmentDetails />
      </TestWrapper>
    )

    await waitFor(() => expect(screen.queryByText('cd.gitOpsCluster')).toBeVisible())

    const gitOpsTab = screen.getByText('cd.gitOpsCluster')
    userEvent.click(gitOpsTab!)

    await waitFor(() => expect(screen.queryByText('test-cluster-a')).toBeVisible())
  })
})
