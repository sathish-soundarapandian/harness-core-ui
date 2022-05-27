/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { queryByAttribute, render, waitFor } from '@testing-library/react'
import { noop } from 'lodash-es'
import { TestWrapper } from '@common/utils/testUtils'
import GitRemoteDetails from '../GitRemoteDetails'

const mockBranches = {
  status: 'SUCCESS',
  data: {
    branches: [{ name: 'main' }, { name: 'main-demo' }, { name: 'main-patch' }, { name: 'main-patch2' }],
    defaultBranch: { name: 'main' }
  },
  metaData: null,
  correlationId: 'correlationId'
}

const pathParams = { accountId: 'dummy', orgIdentifier: 'default', projectIdentifier: 'dummyProject' }

const fetchBranches = jest.fn(() => Promise.resolve(mockBranches))
const branchChangehandler = jest.fn(() => noop)

jest.mock('services/cd-ng', () => ({
  useGetListOfBranchesByRefConnectorV2: jest.fn().mockImplementation(() => {
    return { data: mockBranches, refetch: fetchBranches }
  })
}))

describe('GitRemoteDetails test', () => {
  afterEach(() => {
    fetchBranches.mockReset()
  })

  test('default rendering GitRemoteDetails', async () => {
    const { container, getByText } = render(
      <TestWrapper
        path="/account/:accountId/ci/orgs/:orgIdentifier/projects/:projectIdentifier/pipelines/-1/pipeline-studio/"
        pathParams={pathParams}
      >
        <GitRemoteDetails
          connectorRef="connectorId"
          onBranchChange={branchChangehandler}
          repoName={'testRepoName'}
          filePath={'filePath.yaml'}
          branch={'main'}
        />
      </TestWrapper>
    )
    await waitFor(() => expect(fetchBranches).toBeCalledTimes(1))
    expect(getByText('testRepoName')).toBeInTheDocument()
    const branchSelect = queryByAttribute('name', container, 'remoteBranch') as HTMLInputElement
    expect(branchSelect).toBeTruthy()
    expect(branchSelect.value).toEqual('main (default)')
    expect(getByText('testRepoName')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })
})
