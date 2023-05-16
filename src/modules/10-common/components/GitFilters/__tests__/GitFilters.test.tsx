/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { RenderResult} from '@testing-library/react';
import { render, waitFor, queryByAttribute, act, fireEvent, findByText } from '@testing-library/react'
import { GitSyncTestWrapper } from '@common/utils/gitSyncTestUtils'
import * as cdService from 'services/cd-ng'
import type { GitFiltersProps } from '../GitFilters';
import GitFilters from '../GitFilters'
import mockBranches from './branchStatusMock.json'

const filterChangeHandler = jest.fn()
const fetchBranches = jest.fn(() => {
  return Object.create(mockBranches)
})

const pathParams = { accountId: 'dummy', orgIdentifier: 'default', projectIdentifier: 'dummyProject' }

describe('Git filter test for repo and branch selecion', () => {
  const setup = (props?: Partial<GitFiltersProps>): RenderResult =>
    render(
      <GitSyncTestWrapper
        path="/account/:accountId/ci/orgs/:orgIdentifier/projects/:projectIdentifier/admin/resources/connectors"
        pathParams={pathParams}
      >
        <GitFilters defaultValue={{ repo: '', branch: '' }} onChange={filterChangeHandler} {...props} />
      </GitSyncTestWrapper>
    )

  const queryByNameAttribute = (name: string, container: HTMLElement): HTMLElement | null =>
    queryByAttribute('name', container, name)

  beforeEach(() => {
    jest.spyOn(cdService, 'useGetListOfBranchesWithStatus').mockImplementation(
      () =>
        ({
          response: mockBranches,
          refetch: fetchBranches
        } as any)
    )
  })

  afterEach(() => {
    fetchBranches.mockReset()
  })

  test('rendering default filter', async () => {
    const { container } = setup()
    await waitFor(() => {
      const repoName = queryByNameAttribute('repo', container) as HTMLInputElement
      expect(repoName).toBeTruthy()
      expect(repoName.value).toEqual('common.gitSync.allRepositories')
      const branchName = queryByNameAttribute('branch', container) as HTMLInputElement
      expect(branchName).toBeTruthy()
      expect(branchName.value).toEqual('common.gitSync.defaultBranches')
      expect(branchName.disabled).toBeTruthy()
    })
    expect(filterChangeHandler).not.toBeCalled()
    expect(container).toMatchSnapshot()
  })

  test('Test for changing repo and branch', async () => {
    const { container } = setup()

    await waitFor(() => {
      const repoName = queryByNameAttribute('repo', container) as HTMLInputElement
      expect(repoName.value).toEqual('common.gitSync.allRepositories')
    })

    expect(filterChangeHandler).not.toBeCalled()
    //changing repo
    const icons = container.querySelectorAll('[icon="chevron-down"]')
    const repoSelectIcon = icons[0]
    act(() => {
      fireEvent.click(repoSelectIcon!)
    })
    const repo = await findByText(container, 'gitSyncRepoTest')
    await act(async () => {
      fireEvent.click(repo)
    })
    // branch list should be fetched after changing repo
    waitFor(() => expect(fetchBranches).toBeCalledTimes(1))
    const branchName = queryByNameAttribute('branch', container) as HTMLInputElement
    //selecting default branch after repo change
    waitFor(() => expect(branchName.value).toEqual('master'))
    expect(container).toMatchSnapshot()
  })

  test('Starting with selected repo and branch', async () => {
    const { container } = setup({ defaultValue: { repo: 'gitSyncRepoTest', branch: 'gitSync' } })

    await waitFor(() => {
      const repoName = queryByNameAttribute('repo', container) as HTMLInputElement
      const branchName = queryByNameAttribute('branch', container) as HTMLInputElement
      expect(repoName.value).toEqual('gitSyncRepoTest')
      expect(branchName.value).toEqual('gitSync')
    })

    expect(filterChangeHandler).not.toBeCalled()

    // branch list should be fetched for selected repo
    expect(fetchBranches).toBeCalledTimes(1)
  })
})
