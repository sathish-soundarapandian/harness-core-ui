/* eslint-disable jest/no-commented-out-tests */
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
import mockGitSync from '@cf/utils/testData/data/mockGitSync'
import mockGovernance from '@cf/utils/testData/data/mockGovernance'
import { RenderColumnFlag } from '../FeatureFlagsPage'
import type { RenderColumnFlagProps } from '../FeatureFlagsPage'
import cellMock from './data/cellMock'

describe('RenderColumnFlag', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })
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
