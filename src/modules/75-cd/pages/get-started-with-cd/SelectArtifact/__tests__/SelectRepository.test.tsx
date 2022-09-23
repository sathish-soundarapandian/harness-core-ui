/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, act, fireEvent } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { SelectRepository } from '../SelectRepository'
import { repos } from '../../DeployProvisioningWizard/__tests__/mocks'
import { getFullRepoName } from '../../DeployProvisioningWizard/Constants'

jest.mock('services/cd-ng', () => ({
  useGetListOfAllReposByRefConnector: jest.fn().mockImplementation(() => {
    return { data: { data: repos, status: 'SUCCESS' }, refetch: jest.fn(), error: null, loading: false }
  })
}))

const pathParams = { accountId: 'accountId', orgIdentifier: 'orgId', projectIdentifier: 'projectId' }

describe('Test SelectRepository component', () => {
  test('Initial render', async () => {
    const { container, getByText } = render(
      <TestWrapper path={routes.toGetStartedWithCD({ ...pathParams, module: 'cd' })} pathParams={pathParams}>
        <SelectRepository enableNextBtn={jest.fn()} disableNextBtn={jest.fn()} />
      </TestWrapper>
    )
    const testRepoName = getFullRepoName(repos[1])
    const testRepository = getByText(testRepoName)
    expect(testRepository).toBeInTheDocument()
    await act(async () => {
      fireEvent.click(testRepository)
    })
    const repositorySearch = container.querySelector(
      'input[placeholder="common.getStarted.searchRepo"]'
    ) as HTMLInputElement
    expect(repositorySearch).toBeTruthy()
    await act(async () => {
      fireEvent.change(repositorySearch!, { target: { value: testRepoName } })
    })
    expect(getByText(testRepoName)).toBeInTheDocument()
  })
})
