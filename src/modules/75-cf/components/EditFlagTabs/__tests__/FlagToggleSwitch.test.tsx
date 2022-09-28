/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { fireEvent, render, RenderResult, screen, waitFor } from '@testing-library/react'
import React from 'react'
import * as rbacHooksMock from '@rbac/hooks/usePermission'
import { TestWrapper } from '@common/utils/testUtils'
import * as useFeaturesMock from '@common/hooks/useFeatures'
import * as useFeatureEnabled from '@cf/pages/feature-flags-detail/targeting-rules-tab/hooks/useFeatureEnabled'
import FlagToggleSwitch, { FlagToggleSwitchProps } from '../FlagToggleSwitch'

const renderComponent = (props: Partial<FlagToggleSwitchProps> = {}): RenderResult => {
  return render(
    <TestWrapper
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags"
      pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
    >
      <FlagToggleSwitch currentEnvironmentState="on" currentState="on" handleToggle={jest.fn()} {...props} />
    </TestWrapper>
  )
}

describe('FlagToggleSwitch', () => {
  beforeEach(() => {
    jest.spyOn(rbacHooksMock, 'usePermission').mockReturnValue([true, true])
    jest.spyOn(useFeatureEnabled, 'default').mockReturnValue({
      enabledByPlanEnforcement: true,
      featureEnabled: true,
      enabledByPermission: true,
      canEdit: true,
      canToggle: true
    })
  })

  test('it should render toggle text correctly when ON', async () => {
    jest.spyOn(useFeaturesMock, 'useGetFirstDisabledFeature').mockReturnValue({ featureEnabled: true })
    renderComponent({
      currentState: 'on',
      currentEnvironmentState: 'on'
    })

    expect(screen.getByTestId('flag-status-switch')).toBeChecked()
    expect(screen.getByText('cf.featureFlags.flagOn')).toBeInTheDocument()
  })

  test('it should render toggle text correctly when OFF', async () => {
    jest.spyOn(useFeaturesMock, 'useGetFirstDisabledFeature').mockReturnValue({ featureEnabled: true })

    renderComponent({
      currentState: 'off',
      currentEnvironmentState: 'off'
    })

    expect(screen.getByTestId('flag-status-switch')).not.toBeChecked()
    expect(screen.getByText('cf.featureFlags.flagOff')).toBeInTheDocument()
  })

  test('it should render toggle text correctly when current flag state is OFF and environment state is ON', async () => {
    jest.spyOn(useFeaturesMock, 'useGetFirstDisabledFeature').mockReturnValue({ featureEnabled: true })

    renderComponent({
      currentState: 'off',
      currentEnvironmentState: 'on'
    })

    expect(screen.getByTestId('flag-status-switch')).not.toBeChecked()
    expect(screen.getByText('cf.featureFlags.flagWillTurnOff')).toBeInTheDocument()
  })

  test('it should render toggle text correctly when current flag state is ON and environment state is OFF', async () => {
    jest.spyOn(useFeaturesMock, 'useGetFirstDisabledFeature').mockReturnValue({ featureEnabled: true })

    renderComponent({
      currentState: 'on',
      currentEnvironmentState: 'off'
    })

    expect(screen.getByTestId('flag-status-switch')).toBeChecked()
    expect(screen.getByText('cf.featureFlags.flagWillTurnOn')).toBeInTheDocument()
  })

  test('it should render tooltip and disable button when plan enforcement limits reached for free plan', async () => {
    jest.spyOn(useFeatureEnabled, 'default').mockReturnValue({
      enabledByPermission: true,
      enabledByPlanEnforcement: false,
      featureEnabled: false,
      canEdit: true,
      canToggle: true
    })

    renderComponent({
      disabled: true,
      currentState: 'on',
      currentEnvironmentState: 'off'
    })

    fireEvent.mouseOver(screen.getByTestId('flag-status-switch') as HTMLButtonElement)

    await waitFor(() => {
      expect(screen.getByText('cf.planEnforcement.upgradeRequiredMau')).toBeInTheDocument()
      expect(screen.getByTestId('flag-status-switch')).toBeDisabled()
    })
  })
})
