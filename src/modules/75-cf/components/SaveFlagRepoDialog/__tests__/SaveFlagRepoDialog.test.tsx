/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen, waitFor, RenderResult } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import * as cfServices from 'services/cf'
import SaveFlagRepoDialog, { SaveFlagRepoDialogProps } from '../SaveFlagRepoDialog'
import gitSyncReposMock from './gitSyncRepos_multi.json'

jest.mock('framework/GitRepoStore/GitSyncStoreContext', () => ({
  useGitSyncStore: () => gitSyncReposMock
}))

const renderComponent = (props: Partial<SaveFlagRepoDialogProps> = {}): RenderResult => {
  return render(
    <TestWrapper
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags"
      pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
    >
      <SaveFlagRepoDialog isOpen={true} closeModal={jest.fn()} gitRepoRefetch={jest.fn()} {...props} />
    </TestWrapper>
  )
}

describe('SaveFlagRepoDialog', () => {
  test('it should render modal correctly', async () => {
    renderComponent()

    expect(screen.getByText('cf.selectFlagRepo.dialogTitle')).toBeInTheDocument()
    expect(screen.getByText('common.git.selectRepoLabel')).toBeInTheDocument()
    expect(screen.getByText('common.gitSync.harnessFolderLabel')).toBeInTheDocument()
    expect(screen.getByText('common.git.filePath')).toBeInTheDocument()
    expect(screen.getByText('save')).toBeInTheDocument()
    expect(screen.getByText('cancel')).toBeInTheDocument()
  })

  test('it should render modal with correct initial form values', async () => {
    renderComponent()

    expect(document.querySelector("[name='repoIdentifier']")).toHaveValue('harness-test')

    expect(screen.getByTestId('save-flag-repo-dialog-form')).toHaveFormValues({
      repoIdentifier: 'harness-test',
      branch: 'main',
      rootFolder: '',
      filePath: '/flags.yaml'
    })
  })

  test('it should close modal on close button click', async () => {
    const onCloseMock = jest.fn()
    renderComponent({ closeModal: onCloseMock })

    await userEvent.click(screen.getByText('cancel'))

    await waitFor(() => expect(onCloseMock).toHaveBeenCalled())
  })

  test('it should update form when Repository Name changed', async () => {
    renderComponent()

    await userEvent.click(document.getElementsByName('repoIdentifier')[0])
    expect(screen.getByText('harness-test-2')).toBeInTheDocument()

    await userEvent.click(screen.getByText('harness-test-2'))

    expect(screen.getByTestId('save-flag-repo-dialog-form')).toHaveFormValues({
      repoIdentifier: 'harness-test-2',
      branch: 'main2',
      rootFolder: '',
      filePath: '/flags.yaml'
    })
  })

  test('it should call createGitRepo API with correct values and refetch gitRepo data on Submit', async () => {
    const createGitRepoMock = jest.fn()
    const gitRepoRefetch = jest.fn()

    jest.spyOn(cfServices, 'useCreateGitRepo').mockReturnValue({
      cancel: jest.fn(),
      loading: false,
      error: null,
      mutate: createGitRepoMock
    })

    renderComponent({ gitRepoRefetch })

    await userEvent.click(document.getElementsByName('rootFolder')[0])
    await userEvent.click(screen.getByText('/.harness/'))

    await userEvent.click(screen.getByText('save'))

    await waitFor(() =>
      expect(createGitRepoMock).toHaveBeenCalledWith({
        branch: 'main',
        filePath: '/flags.yaml',
        repoIdentifier: 'harnesstest',
        rootFolder: '/.harness/'
      })
    )

    expect(gitRepoRefetch).toHaveBeenCalled()
  })
})
