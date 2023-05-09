/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

/* eslint-disable react/display-name */
import React from 'react'
import { render, RenderResult, screen } from '@testing-library/react'
import { TestWrapper, TestWrapperProps } from '@common/utils/testUtils'
import * as cdServiceMock from 'services/cd-ng'
import * as cfServiceMock from 'services/cf'
import * as useFeatureFlagMock from '@common/hooks/useFeatureFlag'
import FeatureFlagsLandingPage from '../FeatureFlagsLandingPage'

jest.mock('../FeatureFlagsPage', () => () => <div>FeatureFlagsPage</div>)
jest.mock('../SelectFlagGitRepoPage', () => () => <div>SelectFeatureFlagGitRepoPage</div>)

const setUseFeatureFlagMock = (ffGitSync: boolean): void => {
  jest.spyOn(useFeatureFlagMock, 'useFeatureFlag').mockReturnValue(ffGitSync)
}

const setCdServiceMock = (gitSyncEnabled: boolean, loading = false): void => {
  jest.spyOn(cdServiceMock, 'useIsGitSyncEnabled').mockReturnValue({ loading, data: { gitSyncEnabled } } as any)
}

const setCfServiceMock = (repoSet: boolean, loading = false): void => {
  jest.spyOn(cfServiceMock, 'useGetGitRepo').mockReturnValue({ loading, data: { repoSet } } as any)
}

const renderComponent = (wrapperProps?: Partial<TestWrapperProps>): RenderResult => {
  return render(
    <TestWrapper
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags"
      pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      {...wrapperProps}
    >
      <FeatureFlagsLandingPage />
    </TestWrapper>
  )
}

describe('FeatureFlagsLandingPage', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('it should render feature flags page when FF_GITSYNC is FALSE or gitSyncEnabled = false', async () => {
    const gitSyncEnabled = false
    setCdServiceMock(gitSyncEnabled)

    const FF_GITSYNC = false
    setUseFeatureFlagMock(FF_GITSYNC)

    const repoSet = false
    setCfServiceMock(repoSet)

    renderComponent()

    expect(screen.getByText('FeatureFlagsPage')).toBeInTheDocument()
  })

  test('it should render feature flag page when gitSyncEnabled = false and repoSet = false', async () => {
    const FF_GITSYNC = true
    setUseFeatureFlagMock(FF_GITSYNC)

    const gitSyncEnabled = false
    setCdServiceMock(gitSyncEnabled)

    const repoSet = false
    setCfServiceMock(repoSet)

    renderComponent()

    expect(screen.getByText('FeatureFlagsPage')).toBeInTheDocument()
  })

  test('it should render feature flags page when gitSyncEnabled = true and repoSet = true', async () => {
    const FF_GITSYNC = true
    setUseFeatureFlagMock(FF_GITSYNC)

    const gitSyncEnabled = true
    setCdServiceMock(gitSyncEnabled)

    const repoSet = true
    setCfServiceMock(repoSet)

    renderComponent()

    expect(screen.getByText('FeatureFlagsPage')).toBeInTheDocument()
  })

  test('it should render select flag repo page when gitSyncEnabled = true and repoSet = false and FF_FLAG_SYNC_THROUGH_GITEX_ENABLED = false', async () => {
    const gitSyncEnabled = true
    setCdServiceMock(gitSyncEnabled)

    const repoSet = false
    setCfServiceMock(repoSet)

    renderComponent({ defaultFeatureFlagValues: { FF_GITSYNC: true, FF_FLAG_SYNC_THROUGH_GITEX_ENABLED: false } })

    expect(screen.getByText('SelectFeatureFlagGitRepoPage')).toBeInTheDocument()
  })

  test('it should render FF Listing page when gitSyncEnabled = true and repoSet = false and FF_FLAG_SYNC_THROUGH_GITEX_ENABLED = true', async () => {
    const gitSyncEnabled = true
    setCdServiceMock(gitSyncEnabled)

    const repoSet = false
    setCfServiceMock(repoSet)

    renderComponent({ defaultFeatureFlagValues: { FF_GITSYNC: true, FF_FLAG_SYNC_THROUGH_GITEX_ENABLED: true } })

    expect(screen.queryByText('SelectFeatureFlagGitRepoPage')).not.toBeInTheDocument()
    expect(screen.getByText('FeatureFlagsPage')).toBeInTheDocument()
  })

  test('it should show spinner when requests in progress', async () => {
    const loading = true

    const FF_GITSYNC = true
    setUseFeatureFlagMock(FF_GITSYNC)

    const gitSyncEnabled = true
    setCdServiceMock(gitSyncEnabled, loading)

    const repoSet = false
    setCfServiceMock(repoSet, loading)

    renderComponent()

    expect(screen.getByText(/Loading, please wait\.\.\./)).toBeInTheDocument()
  })
})
