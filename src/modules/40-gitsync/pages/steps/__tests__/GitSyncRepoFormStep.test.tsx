/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { GitSyncTestWrapper } from '@common/utils/gitSyncTestUtils'
import routes from '@common/RouteDefinitions'
import { projectPathProps } from '@common/utils/routeUtils'
import { gitConfigs, sourceCodeManagers } from '@connectors/mocks/mock'
import { gitHubMock } from '@gitsync/components/gitSyncRepoForm/__tests__/mockData'
import GitSyncRepoFormStep from '../GitSyncRepoFormStep'

const branches = { data: ['master', 'devBranch'], status: 'SUCCESS' }
const pathParams = { accountId: 'dummy', orgIdentifier: 'default', projectIdentifier: 'dummyProject' }
const createGitSynRepo = jest.fn()
const getGitConnector = jest.fn(() => Promise.resolve(gitHubMock))
const fetchBranches = jest.fn(() => Promise.resolve(branches))

jest.mock('services/cd-ng', () => ({
  usePostGitSync: jest.fn().mockImplementation(() => ({ mutate: createGitSynRepo })),
  useGetConnector: jest.fn().mockImplementation(() => ({ data: gitHubMock, refetch: getGitConnector })),
  useGetTestGitRepoConnectionResult: jest.fn().mockImplementation(() => ({ mutate: jest.fn })),
  useGetListOfBranchesByConnector: jest.fn().mockImplementation(() => ({ data: branches, refetch: fetchBranches })),
  useListGitSync: jest.fn().mockImplementation(() => {
    return { data: gitConfigs, refetch: jest.fn() }
  })
}))

jest.mock('services/cd-ng-rq', () => ({
  useGetSourceCodeManagersQuery: jest.fn().mockImplementation(() => {
    return { data: sourceCodeManagers, refetch: jest.fn() }
  })
}))

describe('Test GitSyncRepoFormStep', () => {
  test('Should not allow saving form if folder name is not specified', async () => {
    const { container, getByText } = render(
      <GitSyncTestWrapper path={routes.toGitSyncReposAdmin(projectPathProps)} pathParams={pathParams}>
        <GitSyncRepoFormStep {...pathParams} isEditMode={false} isNewUser={false} gitSyncRepoInfo={undefined} />
      </GitSyncTestWrapper>
    )
    await waitFor(() => {
      expect(getByText('selectGitProvider')).toBeTruthy()
    })
    expect(container).toMatchSnapshot()
    await act(async () => {
      fireEvent.click(getByText('save'))
    })
    expect(container.querySelector('[class*="bp3-intent-danger"]')).toBeTruthy()
    expect(container).toMatchSnapshot()
  })
  test('Should have continue button on first step for new user', async () => {
    const { getByText } = render(
      <GitSyncTestWrapper path={routes.toGitSyncReposAdmin(projectPathProps)} pathParams={pathParams}>
        <GitSyncRepoFormStep {...pathParams} isEditMode={false} isNewUser gitSyncRepoInfo={undefined} />
      </GitSyncTestWrapper>
    )
    expect(getByText('continue')).toBeTruthy()
  })
})
