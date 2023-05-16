/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, waitFor, queryByAttribute, findAllByText, findByText } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { noop } from 'lodash-es'
import useCreateGitSyncModal from '@gitsync/modals/useCreateGitSyncModal'
import { gitHubMock } from '@gitsync/components/gitSyncRepoForm/__tests__/mockData'
import { gitConfigs, sourceCodeManagers } from '@connectors/mocks/mock'
import { GitSyncTestWrapper } from '@common/utils/gitSyncTestUtils'
import routes from '@common/RouteDefinitions'
import { projectPathProps } from '@common/utils/routeUtils'

const pathParams = { accountId: 'dummy', orgIdentifier: 'default', projectIdentifier: 'dummyProject' }
const branches = { data: ['master', 'devBranch'], status: 'SUCCESS' }
const fetchBranches = jest.fn(() => Promise.resolve(branches))
const createGitSynRepo = jest.fn()
const getGitConnector = jest.fn(() => Promise.resolve(gitHubMock))
const isSaas = jest.fn(() =>
  Promise.resolve({
    data: { saasGit: true }
  })
)

jest.mock('services/cd-ng', () => ({
  usePostGitSync: jest.fn().mockImplementation(() => ({ mutate: createGitSynRepo })),
  useGetConnector: jest.fn().mockImplementation(() => ({ data: gitHubMock, refetch: getGitConnector })),
  getConnectorListV2Promise: jest.fn().mockImplementation(() => Promise.resolve(gitHubMock)),
  useGetListOfBranchesByConnector: jest.fn().mockImplementation(() => ({ data: branches, refetch: fetchBranches })),
  useGetTestGitRepoConnectionResult: jest.fn().mockImplementation(() => ({ mutate: jest.fn })),
  useIsSaasGit: jest.fn().mockImplementation(() => ({ mutate: isSaas })),
  usePostGitSyncSetting: jest.fn().mockImplementation(() => {
    return {
      mutate: jest.fn()
    }
  }),
  useListGitSync: jest.fn().mockImplementation(() => {
    return { data: gitConfigs, refetch: jest.fn() }
  })
}))

jest.mock('services/cd-ng-rq', () => ({
  useGetSourceCodeManagersQuery: jest.fn().mockImplementation(() => {
    return { data: sourceCodeManagers, refetch: jest.fn() }
  })
}))

describe('Test useCreateGitSyncModal', () => {
  const TestComponent = () => {
    const { openGitSyncModal } = useCreateGitSyncModal({
      onSuccess: noop,
      onClose: noop
    })
    return (
      <div
        className="useCreateGitSyncModalTestOpenDialog"
        onClick={() => openGitSyncModal(true, false, undefined)}
      ></div>
    )
  }
  test('should open useCreateGitSyncModal', async () => {
    const { container, getByText } = render(
      <GitSyncTestWrapper path={routes.toGitSyncReposAdmin(projectPathProps)} pathParams={pathParams}>
        <TestComponent />
      </GitSyncTestWrapper>
    )
    fireEvent.click(container.querySelector('.useCreateGitSyncModalTestOpenDialog')!)
    await waitFor(() => expect(() => getByText('gitsync.configureHarnessFolder')).toBeTruthy())
  })
  test('should open useCreateGitSyncModal', async () => {
    const { container, getByText, queryByText } = render(
      <GitSyncTestWrapper path={routes.toGitSyncReposAdmin(projectPathProps)} pathParams={pathParams}>
        <TestComponent />
      </GitSyncTestWrapper>
    )
    fireEvent.click(container.querySelector('.useCreateGitSyncModalTestOpenDialog')!)
    await waitFor(() => expect(() => getByText('gitsync.configureHarnessFolder')).toBeTruthy())

    await waitFor(() => {
      expect(getByText('selectGitProvider')).toBeTruthy()
    })

    let dialog = document.getElementsByClassName('bp3-dialog')[0] as HTMLElement

    const connnectorRefInput = queryByAttribute('data-testid', dialog, /gitConnector/)
    expect(connnectorRefInput).toBeTruthy()
    fireEvent.click(connnectorRefInput!)

    await act(async () => {
      const connectorSelectorDialog = document.getElementsByClassName('bp3-dialog')[1]
      const githubConnector = await findAllByText(connectorSelectorDialog as HTMLElement, 'ValidGithubRepo')
      expect(githubConnector).toBeTruthy()
      fireEvent.click(githubConnector?.[0])
      const applySelected = getByText('entityReference.apply')
      await act(async () => {
        fireEvent.click(applySelected)
      })
    })

    const nameInput = queryByAttribute('name', dialog, 'name')
    expect(nameInput).toBeDefined()

    await act(async () => {
      fireEvent.change(nameInput!, { target: { value: 'repoName' } })
    })
    expect(fetchBranches).toBeCalledTimes(1)

    const rootfolderInput = queryByAttribute('name', dialog, 'rootfolder')
    expect(rootfolderInput).toBeDefined()

    await act(async () => {
      fireEvent.change(rootfolderInput!, { target: { value: 'src' } })
    })

    const icons = dialog.querySelectorAll('[icon="chevron-down"]')
    const branchInputIcon = icons[icons.length - 1]
    expect(branchInputIcon).toBeDefined()

    act(() => {
      fireEvent.click(branchInputIcon!)
    })

    await waitFor(() => expect(queryByText('devBranch')).toBeTruthy())

    act(() => {
      fireEvent.click(getByText('devBranch'))
    })

    await act(async () => {
      const continueBtn = await findByText(dialog, 'continue')
      fireEvent.click(continueBtn)
    })

    dialog = document.getElementsByClassName('bp3-dialog')[0] as HTMLElement

    await waitFor(() => {
      expect(findByText(dialog, 'gitsync.connectToGitProvider')).toBeTruthy()
    })

    expect(isSaas).toBeCalledTimes(1)
    await act(async () => {
      const submitBtn = await findByText(dialog, 'saveAndContinue')
      fireEvent.click(submitBtn)
    })

    expect(createGitSynRepo).toBeCalledTimes(1)
    expect(createGitSynRepo).toHaveBeenCalledWith({
      branch: 'devBranch',
      gitConnectorRef: 'ValidGithubRepo',
      gitConnectorType: 'Github',
      gitSyncFolderConfigDTOs: [
        {
          isDefault: true,
          rootFolder: '/src/.harness/'
        }
      ],
      identifier: 'repoName',
      name: 'repoName',
      orgIdentifier: 'default',
      projectIdentifier: 'dummyProject',
      repo: 'https://github.com/wings-software/sunnykesh-gitSync'
    })
  })

  test('should open useCreateGitSyncModal', async () => {
    const { container, getByText } = render(
      <GitSyncTestWrapper path={routes.toGitSyncReposAdmin(projectPathProps)} pathParams={pathParams}>
        <TestComponent />
      </GitSyncTestWrapper>
    )
    fireEvent.click(container.querySelector('.useCreateGitSyncModalTestOpenDialog')!)
    await waitFor(() => expect(() => getByText('gitsync.configureHarnessFolder')).toBeTruthy())
    const cancelButton = await findByText(document.body, 'cancel')
    fireEvent.click(cancelButton)
    expect(document.body.querySelector('.bp3-dialog')).toEqual(null)
  })
})
