/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import * as roleAssignmentModal from '@rbac/modals/RoleAssignmentModal/useRoleAssignmentModal'
import * as cdServices from 'services/cd-ng'
import CFTrialHomePage from '../trialPage/CFTrialHomePage'

jest.mock('services/cd-ng', () => ({
  useStartTrialLicense: jest.fn().mockReturnValue({
    cancel: jest.fn(),
    loading: false,
    mutate: jest.fn().mockReturnValue({
      status: 'SUCCESS',
      data: {
        licenseType: 'TRIAL'
      }
    })
  }),
  useStartFreeLicense: jest.fn().mockReturnValue({
    cancel: jest.fn(),
    loading: false,
    mutate: jest.fn().mockReturnValue({
      status: 'SUCCESS',
      data: {
        licenseType: 'FREE'
      }
    })
  })
}))

const renderComponent = (defaultFlagValue?: any): RenderResult =>
  render(
    <TestWrapper
      pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      defaultFeatureFlagValues={defaultFlagValue}
    >
      <CFTrialHomePage />
    </TestWrapper>
  )

describe('CFTrialHomePage', () => {
  window.deploymentType = 'SAAS'
  const openRoleAssignmentModalMock = jest.fn()

  jest.spyOn(roleAssignmentModal, 'useRoleAssignmentModal').mockReturnValue({
    openRoleAssignmentModal: openRoleAssignmentModalMock
  } as any)

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('it should show Start Free Plan description if trial is not enabled', async () => {
    window.deploymentType = 'SAAS'
    renderComponent()
    expect(screen.getByText('cf.cfTrialHomePage.startFreePlanBtn')).toBeVisible()
  })

  test('it should show Start Free Plan page with corresponding for Developers descriptions if trial is not enabled', async () => {
    renderComponent()
    expect(screen.getByText('cf.cfTrialHomePage.forDevelopers.title')).toBeVisible()
    expect(screen.getByText('cf.cfTrialHomePage.forDevelopers.createFlag')).toBeVisible()
    expect(screen.getByText('cf.cfTrialHomePage.forDevelopers.shipCode')).toBeVisible()
    expect(screen.getByText('cf.cfTrialHomePage.forDevelopers.realTime')).toBeVisible()
  })

  test('it should show Start Free Plan page with corresponding for DevOps descriptions if trial is not enabled', async () => {
    renderComponent()
    expect(screen.getByText('cf.cfTrialHomePage.forDevOps.title')).toBeVisible()
    expect(screen.getByText('cf.cfTrialHomePage.forDevOps.automatedFeature')).toBeVisible()
    expect(screen.getByText('cf.cfTrialHomePage.forDevOps.avoidRollbacks')).toBeVisible()
    expect(screen.getByText('cf.cfTrialHomePage.forDevOps.scaleManagement')).toBeVisible()
  })

  test('it should try to open the Role Assignment modal when the Invite Developer button is clicked', async () => {
    renderComponent()

    expect(openRoleAssignmentModalMock).not.toHaveBeenCalled()

    userEvent.click(screen.getByText('cf.cfTrialHomePage.dontCode.inviteDeveloper'))

    await waitFor(() => {
      expect(openRoleAssignmentModalMock).toHaveBeenCalled()
    })
  })

  test('it should start free plan when Start Free Plan is clicked', async () => {
    const handleStartButtonClick = jest.fn()
    window.deploymentType = 'SAAS'
    jest.spyOn(cdServices, 'useStartFreeLicense').mockReturnValue({
      mutate: handleStartButtonClick,
      loading: false
    } as any)

    renderComponent()

    expect(handleStartButtonClick).not.toHaveBeenCalled()

    userEvent.click(screen.getByText('cf.cfTrialHomePage.startFreePlanBtn'))

    await waitFor(() => expect(handleStartButtonClick).toHaveBeenCalled())
  })

  test('it should start trial when Start 14 day FF Enterprise trial is clicked', async () => {
    const handleEnterpriseButtonClick = jest.fn()
    window.deploymentType = 'ON_PREM'
    jest.spyOn(cdServices, 'useStartTrialLicense').mockReturnValue({
      mutate: handleEnterpriseButtonClick,
      loading: false
    } as any)

    renderComponent()

    expect(handleEnterpriseButtonClick).not.toHaveBeenCalled()

    userEvent.click(screen.getByText('cf.cfTrialHomePage.startTrial.startBtn.description'))

    await waitFor(() => expect(handleEnterpriseButtonClick).toHaveBeenCalled())
  })
})
