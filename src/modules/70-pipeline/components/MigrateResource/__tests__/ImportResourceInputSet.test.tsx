/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { mockRepos, mockBranches, gitConnectorMock } from '@gitsync/components/GitSyncForm/__tests__/mockdata'
import { ResourceType } from '@common/interfaces/GitSyncInterface'
import routes from '@common/RouteDefinitions'
import { accountPathProps, pipelineModuleParams, pipelinePathProps } from '@common/utils/routeUtils'
import { TestWrapper } from '@common/utils/testUtils'
import ImportResource from '../ImportResource'

jest.mock('services/pipeline-ng', () => ({
  importInputSetPromise: jest.fn().mockImplementation(() => Promise.resolve({ status: 'SUCCESS' }))
}))

const getGitConnector = jest.fn(() => Promise.resolve(gitConnectorMock))
const fetchRepos = jest.fn(() => Promise.resolve(mockRepos))
const fetchBranches = jest.fn(() => Promise.resolve(mockBranches))

jest.mock('services/cd-ng', () => ({
  getConnectorListV2Promise: jest.fn(() => Promise.resolve(gitConnectorMock)),
  useGetConnector: jest.fn().mockImplementation(() => {
    return { data: gitConnectorMock.data.content[0], refetch: getGitConnector, loading: false }
  }),
  useGetListOfReposByRefConnector: jest.fn().mockImplementation(() => {
    return { data: mockRepos, refetch: fetchRepos, loading: false }
  }),
  useGetListOfBranchesByRefConnectorV2: jest.fn().mockImplementation(() => {
    return { data: mockBranches, refetch: fetchBranches }
  })
}))

const TEST_PIPELINES_PATH = routes.toInputSetList({
  ...accountPathProps,
  ...pipelineModuleParams,
  ...pipelinePathProps
})

const TEST_PATH_PARAMS = {
  accountId: 'testAcc',
  orgIdentifier: 'testOrg',
  projectIdentifier: 'test',
  module: 'cd',
  pipelineIdentifier: 'testPipeline'
}

const TEST_QUERY_PARAMS = {
  connectorRef: 'ValidGithubRepo',
  repoName: 'repo1',
  branch: 'main',
  storeType: 'REMOTE'
}

const onSuccess = jest.fn()
const onFailure = jest.fn()
const onCancelClick = jest.fn()

const initialValues = {
  identifier: 'Github_InputSet',
  name: 'Github InputSet',
  description: 'importing input set',
  connectorRef: 'ValidGithubRepo',
  repoName: 'repo1',
  branch: 'main',
  filePath: '.harness/Github_InputSet.yaml'
}

describe('ImportResource - Input Set', () => {
  beforeEach(() => {
    onSuccess.mockReset()
    onFailure.mockReset()
    onCancelClick.mockReset()
  })

  test('snapshot testing', () => {
    const { container, getByText } = render(
      <TestWrapper path={TEST_PIPELINES_PATH} pathParams={TEST_PATH_PARAMS} queryParams={TEST_QUERY_PARAMS}>
        <ImportResource resourceType={ResourceType.INPUT_SETS} />
      </TestWrapper>
    )
    expect(getByText('name')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  test('provide required values and click on import button', async () => {
    const { container, getByText } = render(
      <TestWrapper path={TEST_PIPELINES_PATH} pathParams={TEST_PATH_PARAMS}>
        <ImportResource
          resourceType={ResourceType.INPUT_SETS}
          onCancelClick={onCancelClick}
          onSuccess={onSuccess}
          initialValues={initialValues}
          extraQueryParams={{ pipelineIdentifier: 'testPipeline' }}
        />
      </TestWrapper>
    )

    const importButton = getByText('common.import')
    expect(container).toMatchSnapshot()
    act(() => {
      userEvent.click(importButton)
    })
    await waitFor(() => expect(getByText('pipeline.importSuccessMessage')).toBeDefined())
    await waitFor(() => expect(onSuccess).toHaveBeenCalled())
    expect(onSuccess).toHaveBeenCalledTimes(1)
  })

  test('when pipelineIdentifier is not passed in extraQueryParams prop - provide required values and click on import button', async () => {
    const { getByText } = render(
      <TestWrapper path={TEST_PIPELINES_PATH} pathParams={TEST_PATH_PARAMS}>
        <ImportResource
          resourceType={ResourceType.INPUT_SETS}
          onCancelClick={onCancelClick}
          onSuccess={onSuccess}
          initialValues={initialValues}
          extraQueryParams={{}}
        />
      </TestWrapper>
    )

    const importButton = getByText('common.import')
    act(() => {
      userEvent.click(importButton)
    })
    await waitFor(() => expect(getByText('pipeline.importSuccessMessage')).toBeDefined())
    await waitFor(() => expect(onSuccess).toHaveBeenCalled())
    expect(onSuccess).toHaveBeenCalledTimes(1)
  })
})
