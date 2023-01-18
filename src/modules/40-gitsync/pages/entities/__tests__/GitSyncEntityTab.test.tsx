/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, act, fireEvent } from '@testing-library/react'
import { GitSyncTestWrapper } from '@common/utils/gitSyncTestUtils'
import GitSyncEntityTab from '../GitSyncEntityTab'
import mockData from './mockData/entitiesMockResponse.json'
import connectorEntities from './mockData/connectorEntities.json'
import mockRepo from './mockData/mockRepo.json'
import EntitiesPreview from '../EntitiesPreview'

const defaultBranch = 'master' // Thsese value are from mock gitSync data in GitSyncTestWrapper
const mockBranchResponse = {
  defaultBranch: { branchName: defaultBranch, branchSyncStatus: 'SYNCED' },
  branches: { content: [{ branchName: defaultBranch, branchSyncStatus: 'SYNCED' }] }
}
const fetchEntitiesSumary = jest.fn().mockImplementation(() => Promise.resolve(mockData))
const fetchConnectorTypeEntities = jest.fn().mockImplementation(() => Promise.resolve(connectorEntities))
const getListOfBranchesWithStatus = jest.fn().mockImplementation(() => Promise.resolve(mockBranchResponse))

jest.mock('services/cd-ng', () => ({
  useListGitSyncEntitiesSummaryForRepoAndBranch: jest.fn().mockImplementation(() => ({ mutate: fetchEntitiesSumary })),
  useGetListOfBranchesWithStatus: jest.fn().mockImplementation(() => ({
    data: mockBranchResponse,
    loading: false,
    refetch: getListOfBranchesWithStatus
  })),
  useListGitSyncEntitiesByType: jest.fn().mockImplementation(() => ({ mutate: fetchConnectorTypeEntities }))
}))

describe('Git Sync - entity tab', () => {
  test('rendering landing view', async () => {
    const { getByText, container } = render(
      <GitSyncTestWrapper
        path="/account/:accountId/ci/orgs/:orgIdentifier/projects/:projectIdentifier/admin/git-sync/entities"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'default', projectIdentifier: 'dummyProject' }}
      >
        <GitSyncEntityTab />
      </GitSyncTestWrapper>
    )

    await waitFor(() => {
      expect(getByText(mockRepo.name)).toBeTruthy()
    })

    expect(container).toMatchSnapshot()
  })

  test('rendering summary view of a gitSyncRepo ', async () => {
    const { getByText, container } = render(
      <GitSyncTestWrapper
        path="/account/:accountId/ci/orgs/:orgIdentifier/projects/:projectIdentifier/admin/git-sync/entities"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'default', projectIdentifier: 'dummyProject' }}
      >
        <EntitiesPreview repo={mockRepo as any} branch={defaultBranch} />
      </GitSyncTestWrapper>
    )

    await waitFor(() => {
      expect(getByText('ConnectorOne')).toBeTruthy()
    })

    expect(container).toMatchSnapshot()

    //testing expanded view and pagination for connector entity Type as it has more mock data than preview limit
    expect(getByText('common.seeMore')).toBeTruthy()

    await act(async () => {
      fireEvent.click(getByText('common.seeMore'))
    })
    expect(getByText('common.seeLess')).toBeTruthy()
    expect(container).toMatchSnapshot()
  })
})
