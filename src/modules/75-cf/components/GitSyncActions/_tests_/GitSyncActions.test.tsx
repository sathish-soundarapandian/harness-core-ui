/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as yup from 'yup'
import { TestWrapper } from '@common/utils/testUtils'
import { FFGitSyncContext } from '@cf/contexts/ff-git-sync-context/FFGitSyncContext'
import type { UseGitSync } from '@cf/hooks/useGitSync'
import GitSyncActions from '../GitSyncActions'

const renderComponent = (props?: Partial<UseGitSync>): void => {
  render(
    <TestWrapper
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags"
      pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
    >
      <FFGitSyncContext.Provider
        value={{
          apiError: '',
          gitSyncLoading: false,
          getGitSyncFormMeta: () => ({
            gitSyncInitialValues: {
              gitDetails: {
                branch: '',
                filePath: '',
                repoIdentifier: '',
                rootFolder: '',
                commitMsg: ''
              },
              autoCommit: false
            },
            gitSyncValidationSchema: yup.object().shape({
              commitMsg: yup.string()
            })
          }),
          gitRepoDetails: {
            branch: 'test branch',
            filePath: '',
            objectId: '',
            repoIdentifier: 'test repository',
            rootFolder: ''
          },
          handleAutoCommit: () => Promise.resolve(undefined),
          handleError: () => Promise.resolve(undefined),
          handleGitPause: () => Promise.resolve(undefined),
          saveWithGit: () => Promise.resolve(undefined),
          refetchGitRepo: () => Promise.resolve(undefined),
          isAutoCommitEnabled: false,
          isGitSyncActionsEnabled: true,
          isGitSyncEnabled: true,
          isGitSyncPaused: false,
          ...props
        }}
      >
        <GitSyncActions />
      </FFGitSyncContext.Provider>
    </TestWrapper>
  )
}

