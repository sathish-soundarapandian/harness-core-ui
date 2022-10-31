/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, getByText, waitFor, RenderResult, screen } from '@testing-library/react'
import { cloneDeep } from 'lodash-es'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import mockImport from 'framework/utils/mockImport'
import mockEnvironments from '@cf/pages/environments/__tests__/mockEnvironments'
import FeatureFlagsPage from '../FeatureFlagsPage'
import mockFeatureFlags from './mockFeatureFlags'

const renderComponent = (): RenderResult =>
  render(
    <TestWrapper
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags"
      pathParams={{
        accountId: 'dummy',
        orgIdentifier: 'dummy',
        projectIdentifier: 'dummy'
      }}
      defaultFeatureFlagValues={{ STALE_FLAGS_FFM_1510: true, FFM_3938_STALE_FLAGS_ACTIVE_CARD_HIDE_SHOW: true }}
    >
      <FeatureFlagsPage />
    </TestWrapper>
  )

const mockEnvs = (includeEnvs = true): void => {
  const data = cloneDeep(mockEnvironments)
  let newLocation = `path?activeEnvironment=Mock_Environment`

  if (!includeEnvs) {
    data.data.content = []
    newLocation = 'path'
  }

  mockImport('services/cd-ng', {
    useGetEnvironmentListForProject: () => ({
      data,
      loading: false,
      error: undefined,
      refetch: jest.fn()
    })
  })

  window.location.hash = newLocation
}

describe('FeatureFlagsPage', () => {
  beforeEach(() => {
    mockImport('services/cf', {
      useGetAllFeatures: () => ({ data: mockFeatureFlags, refetch: jest.fn() })
    })

    mockEnvs()

    jest.mock('@cf/hooks/useGitSync', () => ({
      useGitSync: jest.fn(() => ({
        getGitSyncFormMeta: jest.fn().mockReturnValue({
          gitSyncInitialValues: {},
          gitSyncValidationSchema: {}
        }),
        isAutoCommitEnabled: false,
        isGitSyncEnabled: true,
        handleAutoCommit: jest.fn()
      }))
    }))
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  test('It should render loading correctly', async () => {
    mockImport('services/cd-ng', {
      useGetEnvironmentListForProject: () => ({ loading: true, refetch: jest.fn() })
    })
    mockImport('services/cf', {
      useGetAllFeatures: () => ({ loading: true, refetch: jest.fn() })
    })

    renderComponent()

    expect(document.querySelector('[data-icon="steps-spinner"]')).toBeDefined()
  })

  test('It should render data correctly', async () => {
    renderComponent()

    expect(screen.getAllByText(mockFeatureFlags.features[0].name)).toBeDefined()
    expect(screen.getAllByText(mockFeatureFlags.features[1].name)).toBeDefined()
    expect(screen.getByTestId('gitSyncSetupRedirect')).toBeVisible()
  })

  test('It should redirect to Git Management on click of "Setup Git Sync" button', async () => {
    renderComponent()

    const setupGitBtn = screen.getByTestId('gitSyncSetupRedirect')

    expect(setupGitBtn).toBeVisible()
    expect(screen.getByText('featureFlagsText')).toBeVisible()
    expect(screen.getByTestId('create-flag-button')).toBeVisible()

    userEvent.click(setupGitBtn)

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent(
        '/account/dummy/cf/orgs/dummy/projects/dummy/setup/git-sync'
      )
      expect(screen.queryByTestId('create-flag-button')).not.toBeInTheDocument()
    })
  })

  test('It should go to edit page by clicking a row', async () => {
    renderComponent()

    fireEvent.click(document.getElementsByClassName('TableV2--row TableV2--card TableV2--clickable')[0] as HTMLElement)

    expect(
      screen.getByText(
        '/account/dummy/cf/orgs/dummy/projects/dummy/feature-flags/hello_world?activeEnvironment=Mock_Environment'
      )
    ).toBeDefined()
  })

  test('Should go to edit page by clicking edit', async () => {
    renderComponent()

    fireEvent.click(document.querySelector('[data-icon="Options"]') as HTMLElement)
    fireEvent.click(document.querySelector('[icon="edit"]') as HTMLElement)

    expect(
      screen.getByText(
        '/account/dummy/cf/orgs/dummy/projects/dummy/feature-flags/hello_world?activeEnvironment=Mock_Environment'
      )
    ).toBeDefined()
  })

  test('It should allow deleting', async () => {
    const mutate = jest.fn(() => {
      return Promise.resolve({ data: {} })
    })

    mockImport('services/cf', {
      useDeleteFeatureFlag: () => ({ mutate })
    })

    renderComponent()

    fireEvent.click(document.querySelector('[role="row"]:not(:first-of-type) [data-icon="Options"]') as HTMLElement)
    fireEvent.click(document.querySelector('[icon="trash"]') as HTMLElement)

    fireEvent.click(document.querySelector('button[class*=intent-danger]') as HTMLButtonElement)
    await waitFor(() => expect(mutate).toBeCalledTimes(1))
  })

  test('It should render error correctly', async () => {
    const message = 'ERROR OCCURS'

    // Mock setTimeout
    const localGlobal = global as Record<string, any>
    localGlobal.window = Object.create(window)
    localGlobal.window.setTimeout = jest.fn()

    mockImport('services/cd-ng', {
      useGetEnvironmentListForProject: () => ({ error: { message }, refetch: jest.fn() })
    })
    mockImport('services/cf', {
      useGetAllFeatures: () => ({ data: undefined, refetch: jest.fn() })
    })

    renderComponent()

    expect(getByText(document.body, message)).toBeDefined()
  })

  describe('FilterCards', () => {
    test('should not render if there is no active Environment', async () => {
      mockEnvs(false)
      renderComponent()

      expect(screen.queryAllByTestId('filter-card')).toHaveLength(0)
    })

    test('should render when Feature Flags exist and there is an active Environment', async () => {
      mockEnvs()
      renderComponent()

      expect(screen.queryAllByTestId('filter-card')).toHaveLength(6)
    })

    test('should not render if there is an active Environment but no flags', async () => {
      mockEnvs()
      mockImport('services/cf', {
        useGetAllFeatures: () => ({ data: undefined, refetch: jest.fn() })
      })
      renderComponent()

      expect(screen.queryAllByTestId('filter-card')).toHaveLength(0)
    })
  })
})
