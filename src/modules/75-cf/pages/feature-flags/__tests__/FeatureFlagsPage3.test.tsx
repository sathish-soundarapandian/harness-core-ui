/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, waitFor, RenderResult, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { cloneDeep } from 'lodash-es'
import { TestWrapper } from '@common/utils/testUtils'
import mockImport from 'framework/utils/mockImport'
import mockEnvironments from '@cf/pages/environments/__tests__/mockEnvironments'
import mockGitSync from '@cf/utils/testData/data/mockGitSync'
import mockGovernance from '@cf/utils/testData/data/mockGovernance'
import FeatureFlagsPage, { RenderColumnFlag } from '../FeatureFlagsPage'
import type { RenderColumnFlagProps } from '../FeatureFlagsPage'
import mockFeatureFlags from './mockFeatureFlags'
import cellMock from './data/cellMock'

jest.mock('@cf/hooks/useGitSync', () => ({
  useGitSync: jest.fn(() => ({
    getGitSyncFormMeta: jest.fn().mockReturnValue({
      gitSyncInitialValues: {},
      gitSyncValidationSchema: {}
    }),
    isAutoCommitEnabled: false,
    isGitSyncEnabled: false,
    handleAutoCommit: jest.fn()
  }))
}))

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
  let newLocation = `path?activeEnvironment=${data.data.content[0].identifier}`

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
    jest.clearAllMocks()

    mockImport('services/cf', {
      useGetAllFeatures: () => ({ data: mockFeatureFlags, refetch: jest.fn() })
    })

    mockEnvs()
  })

  test('FeatureFlagsPage should render data correctly', async () => {
    renderComponent()

    expect(screen.getAllByText(mockFeatureFlags.features[0].name)).toBeDefined()
    expect(screen.getAllByText(mockFeatureFlags.features[1].name)).toBeDefined()
  })

  test('Should go to edit page by clicking a row', async () => {
    renderComponent()

    fireEvent.click(document.getElementsByClassName('TableV2--row TableV2--card TableV2--clickable')[0] as HTMLElement)

    expect(
      screen.getByText('/account/dummy/cf/orgs/dummy/projects/dummy/feature-flags/hello_world?activeEnvironment=foobar')
    ).toBeDefined()
  })

  test('Should go to edit page by clicking edit', async () => {
    renderComponent()

    fireEvent.click(document.querySelector('[data-icon="Options"]') as HTMLElement)
    fireEvent.click(document.querySelector('[icon="edit"]') as HTMLElement)

    expect(
      screen.getByText('/account/dummy/cf/orgs/dummy/projects/dummy/feature-flags/hello_world?activeEnvironment=sfgsd')
    ).toBeDefined()
  })

  test('Should allow deleting', async () => {
    const mutate = jest.fn(() => {
      return Promise.resolve({ data: {} })
    })

    mockImport('services/cf', {
      useGetAllFeatures: () => ({ data: mockFeatureFlags, refetch: jest.fn() }),
      useDeleteFeatureFlag: () => ({ mutate })
    })

    renderComponent()

    fireEvent.click(document.querySelector('[role="row"]:not(:first-of-type) [data-icon="Options"]') as HTMLElement)
    fireEvent.click(document.querySelector('[icon="trash"]') as HTMLElement)

    fireEvent.click(document.querySelector('button[class*=intent-danger]') as HTMLButtonElement)
    await waitFor(() => expect(mutate).toBeCalledTimes(1))
  })

  describe('FilterCards', () => {
    test('should not render if there is no active Environment', async () => {
      mockEnvs(false)
      renderComponent()

      expect(screen.queryAllByTestId('filter-card')).toHaveLength(0)
    })

    test('should render when Feature Flags exist and there is an active Environment', async () => {
      mockEnvs(true)
      renderComponent()

      expect(screen.queryAllByTestId('filter-card')).toHaveLength(6)
    })

    test('should not render if there is an active Environment but no flags', async () => {
      mockEnvs(true)
      mockImport('services/cf', {
        useGetAllFeatures: () => ({ data: undefined, refetch: jest.fn() })
      })
      renderComponent()

      expect(screen.queryAllByTestId('filter-card')).toHaveLength(0)
      expect(screen.getByText('cf.noFlag')).toBeVisible()
    })
  })

  describe('RenderColumnFlag', () => {
    const toggleFeatureFlag = {
      on: jest.fn(),
      off: jest.fn(),
      loading: false,
      error: undefined
    }

    const refetchFlags = jest.fn()

    const renderFlagComponent = (props: Partial<RenderColumnFlagProps> = {}): RenderResult =>
      render(
        <TestWrapper
          path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags"
          pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
        >
          <RenderColumnFlag
            gitSync={{ ...mockGitSync, isGitSyncEnabled: true }}
            update={jest.fn()}
            toggleFeatureFlag={toggleFeatureFlag}
            cell={cellMock}
            governance={mockGovernance}
            refetchFlags={refetchFlags}
            {...props}
          />
        </TestWrapper>
      )

    test('disables FF switch tooltip when there are no environments', async () => {
      renderFlagComponent({ numberOfEnvs: 0 })
      const switchToggle = screen.getByRole('checkbox')

      fireEvent.mouseOver(switchToggle)
      await waitFor(() => {
        const warningTooltip = screen.queryByText('cf.noEnvironment.title')
        expect(warningTooltip).toBeInTheDocument()
        expect(switchToggle).toBeDisabled()
      })
    })

    test('switch tooltip appear when there are environments', async () => {
      renderFlagComponent({ numberOfEnvs: 2 })
      const switchToggle = screen.getByRole('checkbox')
      userEvent.click(switchToggle)

      const toggleFlagPopover = screen.getByRole('heading', { name: 'cf.featureFlags.turnOnHeading' })

      await waitFor(() => {
        const warningToolTip = screen.queryByText('cf.noEnvironment.message')
        expect(toggleFlagPopover).toBeInTheDocument()
        expect(warningToolTip).not.toBeInTheDocument()
      })
    })
  })
})
