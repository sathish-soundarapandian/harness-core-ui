/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, waitFor, RenderResult, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

describe('FeatureFlagsPage', () => {
  test('FeatureFlagsPage should render data correctly', async () => {
    mockImport('services/cf', {
      useGetAllFeatures: () => ({ data: mockFeatureFlags, refetch: jest.fn() })
    })

    mockImport('services/cd-ng', {
      useGetEnvironmentListForProject: () => ({
        data: mockEnvironments,
        loading: false,
        error: undefined,
        refetch: jest.fn()
      })
    })

    const { getAllByText } = render(
      <TestWrapper
        path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <FeatureFlagsPage />
      </TestWrapper>
    )

    expect(getAllByText(mockFeatureFlags.features[0].name)).toBeDefined()
    expect(getAllByText(mockFeatureFlags.features[1].name)).toBeDefined()
  })

  test('Should go to edit page by clicking a row', async () => {
    mockImport('services/cf', {
      useGetAllFeatures: () => ({ data: mockFeatureFlags, refetch: jest.fn() })
    })

    mockImport('services/cd-ng', {
      useGetEnvironmentListForProject: () => ({
        data: mockEnvironments,
        loading: false,
        error: undefined,
        refetch: jest.fn()
      })
    })

    const { container, getByText } = render(
      <TestWrapper
        path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <FeatureFlagsPage />
      </TestWrapper>
    )

    fireEvent.click(container.getElementsByClassName('TableV2--row TableV2--card TableV2--clickable')[0] as HTMLElement)

    expect(getByText('/account/dummy/cf/orgs/dummy/projects/dummy/feature-flags/hello_world')).toBeDefined()
  })

  test('Should go to edit page by clicking edit', async () => {
    mockImport('services/cf', {
      useGetAllFeatures: () => ({ data: mockFeatureFlags, refetch: jest.fn() })
    })

    mockImport('services/cd-ng', {
      useGetEnvironmentListForProject: () => ({
        data: mockEnvironments,
        loading: false,
        error: undefined,
        refetch: jest.fn()
      })
    })

    const { container, getByText } = render(
      <TestWrapper
        path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <FeatureFlagsPage />
      </TestWrapper>
    )

    fireEvent.click(container.querySelector('[data-icon="Options"]') as HTMLElement)
    fireEvent.click(document.querySelector('[icon="edit"]') as HTMLElement)

    expect(
      getByText('/account/dummy/cf/orgs/dummy/projects/dummy/feature-flags/hello_world?activeEnvironment=sfgsd')
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

    mockImport('services/cd-ng', {
      useGetEnvironmentListForProject: () => ({
        data: mockEnvironments,
        loading: false,
        error: undefined,
        refetch: jest.fn()
      })
    })

    const { container } = render(
      <TestWrapper
        path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <FeatureFlagsPage />
      </TestWrapper>
    )

    fireEvent.click(container.querySelector('[role="row"]:not(:first-of-type) [data-icon="Options"]') as HTMLElement)
    fireEvent.click(document.querySelector('[icon="trash"]') as HTMLElement)

    fireEvent.click(document.querySelector('button[class*=intent-danger]') as HTMLButtonElement)
    await waitFor(() => expect(mutate).toBeCalledTimes(1))
  })

  describe('RenderColumnFlag', () => {
    const toggleFeatureFlag = {
      on: jest.fn(),
      off: jest.fn(),
      loading: false,
      error: undefined
    }

    const refetchFlags = jest.fn()

    const renderComponent = (props: Partial<RenderColumnFlagProps> = {}): RenderResult =>
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
      renderComponent({ numberOfEnvs: 0 })
      const switchToggle = screen.getByRole('checkbox')

      fireEvent.mouseOver(switchToggle)
      await waitFor(() => {
        const warningTooltip = screen.queryByText('cf.noEnvironment.title')
        expect(warningTooltip).toBeInTheDocument()
        expect(switchToggle).toBeDisabled()
      })
    })

    test('switch tooltip appear when there are environments', async () => {
      renderComponent({ numberOfEnvs: 2 })
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
