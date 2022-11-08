/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, getByTestId, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { modulePathProps, pipelinePathProps, projectPathProps } from '@common/utils/routeUtils'

import { useGetExecutionBranchesList } from 'services/pipeline-ng'
import * as pipelineNg from 'services/pipeline-ng'
import BranchFilter from '../BranchFilter'

const mockBranches = {
  status: 'SUCCESS',
  data: {
    branches: [{ name: 'main' }, { name: 'main-demo' }, { name: 'main-patch' }, { name: 'main-patch2' }]
  },
  metaData: null,
  correlationId: 'correlationId'
}

const testpath = routes.toPipelineDeploymentList({
  ...projectPathProps,
  ...pipelinePathProps,
  ...modulePathProps
})

const pathParams = {
  accountId: 'dummy',
  orgIdentifier: 'default',
  projectIdentifier: 'dummyProject',
  module: 'cd',
  pipelineIdentifier: '-1'
}

const fetchBranches = jest.fn(() => Promise.resolve(mockBranches))

jest.mock('services/pipeline-ng', () => ({
  useGetExecutionBranchesList: jest.fn().mockImplementation(() => {
    return { data: mockBranches, refetch: fetchBranches, error: null, loading: false }
  })
}))

describe('BranchFilter test', () => {
  afterEach(() => {
    fetchBranches.mockReset()
    ;(useGetExecutionBranchesList as jest.Mock).mockImplementation(() => {
      return { data: mockBranches, refetch: fetchBranches, error: null, loading: false }
    })
  })

  test('default rendering BranchFilter', async () => {
    const { getByText } = render(
      <TestWrapper path={testpath} pathParams={pathParams}>
        <BranchFilter repoName="repoName" />
      </TestWrapper>
    )

    await waitFor(() => expect(fetchBranches).toBeCalledTimes(1))
    expect(getByText('common.gitSync.allBranches')).toBeInTheDocument()
  })

  test('default rendering BranchFilter - loading true', async () => {
    jest.spyOn(pipelineNg, 'useGetExecutionBranchesList').mockReturnValue({
      loading: true,
      error: null,
      data: null,
      refetch: jest.fn()
    } as any)
    const { container } = render(
      <TestWrapper path={testpath} pathParams={pathParams}>
        <BranchFilter repoName="repoName" disabled={true} />
      </TestWrapper>
    )
    const dropdown = getByTestId(container, 'branch-filter')?.closest('.DropDown--main')
    expect(dropdown).toHaveClass('DropDown--disabled')
  })

  test('Show refetch button if branch list api failed', async () => {
    const refetchCall = jest.fn()
    jest.spyOn(pipelineNg, 'useGetExecutionBranchesList').mockReturnValue({
      loading: false,
      error: {
        data: {
          responseMessages: ['error']
        }
      },
      data: mockBranches,
      refetch: refetchCall
    } as any)

    const { container } = render(
      <TestWrapper path={testpath} pathParams={pathParams}>
        <BranchFilter repoName="repoName" />
      </TestWrapper>
    )

    const icon = container.querySelector('[data-icon="refresh"]')
    expect(icon).toBeInTheDocument()
    expect(refetchCall).toBeCalledTimes(1)
    fireEvent.click(icon as HTMLElement)
    expect(refetchCall).toBeCalledTimes(2)
  })
})