describe('GitSyncActions', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('it should render correctly when auto commit = FALSE', async () => {
    renderComponent()

    expect(screen.getByRole('button', { name: 'test branch settings' })).toBeVisible()
    expect(screen.getByText('test repository')).toBeInTheDocument()

    expect(screen.getByTestId('auto-commit-status-icon')).toHaveClass('autoCommitDisabled')

    userEvent.click(screen.getByText('test branch'))

    expect(screen.getByText('cf.gitSync.autoCommitStatusLabel')).toBeInTheDocument()
    expect(screen.getByTestId('auto-commit-switch')).toBeInTheDocument()
    expect(screen.getByTestId('auto-commit-switch')).not.toBeChecked()
    expect(screen.getByRole('button', { name: 'cf.gitSync.resetGitSettings' })).toBeInTheDocument()
  })

  test('it should render correctly when auto commit = TRUE', async () => {
    renderComponent({ isAutoCommitEnabled: true })

    expect(screen.getByRole('button', { name: 'test branch settings' })).toBeVisible()
    expect(screen.getByText('test repository')).toBeInTheDocument()

    expect(screen.getByTestId('auto-commit-status-icon')).toHaveClass('autoCommitEnabled')

    userEvent.click(screen.getByText('test branch'))

    expect(screen.getByText('cf.gitSync.autoCommitStatusLabel')).toBeInTheDocument()
    expect(screen.getByTestId('auto-commit-switch')).toBeInTheDocument()
    expect(screen.getByTestId('auto-commit-switch')).toBeChecked()
    expect(screen.getByRole('button', { name: 'cf.gitSync.resetGitSettings' })).toBeInTheDocument()
  })

  test('it should render correctly when gitSyncPaused = FALSE', async () => {
    renderComponent({ isGitSyncPaused: false })

    expect(screen.getByRole('button', { name: 'test branch settings' })).toBeVisible()
    expect(screen.getByText('test repository')).toBeInTheDocument()
    expect(screen.queryByTestId('git-paused-icon')).not.toBeInTheDocument()

    userEvent.click(screen.getByText('test branch'))

    expect(screen.getByText('cf.gitSync.autoCommitStatusLabel')).toBeInTheDocument()
    expect(screen.getByTestId('toggle-git-sync-pause-switch')).toBeInTheDocument()
    expect(screen.getByTestId('toggle-git-sync-pause-switch')).toBeChecked()
  })

  test('it should render correctly when gitSyncPaused = TRUE', async () => {
    renderComponent({ isGitSyncPaused: true })

    expect(screen.getByRole('button', { name: 'test branch settings' })).toBeVisible()
    expect(screen.getByText('test repository')).toBeInTheDocument()
    expect(screen.queryByTestId('git-paused-icon')).toBeInTheDocument()

    userEvent.click(screen.getByText('test branch'))

    expect(screen.getByText('cf.gitSync.autoCommitStatusLabel')).toBeInTheDocument()
    expect(screen.getByTestId('toggle-git-sync-pause-switch')).toBeInTheDocument()
    expect(screen.getByTestId('toggle-git-sync-pause-switch')).not.toBeChecked()

    expect(screen.getByTestId('auto-commit-switch')).toBeDisabled()
  })

  test('it should call handleAutoCommit callback when switch toggled to ON', async () => {
    const handleAutoCommitMock = jest.fn()

    renderComponent({ handleAutoCommit: handleAutoCommitMock })

    userEvent.click(screen.getByText('test branch'))
    userEvent.click(screen.getByTestId('auto-commit-switch'))

    expect(handleAutoCommitMock).toBeCalledWith(true)
  })

  test('it should call handleAutoCommit callback when switch toggled to OFF', async () => {
    const handleAutoCommitMock = jest.fn()

    renderComponent({ handleAutoCommit: handleAutoCommitMock, isAutoCommitEnabled: true })

    userEvent.click(screen.getByText('test branch'))
    userEvent.click(screen.getByTestId('auto-commit-switch'))

    expect(handleAutoCommitMock).toBeCalledWith(false)
  })

  test('it should call handleGitPause callback when switch toggled to OFF', async () => {
    const handleGitPauseMock = jest.fn()

    renderComponent({ handleGitPause: handleGitPauseMock, isGitSyncPaused: true })

    userEvent.click(screen.getByText('test branch'))
    userEvent.click(screen.getByTestId('toggle-git-sync-pause-switch'))

    expect(handleGitPauseMock).toBeCalledWith(true)
  })

  test('it should call handleGitPause callback when switch toggled to ON', async () => {
    const handleGitPauseMock = jest.fn()

    renderComponent({ handleGitPause: handleGitPauseMock, isGitSyncPaused: false })

    userEvent.click(screen.getByText('test branch'))
    userEvent.click(screen.getByTestId('toggle-git-sync-pause-switch'))

    expect(handleGitPauseMock).toBeCalledWith(false)
  })

  test('it should render the button to Setup Git Sync when there is no Git repo', async () => {
    renderComponent({ gitRepoDetails: undefined })

    expect(screen.getByRole('button', { name: 'cf.featureFlags.setupGitSync' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'test branch settings' })).not.toBeInTheDocument()
  })

  test('it should not render the button to Setup Git Sync when there is a Git repo', async () => {
    renderComponent()

    expect(screen.queryByRole('button', { name: 'cf.featureFlags.setupGitSync' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'test branch settings' })).toBeInTheDocument()
  })

  test('it should not render the button to Setup Git Sync when there is a Git repo and Git Sync is paused', async () => {
    renderComponent({ isGitSyncEnabled: false, isGitSyncPaused: true })

    expect(screen.queryByRole('button', { name: 'cf.featureFlags.setupGitSync' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'test branch settings' })).toBeInTheDocument()
  })

  test('it should show confirmation modal on click of Reset Git Settings button', async () => {
    renderComponent({ isGitSyncEnabled: true })

    const settingsButton = screen.getByRole('button', { name: 'test branch settings' })
    expect(settingsButton).toBeInTheDocument()

    // open settings menu
    userEvent.click(settingsButton)

    const resetButton = screen.getByRole('button', { name: 'cf.gitSync.resetGitSettings' })
    expect(resetButton).toBeInTheDocument()

    userEvent.click(resetButton)

    // confirmation modal
    expect(screen.getByText('cf.gitSync.resetGitWarning')).toBeInTheDocument()
  })
})
