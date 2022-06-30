/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { TestWrapper } from '@common/utils/testUtils'
import * as useFeatureEnabledMock from '@cf/pages/feature-flags-detail/targeting-rules-tab/hooks/useFeatureEnabled'
import DisabledFeatureTooltip from '../DisabledFeatureTooltip'

const renderComponent = (): void => {
  render(
    <TestWrapper
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags"
      pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
    >
      <DisabledFeatureTooltip />
    </TestWrapper>
  )
}

describe('DisabledFeatureTooltip', () => {
  test('it should return RBAC Tooltip when user does not have permission', async () => {
    jest.spyOn(useFeatureEnabledMock, 'default').mockReturnValue({
      enabledByPlanEnforcement: true,
      enabledByPermission: false,
      featureEnabled: false,
      canToggle: true,
      canEdit: false
    })

    renderComponent()

    fireEvent.mouseOver(screen.getByTestId('disabled-feature-tooltip'))

    await waitFor(() => expect(screen.getByText(/rbac.youAreMissingTheFollowingPermission/)).toBeInTheDocument())
  })

  test('it should return Plan Enforcement tooltip for free plans when feature disabled', async () => {
    jest.spyOn(useFeatureEnabledMock, 'default').mockReturnValue({
      enabledByPlanEnforcement: false,
      enabledByPermission: true,
      featureEnabled: false,
      canEdit: true,
      canToggle: true
    })

    renderComponent()

    fireEvent.mouseOver(screen.getByTestId('disabled-feature-tooltip'))

    await waitFor(() => expect(screen.getByText('cf.planEnforcement.upgradeRequiredMau')).toBeInTheDocument())
  })
})
