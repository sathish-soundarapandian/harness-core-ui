/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, getByText as getElementByText, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@harness/uicore'
import { ResourceType } from '@common/interfaces/GitSyncInterface'
import routes from '@common/RouteDefinitions'
import { accountPathProps, orgPathProps, pipelineModuleParams, projectPathProps } from '@common/utils/routeUtils'
import { TestWrapper } from '@common/utils/testUtils'
import { mockBranches, gitConnectorMock, mockRepos } from '@gitsync/components/GitSyncForm/__tests__/mockdata'
import { useStrings } from 'framework/strings'
import useImportResource from '../useImportResource'

jest.mock('services/pipeline-ng', () => ({
  useImportPipeline: jest.fn().mockImplementation(() => Promise.resolve({ status: 'SUCCESS' }))
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
    return { refetch: fetchRepos, data: mockRepos }
  }),
  useGetListOfBranchesByRefConnectorV2: jest.fn().mockImplementation(() => {
    return { data: mockBranches, refetch: fetchBranches }
  })
}))

const TEST_PIPELINES_PATH = routes.toPipelines({
  ...accountPathProps,
  ...orgPathProps,
  ...projectPathProps,
  ...pipelineModuleParams
})

const TEST_PATH_PARAMS = {
  accountId: 'testAcc',
  orgIdentifier: 'testOrg',
  projectIdentifier: 'test',
  module: 'cd'
}

const onSuccess = jest.fn()
const onFailure = jest.fn()

function Component() {
  const { getString } = useStrings()
  const { showImportResourceModal } = useImportResource({
    resourceType: ResourceType.PIPELINES,
    modalTitle: getString('common.importEntityFromGit', { entityType: getString('common.pipeline') }),
    onSuccess,
    onFailure
  })

  return <Button onClick={showImportResourceModal} text="My Button"></Button>
}

function ComponentWithoutTitleProp() {
  const { showImportResourceModal } = useImportResource({
    resourceType: ResourceType.PIPELINES,
    onSuccess,
    onFailure
  })

  return <Button onClick={showImportResourceModal} text="My Button"></Button>
}

describe('useImportEntity tests', () => {
  beforeEach(() => {
    onSuccess.mockReset()
    onFailure.mockReset()
  })

  test('snapshot testing', async () => {
    const { container } = render(
      <TestWrapper path={TEST_PIPELINES_PATH} pathParams={TEST_PATH_PARAMS}>
        <Component />
      </TestWrapper>
    )

    const dummyButton = getElementByText(container, 'My Button')
    fireEvent.click(dummyButton)
    const portalDivs = document.getElementsByClassName('bp3-portal')
    await waitFor(() => expect(portalDivs).toHaveLength(1))
    const importPipelineDiv = portalDivs[0] as HTMLElement
    await waitFor(() => expect(getElementByText(importPipelineDiv, 'common.importEntityFromGit')).toBeInTheDocument())
    expect(importPipelineDiv).toMatchSnapshot()
  })

  test('default modal title should appear when props is not passed', async () => {
    const { container } = render(
      <TestWrapper path={TEST_PIPELINES_PATH} pathParams={TEST_PATH_PARAMS}>
        <ComponentWithoutTitleProp />
      </TestWrapper>
    )

    const dummyButton = getElementByText(container, 'My Button')
    fireEvent.click(dummyButton)
    const portalDivs = document.getElementsByClassName('bp3-portal')
    await waitFor(() => expect(portalDivs).toHaveLength(1))
    const importPipelineDiv = portalDivs[0] as HTMLElement
    await waitFor(() => expect(getElementByText(importPipelineDiv, 'common.importFromGit')).toBeInTheDocument())
  })

  test('clicking on cancel button should call closeModal function', async () => {
    const { container, getByText } = render(
      <TestWrapper path={TEST_PIPELINES_PATH} pathParams={TEST_PATH_PARAMS}>
        <Component />
      </TestWrapper>
    )
    const dummyButton = getElementByText(container, 'My Button')
    fireEvent.click(dummyButton)

    const portalDivs = document.getElementsByClassName('bp3-portal')
    await waitFor(() => expect(portalDivs).toHaveLength(1))
    const importPipelineDiv = portalDivs[0] as HTMLElement
    await waitFor(() => expect(getElementByText(importPipelineDiv, 'common.importEntityFromGit')).toBeInTheDocument())

    const cancelButton = getByText('cancel')
    userEvent.click(cancelButton)
    await waitFor(() => expect(portalDivs).toHaveLength(0))
  })
})
