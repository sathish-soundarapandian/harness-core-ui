/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  render,
  fireEvent,
  getByText,
  waitFor,
  RenderResult,
  screen,
  act,
  getAllByRole,
  getAllByTestId
} from '@testing-library/react'
import { cloneDeep } from 'lodash-es'
import userEvent from '@testing-library/user-event'
import * as cfServices from 'services/cf'
import { TestWrapper } from '@common/utils/testUtils'
import mockImport from 'framework/utils/mockImport'
import mockEnvironments from '@cf/pages/environments/__tests__/mockEnvironments'
import FeatureFlagsPage from '../FeatureFlagsPage'
import mockFeatureFlags from './mockFeatureFlags'
import mockGetAllEnvironmentsFlags from './mockGetAllEnvironmentsFlags'

const renderComponent = (): RenderResult =>
  render(
    <TestWrapper
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags"
      pathParams={{
        accountId: 'dummy',
        orgIdentifier: 'dummy',
        projectIdentifier: 'dummy'
      }}
      defaultFeatureFlagValues={{
        STALE_FLAGS_FFM_1510: true,
        FFM_3938_STALE_FLAGS_ACTIVE_CARD_HIDE_SHOW: true,
        FFM_6683_ALL_ENVIRONMENTS_FLAGS: true
      }}
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
    jest.useFakeTimers({ advanceTimers: true })
    jest.runAllTimers()
    mockImport('services/cf', {
      useGetAllFeatures: () => ({ data: mockFeatureFlags, refetch: jest.fn() })
    })
    mockImport('services/cf', {
      useGetFeatureMetrics: () => ({ data: [], refetch: jest.fn() })
    })

    mockEnvs()

    jest.mock('@cf/hooks/useGitSync', () => ({
      useGitSync: jest.fn(() => ({
        gitRepoDetails: undefined,
        getGitSyncFormMeta: jest.fn().mockReturnValue({
          gitSyncInitialValues: {},
          gitSyncValidationSchema: {}
        }),
        isAutoCommitEnabled: false,
        isGitSyncEnabled: false,
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

  test('It should render data correctly and call metrics', async () => {
    const metricsSpy = jest.spyOn(cfServices, 'useGetFeatureMetrics')
    renderComponent()

    await waitFor(() => {
      expect(screen.getAllByText(mockFeatureFlags.features[0].name)).toBeDefined()
      expect(screen.getAllByText(mockFeatureFlags.features[1].name)).toBeDefined()
      expect(screen.getByRole('button', { name: 'cf.featureFlags.setupGitSync' })).toBeVisible()
      expect(metricsSpy).toHaveBeenCalled()
    })
  })

  test('It should have an option for "All Environments" in the EnvironmentSelect dropdown', async () => {
    renderComponent()

    const environmentSelect = screen.getByRole('textbox', { name: 'cf.shared.selectEnvironment' })

    expect(environmentSelect).toHaveValue('foobar')

    await userEvent.click(environmentSelect)

    await waitFor(() => {
      expect(screen.getByText('common.allEnvironments')).toBeInTheDocument()
      expect(screen.getByText('QB')).toBeInTheDocument()
    })
  })

  test('It should show All Environments Flags view on click of "All Environments" in the EnvironmentSelect dropdown', async () => {
    const refetchAllEnvironmentsFlags = jest.fn()

    mockImport('services/cf', {
      useGetProjectFlags: () => ({
        loading: false,
        data: mockGetAllEnvironmentsFlags,
        refetch: refetchAllEnvironmentsFlags,
        error: null
      })
    })

    renderComponent()

    const environmentSelect = screen.getByRole('textbox', { name: 'cf.shared.selectEnvironment' })

    expect(environmentSelect).toHaveValue('foobar')

    await userEvent.click(environmentSelect)

    expect(refetchAllEnvironmentsFlags).not.toHaveBeenCalled()
    expect(screen.getByText('common.allEnvironments')).toBeInTheDocument()
    expect(screen.getByText('QB')).toBeInTheDocument()

    await userEvent.click(screen.getByText('common.allEnvironments'))

    expect(refetchAllEnvironmentsFlags).toHaveBeenCalledTimes(1)
    expect(screen.getAllByText('cf.environments.nonProd')).toHaveLength(17)
    expect(screen.getAllByText('cf.environments.prod')).toHaveLength(17)
  })

  test('It should go to edit page by clicking a row', async () => {
    renderComponent()

    await act(async () => {
      await fireEvent.click(
        document.getElementsByClassName('TableV2--row TableV2--card TableV2--clickable')[0] as HTMLElement
      )
    })

    expect(screen.getByTestId('location')).toHaveTextContent('dummy/feature-flags/hello_world')
  })

  test('Should go to edit page by clicking edit', async () => {
    renderComponent()

    await act(async () => {
      await fireEvent.click(document.querySelector('[data-icon="Options"]') as HTMLElement)
      await fireEvent.click(document.querySelector('[icon="edit"]') as HTMLElement)
    })

    expect(screen.getByTestId('location')).toHaveTextContent('feature-flags/hello_world')
  })

  test('It should allow deleting', async () => {
    const mutate = jest.fn(() => {
      return Promise.resolve({ data: {} })
    })

    mockImport('services/cf', {
      useDeleteFeatureFlag: () => ({ mutate })
    })

    renderComponent()

    await act(async () => {
      await fireEvent.click(document.querySelector('[role="row"] [data-icon="Options"]') as HTMLElement)
      await fireEvent.click(document.querySelector('[icon="trash"]') as HTMLElement)
      await fireEvent.click(document.querySelector('button[class*=intent-danger]') as HTMLButtonElement)
    })
    expect(mutate).toBeCalledTimes(1)
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

  test('It should go to Feature Flag details page on click of an environment in All Environments view', async () => {
    const refetchProjectFlags = jest.fn()

    mockImport('services/cf', {
      useGetProjectFlags: () => ({
        loading: false,
        data: mockGetAllEnvironmentsFlags,
        refetch: refetchProjectFlags,
        error: null
      })
    })

    renderComponent()

    const environmentSelect = screen.getByRole('textbox', { name: 'cf.shared.selectEnvironment' })

    expect(environmentSelect).toHaveValue('foobar')

    await userEvent.click(environmentSelect)

    expect(refetchProjectFlags).not.toHaveBeenCalled()
    expect(screen.getByText('common.allEnvironments')).toBeInTheDocument()

    await userEvent.click(screen.getByText('common.allEnvironments'))

    expect(refetchProjectFlags).toHaveBeenCalledTimes(1)
    expect(screen.getAllByText('cf.environments.nonProd')).toHaveLength(17)
    expect(screen.getAllByText('cf.environments.prod')).toHaveLength(17)

    const rows = screen.getAllByRole('row')

    // Feature Flag 1st row
    const flag1Columns = getAllByRole(rows[1], 'cell')
    const envTypeContainers = getAllByTestId(flag1Columns[2], 'environmentTypeContainer')
    const nonProdEnvironments = getAllByTestId(envTypeContainers[0], 'flagEnvironmentStatus')

    // PreProduction environments
    expect(envTypeContainers[0]).toHaveTextContent('cf.environments.nonProd')
    expect(nonProdEnvironments[0]).toHaveTextContent('foobarENABLEDLABEL')
    expect(nonProdEnvironments[1]).toHaveTextContent('QBENABLEDLABEL')

    await userEvent.click(nonProdEnvironments[1])

    expect(screen.getByTestId('location')).toHaveTextContent('dummy/feature-flags/hello_world?activeEnvironment=QB')
  })

  describe('FilterCards', () => {
    test('It should not render if there is no active Environment', async () => {
      mockEnvs(false)
      renderComponent()

      expect(screen.queryAllByTestId('filter-card')).toHaveLength(0)
    })

    test('It should render when Feature Flags exist and there is an active Environment', async () => {
      mockEnvs()
      renderComponent()

      expect(screen.queryAllByTestId('filter-card')).toHaveLength(6)
    })

    test('It should not render if there is an active Environment but no flags', async () => {
      mockEnvs()
      mockImport('services/cf', {
        useGetAllFeatures: () => ({ data: undefined, refetch: jest.fn() })
      })
      renderComponent()

      expect(screen.queryAllByTestId('filter-card')).toHaveLength(0)
    })
  })
})
