/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { TestWrapper } from '@common/utils/testUtils'
import * as cfServices from 'services/cf'
import { SetUpGitSync } from '../SetUpGitSync'

const renderComponent = (gitExFlag = true): RenderResult => {
  return render(
    <TestWrapper
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags"
      pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      defaultFeatureFlagValues={{
        FF_FLAG_SYNC_THROUGH_GITEX_ENABLED: gitExFlag
      }}
    >
      <SetUpGitSync />
    </TestWrapper>
  )
}

describe('SetUpGitSync', () => {
  const createGitRepoMock = jest.fn()

  jest.spyOn(cfServices, 'useCreateGitRepo').mockReturnValue({
    cancel: jest.fn(),
    loading: false,
    error: null,
    mutate: createGitRepoMock
  })

  beforeEach(() => jest.clearAllMocks())

  test('it should render correctly', async () => {
    renderComponent()

    expect(screen.getByRole('button', { name: 'cf.featureFlags.setupGitSync' })).toBeVisible()
  })

  test('It should redirect to Git Management on click of "Set Up Git Sync" button when GitEx flag is false', async () => {
    renderComponent(false)

    const setupGitBtn = screen.getByRole('button', { name: 'cf.featureFlags.setupGitSync' })

    expect(screen.queryByText('cf.gitSync.setUpGitConnection')).not.toBeInTheDocument()
    expect(setupGitBtn).toBeVisible()

    await userEvent.click(setupGitBtn)

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent(
        '/account/dummy/cf/orgs/dummy/projects/dummy/setup/git-sync'
      )
      expect(screen.queryByRole('button', { name: 'cf.featureFlags.setupGitSync' })).not.toBeInTheDocument()
      expect(screen.queryByText('cf.gitSync.setUpGitConnection')).not.toBeInTheDocument()
    })
  })

  test('It should open a modal & not redirect to Git Management on click of "Set Up Git Sync" button when GitEx flag is true', async () => {
    renderComponent()

    const setupGitBtn = screen.getByRole('button', { name: 'cf.featureFlags.setupGitSync' })

    expect(setupGitBtn).toBeVisible()

    await userEvent.click(setupGitBtn)

    await waitFor(() => {
      expect(screen.getByText('cf.gitSync.setUpGitConnection')).toBeVisible()
    })
  })

  test('It should close the Git modal on click of cancel', async () => {
    renderComponent()

    const setupGitBtn = screen.getByRole('button', { name: 'cf.featureFlags.setupGitSync' })

    expect(setupGitBtn).toBeVisible()
    expect(screen.queryByText('cf.gitSync.setUpGitConnection')).not.toBeInTheDocument()

    await userEvent.click(setupGitBtn)

    await waitFor(() => {
      expect(screen.getByText('cf.gitSync.setUpGitConnection')).toBeVisible()
    })

    await userEvent.click(screen.getByRole('button', { name: 'cancel' }))

    await waitFor(() => {
      expect(screen.queryByText('cf.gitSync.setUpGitConnection')).not.toBeInTheDocument()
    })
  })
})
