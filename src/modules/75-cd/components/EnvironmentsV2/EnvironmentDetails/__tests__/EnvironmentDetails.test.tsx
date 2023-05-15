/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import * as cdNgServices from 'services/cd-ng'

import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { environmentPathProps, modulePathProps, projectPathProps } from '@common/utils/routeUtils'
import * as FeatureFlag from '@common/hooks/useFeatureFlag'
import { sourceCodeManagers } from '@connectors/mocks/mock'
import { connectorsData } from '@connectors/pages/connectors/__tests__/mockData'
import EnvironmentDetails from '../EnvironmentDetails'
import { activeInstanceAPI, envAPI } from '../EnvironmentDetailSummary/__test__/EnvDetailSummary.mock'
import mockEnvironmentDetailMismatchedDTOYaml from './__mocks__/mockEnvironmentDetailMismatchedDTOYaml.json'

const fetchConnectors = (): Promise<unknown> => Promise.resolve(connectorsData)

jest.mock('services/cd-ng', () => ({
  useListGitSync: jest.fn().mockImplementation(() => {
    return { data: null, refetch: jest.fn(), loading: false, error: false }
  }),
  useGetClusterList: jest.fn().mockReturnValue({
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
  } as any),
  useDeleteCluster: jest.fn().mockReturnValue({} as any),
  useGetConnectorListV2: jest.fn().mockImplementation(() => ({ mutate: fetchConnectors })),
  useGetConnector: jest.fn().mockImplementation(() => {
    return { data: connectorsData.data.content[1], refetch: fetchConnectors, loading: false }
  }),
  useGetYamlSchema: jest.fn().mockReturnValue({
    data: {
      name: 'testenv',
      identifier: 'test-env',
      lastModifiedAt: ''
    },
    refetch: jest.fn()
  } as any),
  useGetActiveServiceInstancesForEnvironment: jest.fn().mockImplementation(() => {
    return { data: activeInstanceAPI, refetch: jest.fn(), loading: false, error: false }
  }),
  useGetEnvironmentV2: jest.fn().mockImplementation(() => {
    return {
      data: envAPI,
      refetch: jest.fn(),
      loading: false,
      error: false
    }
  }),
  useGetSettingValue: jest.fn().mockImplementation(() => {
    return { data: { data: { value: 'false' } } }
  })
}))

jest.mock('services/cd-ng-rq', () => ({
  useGetSourceCodeManagersQuery: jest.fn().mockImplementation(() => {
    return { data: sourceCodeManagers, refetch: jest.fn() }
  })
}))

describe('EnvironmentDetails tests', () => {
  test('initial render', async () => {
    jest.spyOn(FeatureFlag, 'useFeatureFlags').mockReturnValue({
      GITOPS_ONPREM_ENABLED: true
    })
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

    await waitFor(() => expect(screen.queryByText('cd.gitOpsCluster')).not.toBeNull())
  })

  test('is gitops tab visible', async () => {
    jest.spyOn(FeatureFlag, 'useFeatureFlags').mockReturnValue({
      GITOPS_ONPREM_ENABLED: true
    })
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

    await waitFor(() => expect(screen.queryByText('cd.gitOpsCluster')).toBeVisible())

    const gitOpsTab = screen.getByText('cd.gitOpsCluster')
    await userEvent.click(gitOpsTab!)

    await waitFor(() => expect(screen.queryByText('test-cluster-a')).toBeVisible())
  })

  test('page header toolbar renders info from yaml instead of DTO', async () => {
    jest.spyOn(cdNgServices, 'useGetEnvironmentV2').mockReturnValue({
      data: mockEnvironmentDetailMismatchedDTOYaml,
      refetch: jest.fn()
    } as any)

    const { getByText } = render(
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
          environmentIdentifier: 'Env_1'
        }}
      >
        <EnvironmentDetails />
      </TestWrapper>
    )

    //Go to Configuration Tab as Now Summary Tab is default (Project Level)
    await userEvent.click(getByText('configuration'))
    await waitFor(() => expect(screen.getAllByText('description should come')).toHaveLength(2))
  })
})
