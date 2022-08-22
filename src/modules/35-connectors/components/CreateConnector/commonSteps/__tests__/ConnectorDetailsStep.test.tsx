/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, queryByAttribute } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import routes from '@common/RouteDefinitions'
import { accountPathProps, orgPathProps, projectPathProps } from '@common/utils/routeUtils'
import { clickSubmit } from '@common/utils/JestFormHelper'
import { TestWrapper } from '@common/utils/testUtils'
import { gitConfigs, sourceCodeManagers, branchStatusMock } from '@connectors/mocks/mock'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import ConnectorDetailsStep from '../ConnectorDetailsStep'

jest.mock('services/cd-ng', () => ({
  validateTheIdentifierIsUniquePromise: jest
    .fn()
    .mockImplementation(() => Promise.resolve({ status: 'SUCCESS', data: true })),
  useGetListOfBranchesWithStatus: jest.fn().mockImplementation(() => {
    return { data: branchStatusMock, refetch: jest.fn(), loading: false }
  }),
  useListGitSync: jest.fn().mockImplementation(() => {
    return { data: gitConfigs, refetch: jest.fn() }
  }),
  useGetSourceCodeManagers: jest.fn().mockImplementation(() => {
    return { data: sourceCodeManagers, refetch: jest.fn() }
  })
}))

describe('Connector details step', () => {
  test('Test for  create  connector step one required feilds', async () => {
    const { container } = render(
      <TestWrapper>
        <ConnectorDetailsStep name="sample-name" type="K8sCluster" />
      </TestWrapper>
    )
    // fill step 1
    await act(async () => {
      clickSubmit(container)
    })

    expect(container).toMatchSnapshot() // Form validation for all required fields in step one
  })

  test('Test for going to next step', async () => {
    const { container } = render(
      <TestWrapper>
        <ConnectorDetailsStep name="sample-name" type="K8sCluster" />
      </TestWrapper>
    )

    // fill step 1
    const nameInput = queryByAttribute('name', container, 'name')
    expect(nameInput).toBeTruthy()
    if (nameInput) fireEvent.change(nameInput, { target: { value: 'dummy name' } })

    await act(async () => {
      clickSubmit(container)
    })
    //step 2
    expect(container).toMatchSnapshot()
  })
  test('with previous step data', async () => {
    const { container, queryByDisplayValue } = render(
      <TestWrapper>
        <ConnectorDetailsStep
          name="sample-name"
          type="K8sCluster"
          prevStepData={{ name: 'dummy name', type: 'K8sCluster', identifier: 'dummyid', spec: {} }}
        />
      </TestWrapper>
    )
    // fill step 1
    const nameInput = queryByAttribute('name', container, 'name')
    expect(nameInput).toBeTruthy()
    expect(queryByDisplayValue('dummy name')).toBeTruthy()
  })
  test('should not render git context form for account level connector', async () => {
    const { queryByTestId } = render(
      <TestWrapper
        path={routes.toConnectors({ ...accountPathProps })}
        pathParams={{
          accountId: 'testAccount'
        }}
        defaultAppStoreValues={{ isGitSyncEnabled: true }}
      >
        <ConnectorDetailsStep name="sample-name" type="K8sCluster" />
      </TestWrapper>
    )
    const gitContextForm = queryByTestId('GitContextForm')
    expect(gitContextForm).toBeFalsy()
  })

  test('should not render git context form for org level connector', async () => {
    const { queryByTestId } = render(
      <TestWrapper
        path={routes.toConnectors({ ...orgPathProps })}
        pathParams={{
          accountId: 'testAccount',
          orgIdentifier: 'testOrg'
        }}
        defaultAppStoreValues={{ isGitSyncEnabled: true }}
      >
        <ConnectorDetailsStep name="sample-name" type="K8sCluster" />
      </TestWrapper>
    )
    const gitContextForm = queryByTestId('GitContextForm')
    expect(gitContextForm).toBeFalsy()
  })

  test('should render git context form for a project level connector if gitsync is enabled', async () => {
    const { queryByTestId } = render(
      <TestWrapper
        path={routes.toConnectors({ ...projectPathProps })}
        pathParams={{
          accountId: 'testAccount',
          orgIdentifier: 'testOrg',
          projectIdentifier: 'testProject',
          module: 'testModule'
        }}
        defaultAppStoreValues={{ isGitSyncEnabled: true, featureFlags: { USE_OLD_GIT_SYNC: true } }}
      >
        <ConnectorDetailsStep name="sample-name" type="K8sCluster" />
      </TestWrapper>
    )
    const gitContextForm = queryByTestId('GitContextForm')
    expect(gitContextForm).toBeTruthy()
  })

  test('should not render git context form at project level if connector info is passed and it sets orgIdentifier or projectIdentifier to false value', async () => {
    const connectorInfo = {
      orgIdentifier: undefined,
      projectIdentifier: undefined
    } as ConnectorInfoDTO

    const { queryByTestId } = render(
      <TestWrapper
        path={routes.toConnectors({ ...projectPathProps })}
        pathParams={{
          accountId: 'testAccount',
          orgIdentifier: 'testOrg',
          projectIdentifier: 'testProject',
          module: 'testModule'
        }}
        defaultAppStoreValues={{ isGitSyncEnabled: true }}
      >
        <ConnectorDetailsStep name="sample-name" type="K8sCluster" connectorInfo={connectorInfo} />
      </TestWrapper>
    )
    const gitContextForm = queryByTestId('GitContextForm')
    expect(gitContextForm).toBeFalsy()
  })
})
