/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { render, RenderResult, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import * as GitSyncFormModule from '@gitsync/components/GitSyncForm/GitSyncForm'
import * as cfServices from 'services/cf'
import { GitSyncSetupModal, GitSyncSetupModalProps } from '../GitSyncSetupModal'

const renderComponent = (props: Partial<GitSyncSetupModalProps> = {}): RenderResult =>
  render(
    <TestWrapper>
      <GitSyncSetupModal hideModal={jest.fn()} {...props} />
    </TestWrapper>
  )

describe('GitSyncSetupModal', () => {
  const createGitRepo = jest.fn()

  jest.spyOn(cfServices, 'useCreateGitRepo').mockReturnValue({
    cancel: jest.fn(),
    loading: false,
    error: null,
    mutate: createGitRepo
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('it should render correctly when isOpen is true', async () => {
    renderComponent()

    expect(screen.getByText('cf.gitSync.setUpGitConnection')).toBeVisible()
    expect(screen.getByText('connectors.title.gitConnector')).toBeVisible()
    expect(screen.getByText('repository')).toBeVisible()
    expect(screen.getByText('gitBranch')).toBeVisible()
    expect(screen.getByRole('button', { name: 'save' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'cancel' })).toBeVisible()
  })

  test('it should validate form and prevent submission if invalid', async () => {
    renderComponent()

    const saveBtn = screen.getByRole('button', { name: 'save' })
    expect(saveBtn).toBeVisible()

    userEvent.click(saveBtn)

    await waitFor(() => {
      expect(screen.getByText('common.git.validation.repoRequired')).toBeVisible()
      expect(screen.getByText('common.git.validation.branchRequired')).toBeVisible()
      expect(screen.getByText('validation.sshConnectorRequired')).toBeVisible()
      expect(screen.getByText('gitsync.gitSyncForm.yamlPathRequired')).toBeVisible()
      expect(createGitRepo).not.toHaveBeenCalled()
    })
  })

  describe('submission', () => {
    const GitSyncFormSpy = jest.spyOn(GitSyncFormModule, 'GitSyncForm')

    beforeEach(() => {
      GitSyncFormSpy.mockImplementation(({ formikProps }) => {
        useEffect(() => {
          formikProps.setValues({
            repo: 'repo1',
            branch: 'main',
            filePath: '/folder1/.harness/flags.yaml',
            connectorRef: 'ValidGithubRepo'
          })
        }, [])

        return <span />
      })
    })

    afterAll(() => {
      GitSyncFormSpy.mockClear()
    })

    test('it should submit', async () => {
      const hideModalMock = jest.fn()
      renderComponent({ hideModal: hideModalMock })

      userEvent.click(screen.getByRole('button', { name: 'save' }))

      await waitFor(() => {
        expect(createGitRepo).toHaveBeenCalled()
        expect(hideModalMock).toHaveBeenCalled()
      })
    })

    test('it should show an error if the createGitRepo throws an exception', async () => {
      const message = 'ERROR MESSAGE'
      createGitRepo.mockRejectedValueOnce({ message })
      const hideModalMock = jest.fn()

      renderComponent({ hideModal: hideModalMock })

      userEvent.click(screen.getByRole('button', { name: 'save' }))

      await waitFor(() => {
        expect(createGitRepo).toHaveBeenCalled()
        expect(screen.getByText(message))
        expect(hideModalMock).not.toHaveBeenCalled()
      })
    })
  })
})
