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
import EnvironmentDetails from '../EnvironmentDetails'

import mockEnvironmentDetail from './__mocks__/mockEnvironmentDetail.json'
import mockEnvironmentDetailMismatchedDTOYaml from './__mocks__/mockEnvironmentDetailMismatchedDTOYaml.json'

jest.spyOn(cdNgServices, 'useGetYamlSchema').mockReturnValue({
  data: {
    name: 'testenv',
    identifier: 'test-env',
    lastModifiedAt: ''
  },
  refetch: jest.fn()
} as any)

jest.spyOn(cdNgServices, 'useGetClusterList').mockReturnValue({
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
} as any)

jest.spyOn(cdNgServices, 'useDeleteCluster').mockReturnValue({} as any)

jest.spyOn(cdNgServices, 'useGetConnectorListV2').mockReturnValue({
  mutate: async () => {
    return {
      status: 'SUCCESS',
      data: {
        pageItemCount: 0,
        content: []
      }
    }
  }
} as any)

jest.spyOn(cdNgServices, 'useGetEnvironmentV2').mockReturnValue({
  data: mockEnvironmentDetail,
  refetch: jest.fn()
} as any)

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

  test('page header toolbar renders info from yaml instead of DTO', async () => {
    jest.spyOn(cdNgServices, 'useGetEnvironmentV2').mockReturnValue({
      data: mockEnvironmentDetailMismatchedDTOYaml,
      refetch: jest.fn()
    } as any)

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

    await waitFor(() => expect(screen.getAllByText('description should come')).toHaveLength(2))
  })
})
