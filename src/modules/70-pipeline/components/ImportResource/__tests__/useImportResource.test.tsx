/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  act,
  findByText,
  fireEvent,
  getByText as getElementByText,
  queryByAttribute,
  render,
  waitFor
} from '@testing-library/react'
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
const fetchRepos = jest.fn().mockReturnValue(mockRepos)
const fetchBranches = jest.fn(() => Promise.resolve(mockBranches))

jest.mock('services/cd-ng', () => ({
  getConnectorListV2Promise: jest.fn(() => Promise.resolve(gitConnectorMock)),
  useGetConnector: jest.fn().mockImplementation(() => {
    return { data: gitConnectorMock.data.content[0], refetch: getGitConnector, loading: false }
  }),
  useGetListOfReposByRefConnector: jest.fn().mockImplementation(() => {
    return { refetch: fetchRepos, data: mockRepos, loading: false, error: null }
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

  test('clicking on Import button should close modal and call onSuccess', async () => {
    const { container, getByText, debug } = render(
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
    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', importPipelineDiv, name)
    // Name
    const nameInput = queryByNameAttribute('name') as HTMLInputElement
    expect(nameInput.value).toBe('')
    userEvent.type(nameInput, 'Import Pipeline 1')
    // Connector
    const connnectorRefInput = queryByAttribute('data-testid', importPipelineDiv, /connectorRef/)
    expect(connnectorRefInput).toBeTruthy()
    userEvent.click(connnectorRefInput!)
    await act(async () => {
      const connectorSelectorDialog = document.getElementsByClassName('bp3-dialog')[1] as HTMLElement
      const targetConnector = await findByText(connectorSelectorDialog as HTMLElement, 'ValidGithubRepo')
      expect(targetConnector).toBeTruthy()
      fireEvent.click(targetConnector)
      const applySelected = getElementByText(connectorSelectorDialog, 'entityReference.apply')
      await act(async () => {
        fireEvent.click(applySelected)
      })
    })
    expect(fetchRepos).toBeCalled()
    expect(fetchRepos).toHaveBeenCalledTimes(1)

    const dropdownIcons = importPipelineDiv.querySelectorAll('[data-icon="chevron-down"]')
    expect(dropdownIcons).toHaveLength(3)
    // Repo
    const repoInput = queryByNameAttribute('repo') as HTMLInputElement
    expect(repoInput.value).toBe('')
    const repoDropDownIcon = dropdownIcons[1]
    act(() => {
      fireEvent.click(repoDropDownIcon!)
    })
    expect(fetchRepos).toHaveBeenCalledTimes(1)
    expect(portalDivs.length).toBe(3)
    const repoPortalDiv = portalDivs[2] as HTMLElement
    debug(repoPortalDiv!)
    const repoSelectListMenu = repoPortalDiv.querySelector('.bp3-menu')
    const firstRepoOption = await findByText(repoSelectListMenu as HTMLElement, 'repo1')
    expect(firstRepoOption).toBeDefined()
    userEvent.click(firstRepoOption)
    expect(repoInput.value).toBe('repo1')
    // // Branch
    // const branchInput = queryByNameAttribute('name') as HTMLInputElement
    // expect(branchInput.value).toBe('')
    // const branchDropDownIcon = dropdownIcons[2]
    // fireEvent.click(branchDropDownIcon!)
    // expect(fetchBranches).toHaveBeenCalledTimes(1)
    // expect(portalDivs.length).toBe(3)
    // const branchPortalDiv = portalDivs[2]
    // const branchSelectListMenu = branchPortalDiv.querySelector('.bp3-menu')
    // const thirdOption = await findByText(branchSelectListMenu as HTMLElement, 'main-patch')
    // expect(thirdOption).toBeDefined()
    // userEvent.click(thirdOption)
    // expect(branchInput.value).toBe('main-patch')

    const importButton = getByText('common.import')
    userEvent.click(importButton)
    await waitFor(() => expect(portalDivs).toHaveLength(0))
    await waitFor(() => expect(onSuccess).toBeCalled())
  })
})
