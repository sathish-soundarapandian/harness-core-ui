/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render, waitFor } from '@testing-library/react'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import type { AuthenticationSettingsResponse } from 'services/cd-ng'
import * as cdngServices from 'services/cd-ng'
import { fillAtForm } from '@common/utils/JestFormHelper'
import LDAPProvider from '../LDAPProvider'
import {
  errorTestConnectionSettingsResponse,
  mockAuthSettingsResponse,
  mockAuthSettingsResponseWithoutLdap,
  permissionRequest,
  successTestConnectionSettingsResponse,
  testQuerySuccessFailure,
  testQuerySuccessResponse
} from './mock'
import {
  getConnectionFormFieldValues,
  getGroupQueryFormFieldValues,
  getUserQueryFormFieldValues
} from '../../__test__/mock'

const refetchAuthSettings = jest.fn()
const mockDispatch = jest.fn()
const mockGroupSync = jest.fn().mockReturnValue(Promise.resolve(true))
const mockLdapLoginTest = jest.fn().mockReturnValue(
  Promise.resolve({
    resource: {
      status: 'SUCCESS'
    }
  })
)
const mockLdapLoginTestFail = jest.fn().mockReturnValue(
  Promise.resolve({
    resource: {
      status: 'FAILURE',
      message: 'Invalid Credentials',
      responseMessages: [
        {
          code: 'HINT',
          level: 'INFO',
          message:
            'Please check user email, password entered for Ldap test/enable authentication for the configured Ldap settings',
          exception: null,
          failureTypes: []
        },
        {
          code: 'EXPLANATION',
          level: 'INFO',
          message: 'The email, password value supplied for the configured Ldap settings is incorrect',
          exception: null,
          failureTypes: []
        },
        {
          code: 'GENERAL_ERROR',
          level: 'ERROR',
          message: 'Issue with Ldap Test Authentication',
          exception: null,
          failureTypes: []
        }
      ]
    }
  })
)

const mockLdapLoginDelegateFailure = jest.fn().mockReturnValue(
  Promise.resolve({
    resource: {
      status: 'FAILURE',
      message: 'Delegate not found'
    }
  })
)

const mockUpdateAuthMechanism = jest.fn().mockReturnValue(
  Promise.resolve({
    resource: {
      status: 'SUCCESS'
    }
  })
)

const mockUpdateAuthMechanismFailure = jest.fn().mockReturnValue(
  Promise.resolve({
    responseMessages: [
      {
        message: 'Not Allowed'
      }
    ]
  })
)

describe('LDAP Provider', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  test('LDAP Provider Snapshot', async () => {
    const { container } = render(
      <TestWrapper pathParams={{ accountId: 'testAcc' }} defaultFeatureFlagValues={{ NG_ENABLE_LDAP_CHECK: true }}>
        <LDAPProvider
          authSettings={mockAuthSettingsResponse as AuthenticationSettingsResponse}
          canEdit={true}
          refetchAuthSettings={refetchAuthSettings}
          permissionRequest={permissionRequest}
          setUpdating={mockDispatch}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test('LDAP Provider Snapshot with no data', async () => {
    const { container } = render(
      <TestWrapper pathParams={{ accountId: 'testAcc' }} defaultFeatureFlagValues={{ NG_ENABLE_LDAP_CHECK: true }}>
        <LDAPProvider
          authSettings={[] as AuthenticationSettingsResponse}
          canEdit={true}
          refetchAuthSettings={refetchAuthSettings}
          permissionRequest={permissionRequest}
          setUpdating={mockDispatch}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test('LDAP Provider delete', async () => {
    jest
      .spyOn(cdngServices, 'useDeleteLdapSettings')
      .mockReturnValue({ mutate: jest.fn(() => Promise.resolve(true)) } as any)
    const { getByTestId, getByText } = render(
      <TestWrapper pathParams={{ accountId: 'testAcc' }} defaultFeatureFlagValues={{ NG_ENABLE_LDAP_CHECK: true }}>
        <LDAPProvider
          authSettings={mockAuthSettingsResponse as AuthenticationSettingsResponse}
          canEdit={true}
          refetchAuthSettings={refetchAuthSettings}
          permissionRequest={permissionRequest}
          setUpdating={mockDispatch}
        />
      </TestWrapper>
    )
    const ldapPopoverEl = getByTestId('provider-button')
    expect(ldapPopoverEl).not.toBeNull()
    act(() => {
      ldapPopoverEl && fireEvent.click(ldapPopoverEl)
    })
    await waitFor(() => getByTestId('ldap-popover-menu'))
    const deleteConfigBtn = getByTestId('ldap-delete-config')
    expect(deleteConfigBtn).not.toBeNull()

    await act(async () => {
      deleteConfigBtn && fireEvent.click(deleteConfigBtn)
    })
    await waitFor(() => getByText('confirm'))
    const confirmDeleteBtn = getByText('confirm')
    await act(async () => {
      confirmDeleteBtn && fireEvent.click(confirmDeleteBtn)
    })
    await waitFor(() => getByText('authSettings.ldapProviderDeleted'))
  })
  test('LDAP Provider enable config', async () => {
    jest.spyOn(cdngServices, 'usePostLdapAuthenticationTest').mockImplementation(
      () =>
        ({
          mutate: mockLdapLoginTest
        } as any)
    )
    jest.spyOn(cdngServices, 'useUpdateAuthMechanism').mockImplementation(
      () =>
        ({
          mutate: mockUpdateAuthMechanism
        } as any)
    )
    const { getByTestId, getByText } = render(
      <TestWrapper pathParams={{ accountId: 'testAcc' }} defaultFeatureFlagValues={{ NG_ENABLE_LDAP_CHECK: true }}>
        <LDAPProvider
          authSettings={mockAuthSettingsResponse as AuthenticationSettingsResponse}
          canEdit={true}
          refetchAuthSettings={refetchAuthSettings}
          permissionRequest={permissionRequest}
          setUpdating={mockDispatch}
        />
      </TestWrapper>
    )

    const testConfigBtn = getByTestId('ldap-config-test')
    act(() => {
      testConfigBtn && fireEvent.click(testConfigBtn)
    })
    await waitFor(() => expect(getByText('authSettings.ldap.verifyAndEnableConfig')).not.toBeNull())
    const enableLdapConfigBtn = getByTestId('enable-ldap-config')
    await act(async () => {
      enableLdapConfigBtn && fireEvent.click(enableLdapConfigBtn)
    })
    const emailField = document.querySelector('[name="email"]')
    const passwordField = document.querySelector('[name="password"]')
    await act(async () => {
      emailField && fireEvent.change(emailField, { target: { value: 'test@harness.io' } })
      passwordField && fireEvent.change(passwordField, { target: { value: 'test@1234' } })
    })
    await act(async () => {
      enableLdapConfigBtn && fireEvent.click(enableLdapConfigBtn)
    })
    await waitFor(() => expect(getByText('authSettings.ldap.authChangeSuccessful')).not.toBeNull())
  })
  test('LDAP Provider enable config test failure', async () => {
    jest.spyOn(cdngServices, 'usePostLdapAuthenticationTest').mockImplementation(
      () =>
        ({
          mutate: mockLdapLoginDelegateFailure
        } as any)
    )
    jest.spyOn(cdngServices, 'useUpdateAuthMechanism').mockImplementation(
      () =>
        ({
          mutate: mockUpdateAuthMechanism
        } as any)
    )
    const { getByTestId, getByText } = render(
      <TestWrapper pathParams={{ accountId: 'testAcc' }} defaultFeatureFlagValues={{ NG_ENABLE_LDAP_CHECK: true }}>
        <LDAPProvider
          authSettings={mockAuthSettingsResponse as AuthenticationSettingsResponse}
          canEdit={true}
          refetchAuthSettings={refetchAuthSettings}
          permissionRequest={permissionRequest}
          setUpdating={mockDispatch}
        />
      </TestWrapper>
    )

    const testConfigBtn = getByTestId('ldap-config-test')
    act(() => {
      testConfigBtn && fireEvent.click(testConfigBtn)
    })
    await waitFor(() => expect(getByText('authSettings.ldap.verifyAndEnableConfig')).not.toBeNull())
    const enableLdapConfigBtn = getByTestId('enable-ldap-config')
    await act(async () => {
      enableLdapConfigBtn && fireEvent.click(enableLdapConfigBtn)
    })
    const emailField = document.querySelector('[name="email"]')
    const passwordField = document.querySelector('[name="password"]')
    await act(async () => {
      emailField && fireEvent.change(emailField, { target: { value: 'test@harness.io' } })
      passwordField && fireEvent.change(passwordField, { target: { value: 'test@1234' } })
    })
    await act(async () => {
      enableLdapConfigBtn && fireEvent.click(enableLdapConfigBtn)
    })
    await waitFor(() => expect(getByText('Delegate not found')).not.toBeNull())
  })
  test('LDAP Provider enable config auth failure', async () => {
    jest.spyOn(cdngServices, 'usePostLdapAuthenticationTest').mockImplementation(
      () =>
        ({
          mutate: mockLdapLoginTest
        } as any)
    )
    jest.spyOn(cdngServices, 'useUpdateAuthMechanism').mockImplementation(
      () =>
        ({
          mutate: mockUpdateAuthMechanismFailure
        } as any)
    )
    const { getByTestId, getByText } = render(
      <TestWrapper pathParams={{ accountId: 'testAcc' }} defaultFeatureFlagValues={{ NG_ENABLE_LDAP_CHECK: true }}>
        <LDAPProvider
          authSettings={mockAuthSettingsResponse as AuthenticationSettingsResponse}
          canEdit={true}
          refetchAuthSettings={refetchAuthSettings}
          permissionRequest={permissionRequest}
          setUpdating={mockDispatch}
        />
      </TestWrapper>
    )

    const testConfigBtn = getByTestId('ldap-config-test')
    act(() => {
      testConfigBtn && fireEvent.click(testConfigBtn)
    })
    await waitFor(() => expect(getByText('authSettings.ldap.verifyAndEnableConfig')).not.toBeNull())
    const enableLdapConfigBtn = getByTestId('enable-ldap-config')
    await act(async () => {
      enableLdapConfigBtn && fireEvent.click(enableLdapConfigBtn)
    })
    const emailField = document.querySelector('[name="email"]')
    const passwordField = document.querySelector('[name="password"]')
    await act(async () => {
      emailField && fireEvent.change(emailField, { target: { value: 'test@harness.io' } })
      passwordField && fireEvent.change(passwordField, { target: { value: 'test@1234' } })
    })
    await act(async () => {
      enableLdapConfigBtn && fireEvent.click(enableLdapConfigBtn)
    })
    await waitFor(() => expect(getByText('Not Allowed')).not.toBeNull())
  })
  test('LDAP Provider test config', async () => {
    jest.spyOn(cdngServices, 'usePostLdapAuthenticationTest').mockImplementation(
      () =>
        ({
          mutate: mockLdapLoginTest
        } as any)
    )
    const { getByTestId, getByText, getAllByText } = render(
      <TestWrapper pathParams={{ accountId: 'testAcc' }} defaultFeatureFlagValues={{ NG_ENABLE_LDAP_CHECK: true }}>
        <LDAPProvider
          authSettings={mockAuthSettingsResponse as AuthenticationSettingsResponse}
          canEdit={true}
          refetchAuthSettings={refetchAuthSettings}
          permissionRequest={permissionRequest}
          setUpdating={mockDispatch}
        />
      </TestWrapper>
    )

    const testConfigBtn = getByTestId('ldap-config-test')
    act(() => {
      testConfigBtn && fireEvent.click(testConfigBtn)
    })
    await waitFor(() => expect(getByText('authSettings.ldap.verifyAndEnableConfig')).not.toBeNull())
    const testLdapConfigBtn = getByTestId('test-ldap-config')

    const emailField = document.querySelector('[name="email"]')
    const passwordField = document.querySelector('[name="password"]')
    await act(async () => {
      emailField && fireEvent.change(emailField, { target: { value: 'test@harness.io' } })
      passwordField && fireEvent.change(passwordField, { target: { value: 'test@1234' } })
    })
    await act(async () => {
      testLdapConfigBtn && fireEvent.click(testLdapConfigBtn)
    })
    await waitFor(() => expect(getAllByText('authSettings.ldap.ldapTestSuccessful')).toBeDefined())
  })
  test('LDAP Provider test config fail', async () => {
    jest.spyOn(cdngServices, 'usePostLdapAuthenticationTest').mockImplementation(
      () =>
        ({
          mutate: mockLdapLoginTestFail
        } as any)
    )
    const { getByTestId, getByText } = render(
      <TestWrapper pathParams={{ accountId: 'testAcc' }} defaultFeatureFlagValues={{ NG_ENABLE_LDAP_CHECK: true }}>
        <LDAPProvider
          authSettings={mockAuthSettingsResponse as AuthenticationSettingsResponse}
          canEdit={true}
          refetchAuthSettings={refetchAuthSettings}
          permissionRequest={permissionRequest}
          setUpdating={mockDispatch}
        />
      </TestWrapper>
    )

    const testConfigBtn = getByTestId('ldap-config-test')
    act(() => {
      testConfigBtn && fireEvent.click(testConfigBtn)
    })
    await waitFor(() => expect(getByText('authSettings.ldap.verifyAndEnableConfig')).not.toBeNull())
    const testLdapConfigBtn = getByTestId('test-ldap-config')

    const emailField = document.querySelector('[name="email"]')
    const passwordField = document.querySelector('[name="password"]')
    await act(async () => {
      emailField && fireEvent.change(emailField, { target: { value: 'test@harness.io' } })
      passwordField && fireEvent.change(passwordField, { target: { value: 'test@1234' } })
    })
    await act(async () => {
      testLdapConfigBtn && fireEvent.click(testLdapConfigBtn)
    })
    await waitFor(() => expect(getByText('Invalid Credentials')).not.toBeNull())
  })
  test('LDAP Provider group sync', async () => {
    jest.spyOn(cdngServices, 'syncLdapGroupsPromise').mockImplementation(() => mockGroupSync())
    const { getByTestId, getByText } = render(
      <TestWrapper pathParams={{ accountId: 'testAcc' }} defaultFeatureFlagValues={{ NG_ENABLE_LDAP_CHECK: true }}>
        <LDAPProvider
          authSettings={mockAuthSettingsResponse as AuthenticationSettingsResponse}
          canEdit={true}
          refetchAuthSettings={refetchAuthSettings}
          permissionRequest={permissionRequest}
          setUpdating={mockDispatch}
        />
      </TestWrapper>
    )
    const ldapPopoverEl = getByTestId('provider-button')
    expect(ldapPopoverEl).not.toBeNull()
    act(() => {
      ldapPopoverEl && fireEvent.click(ldapPopoverEl)
    })

    const triggerGroupSyncBtn = getByTestId('ldap-group-sync')
    expect(triggerGroupSyncBtn).not.toBeNull()
    act(() => {
      triggerGroupSyncBtn && fireEvent.click(triggerGroupSyncBtn)
    })
    await waitFor(() => expect(getByText('authSettings.ldap.syncUserGroupsResult.fail')).not.toBeNull())
  })
})

describe('LDAP setup Wizard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  test('Setup Wizard renders with Overview step in ADD mode', async () => {
    const { getByTestId, getByText } = render(
      <TestWrapper pathParams={{ accountId: 'testAcc' }} defaultFeatureFlagValues={{ NG_ENABLE_LDAP_CHECK: true }}>
        <LDAPProvider
          authSettings={mockAuthSettingsResponseWithoutLdap}
          canEdit={true}
          refetchAuthSettings={refetchAuthSettings}
          permissionRequest={permissionRequest}
          setUpdating={mockDispatch}
        />
      </TestWrapper>
    )
    const openLdapWizardLabel = getByText('authSettings.ldap.addLdap')
    await act(async () => {
      fireEvent.click(openLdapWizardLabel)
    })
    await waitFor(() => expect(getByTestId('close-ldap-setup-wizard')).toBeVisible())
    await act(async () => {
      fireEvent.click(getByTestId('cancel-overview-step'))
    })
    // Add LDAP config wizard disappears if user presses back on Overview step
    expect(findDialogContainer()).toBeNull()
    await act(async () => {
      fireEvent.click(openLdapWizardLabel)
    })
    await act(async () => {
      fireEvent.click(getByTestId('submit-overview-step'))
    })
    const wizardDialog = findDialogContainer()
    expect(wizardDialog).toMatchSnapshot()
  })

  test('Connection Settings step renders in LDAP wizard ADD mode ', async () => {
    const { getByTestId, getByText } = render(
      <TestWrapper pathParams={{ accountId: 'testAcc' }} defaultFeatureFlagValues={{ NG_ENABLE_LDAP_CHECK: true }}>
        <LDAPProvider
          authSettings={mockAuthSettingsResponseWithoutLdap}
          canEdit={true}
          refetchAuthSettings={refetchAuthSettings}
          permissionRequest={permissionRequest}
          setUpdating={mockDispatch}
        />
      </TestWrapper>
    )
    const openLdapWizardLabel = getByText('authSettings.ldap.addLdap')
    await act(async () => {
      fireEvent.click(openLdapWizardLabel)
    })
    await waitFor(() => expect(getByTestId('close-ldap-setup-wizard')).toBeVisible())

    const wizardDialog = findDialogContainer()
    const overviewDisplayNameEl = wizardDialog?.querySelector('[name="displayName"]')
    await act(async () => {
      overviewDisplayNameEl && fireEvent.change(overviewDisplayNameEl, { target: { value: 'LDAP0002' } })
    })

    await act(async () => {
      fireEvent.click(getByTestId('submit-overview-step'))
    })
    await act(async () => {
      fireEvent.click(getByTestId('submit-connection-step'))
    })
    expect(wizardDialog).toMatchSnapshot()
  })

  test('Connection Settings step works in LDAP wizard ADD mode ', async () => {
    jest.spyOn(cdngServices, 'useValidateLdapConnectionSettings').mockReturnValue({
      data: successTestConnectionSettingsResponse,
      loading: false,
      refetch: jest.fn().mockReturnValue(successTestConnectionSettingsResponse),
      mutate: jest.fn().mockReturnValue(successTestConnectionSettingsResponse),
      error: null
    } as any)

    const { getByTestId, getByText } = render(
      <TestWrapper pathParams={{ accountId: 'testAcc' }} defaultFeatureFlagValues={{ NG_ENABLE_LDAP_CHECK: true }}>
        <LDAPProvider
          authSettings={mockAuthSettingsResponseWithoutLdap}
          canEdit={true}
          refetchAuthSettings={refetchAuthSettings}
          permissionRequest={permissionRequest}
          setUpdating={mockDispatch}
        />
      </TestWrapper>
    )
    const openLdapWizardLabel = getByText('authSettings.ldap.addLdap')
    await act(async () => {
      fireEvent.click(openLdapWizardLabel)
    })
    await waitFor(() => expect(getByTestId('close-ldap-setup-wizard')).toBeVisible())

    const wizardDialog = findDialogContainer() as HTMLElement
    const overviewDisplayNameEl = wizardDialog?.querySelector('[name="displayName"]')
    await act(async () => {
      overviewDisplayNameEl && fireEvent.change(overviewDisplayNameEl, { target: { value: 'LDAP0002' } })
    })

    await act(async () => {
      fireEvent.click(getByTestId('submit-overview-step'))
    })
    await act(async () => {
      fireEvent.click(getByTestId('back-to-overview-step'))
    })
    /* Test data is retained for overview step */
    expect((wizardDialog?.querySelector('[name="displayName"]') as HTMLInputElement).value).toBe('LDAP0002')

    await act(async () => {
      fireEvent.click(getByTestId('submit-overview-step'))
    })

    fillAtForm(getConnectionFormFieldValues(wizardDialog))

    await act(async () => {
      fireEvent.click(getByText('common.smtp.testConnection'))
    })

    await waitFor(() => expect(getByText('common.test.connectionSuccessful')).not.toBeNull())

    await act(async () => {
      fireEvent.click(getByTestId('submit-connection-step'))
    })
    await waitFor(() => expect(getByTestId('back-to-connection-step')).toBeVisible())
    expect(wizardDialog).toMatchSnapshot()
    await act(async () => {
      fireEvent.click(getByTestId('back-to-connection-step'))
    })
    await waitFor(() => expect(getByTestId('submit-connection-step')).toBeVisible())
    expect((wizardDialog?.querySelector('[name="responseTimeout"]') as HTMLInputElement).value).toBe('7000')
  })
  test('Group Settings step works in LDAP wizard ADD mode ', async () => {
    jest.spyOn(cdngServices, 'useCreateLdapSettings').mockReturnValue({
      loading: false,
      refetch: jest.fn().mockReturnValue(testQuerySuccessResponse),
      mutate: jest.fn().mockReturnValue(testQuerySuccessResponse),
      error: null
    } as any)

    jest.spyOn(cdngServices, 'useValidateLdapUserSettings').mockReturnValue({
      loading: false,
      refetch: jest.fn().mockReturnValue(testQuerySuccessResponse),
      mutate: jest.fn().mockReturnValue(testQuerySuccessResponse),
      error: null
    } as any)

    jest.spyOn(cdngServices, 'useValidateLdapGroupSettings').mockReturnValue({
      loading: false,
      refetch: jest.fn().mockReturnValue(testQuerySuccessResponse),
      mutate: jest.fn().mockReturnValue(testQuerySuccessResponse),
      error: null
    } as any)

    const { getByTestId, getByText } = render(
      <TestWrapper pathParams={{ accountId: 'testAcc' }} defaultFeatureFlagValues={{ NG_ENABLE_LDAP_CHECK: true }}>
        <LDAPProvider
          authSettings={mockAuthSettingsResponseWithoutLdap}
          canEdit={true}
          refetchAuthSettings={refetchAuthSettings}
          permissionRequest={permissionRequest}
          setUpdating={mockDispatch}
        />
      </TestWrapper>
    )
    const openLdapWizardLabel = getByText('authSettings.ldap.addLdap')
    await act(async () => {
      fireEvent.click(openLdapWizardLabel)
    })
    await waitFor(() => expect(getByTestId('close-ldap-setup-wizard')).toBeVisible())

    const wizardDialog = findDialogContainer() as HTMLElement
    const overviewDisplayNameEl = wizardDialog?.querySelector('[name="displayName"]')
    await act(async () => {
      overviewDisplayNameEl && fireEvent.change(overviewDisplayNameEl, { target: { value: 'LDAP0002' } })
    })

    await act(async () => {
      fireEvent.click(getByTestId('submit-overview-step'))
    })

    fillAtForm(getConnectionFormFieldValues(wizardDialog))

    await act(async () => {
      fireEvent.click(getByTestId('submit-connection-step'))
    })
    await waitFor(() => expect(getByTestId('add-first-user-query-btn')).toBeVisible())
    expect(wizardDialog.querySelector("[data-testid='add-another-user-query-btn']")).toBeNull()

    await act(async () => {
      fireEvent.click(getByTestId('add-first-user-query-btn'))
    })

    fillAtForm(getUserQueryFormFieldValues(wizardDialog))

    await act(async () => {
      fireEvent.click(getByTestId('discard-query-btn'))
    })

    await waitFor(() => expect(getByTestId('add-first-user-query-btn')).toBeVisible())

    await act(async () => {
      fireEvent.click(getByTestId('add-first-user-query-btn'))
    })

    fillAtForm(getUserQueryFormFieldValues(wizardDialog))

    await waitFor(() => expect(getByTestId('test-user-query-btn')).toBeVisible())
    await act(async () => {
      fireEvent.click(getByTestId('test-user-query-btn'))
    })
    await waitFor(() => expect(getByText('authSettings.ldap.queryTestSuccessful')).toBeVisible())

    await act(async () => {
      fireEvent.click(getByTestId('commit-query-btn'))
    })

    expect(getByTestId('add-another-user-query-btn')).not.toBeDisabled()

    await act(async () => {
      fireEvent.click(getByTestId('add-another-user-query-btn'))
    })

    await act(async () => {
      fireEvent.click(getByTestId('discard-query-btn'))
    })

    expect(wizardDialog).toMatchSnapshot()

    expect(wizardDialog.querySelector("[data-testid='add-another-user-query-btn']")).not.toBeNull()

    await act(async () => {
      fireEvent.click(getByTestId('submit-usery-query-step'))
    })
    await waitFor(() => expect(getByTestId('submit-group-query-step')).toBeVisible())

    await act(async () => {
      fireEvent.click(getByTestId('back-to-user-query-step'))
    })

    expect(getByText('ou=Users,o=611a119873e7186e37f75599,dc=jumpcloud,dc=com')).toBeVisible()

    await act(async () => {
      fireEvent.click(getByTestId('submit-usery-query-step'))
    })

    const addFirstGroupQueryBtn = wizardDialog.querySelector('[data-testid="add-first-group-query-btn"')

    expect(addFirstGroupQueryBtn).toBeVisible()
    await act(async () => {
      addFirstGroupQueryBtn && fireEvent.click(addFirstGroupQueryBtn)
    })
    await waitFor(() => expect(getByTestId('commit-group-query-btn')).toBeVisible())

    fillAtForm(getGroupQueryFormFieldValues(wizardDialog))

    await waitFor(() => expect(getByTestId('test-group-query-btn')).toBeVisible())
    await act(async () => {
      fireEvent.click(getByTestId('test-group-query-btn'))
    })
    await waitFor(() => expect(getByText('authSettings.ldap.queryTestSuccessful')).toBeVisible())

    await act(async () => {
      fireEvent.click(getByTestId('commit-group-query-btn'))
    })
    expect(getByTestId('add-another-group-query-btn')).not.toBeDisabled()

    await act(async () => {
      fireEvent.click(getByTestId('add-another-group-query-btn'))
    })

    await act(async () => {
      fireEvent.click(getByTestId('discard-group-query-btn'))
    })

    await act(async () => {
      fireEvent.click(getByTestId('submit-group-query-step'))
    })
  })

  test('Queries persist after going to previous step and coming back', async () => {
    const { getByTestId, getByText } = render(
      <TestWrapper pathParams={{ accountId: 'testAcc' }} defaultFeatureFlagValues={{ NG_ENABLE_LDAP_CHECK: true }}>
        <LDAPProvider
          authSettings={mockAuthSettingsResponseWithoutLdap}
          canEdit={true}
          refetchAuthSettings={refetchAuthSettings}
          permissionRequest={permissionRequest}
          setUpdating={mockDispatch}
        />
      </TestWrapper>
    )
    const openLdapWizardLabel = getByText('authSettings.ldap.addLdap')
    await act(async () => {
      fireEvent.click(openLdapWizardLabel)
    })
    await waitFor(() => expect(getByTestId('close-ldap-setup-wizard')).toBeVisible())

    const wizardDialog = findDialogContainer() as HTMLElement
    const overviewDisplayNameEl = wizardDialog?.querySelector('[name="displayName"]')
    await act(async () => {
      overviewDisplayNameEl && fireEvent.change(overviewDisplayNameEl, { target: { value: 'LDAP0002' } })
    })

    await act(async () => {
      fireEvent.click(getByTestId('submit-overview-step'))
    })

    fillAtForm(getConnectionFormFieldValues(wizardDialog))

    await act(async () => {
      fireEvent.click(getByTestId('submit-connection-step'))
    })

    await act(async () => {
      fireEvent.click(getByTestId('add-first-user-query-btn'))
    })

    // There are no errors when form rendered at first
    expect(wizardDialog.querySelectorAll('.FormError--error').length).toEqual(0)

    await act(async () => {
      const testUserQueryBtn = wizardDialog.querySelector('[data-testid="test-user-query-btn"')
      testUserQueryBtn && fireEvent.click(testUserQueryBtn)
    })

    // The form shows errors when we try to test user query
    expect(wizardDialog.querySelectorAll('.FormError--error').length).toEqual(5)
    fillAtForm(getUserQueryFormFieldValues(wizardDialog))

    await act(async () => {
      fireEvent.click(getByTestId('commit-query-btn'))
    })

    await act(async () => {
      fireEvent.click(getByTestId('back-to-connection-step'))
    })

    await act(async () => {
      fireEvent.click(getByTestId('submit-connection-step'))
    })

    expect(getByText('ou=Users,o=611a119873e7186e37f75599,dc=jumpcloud,dc=com')).toBeVisible()

    await act(async () => {
      fireEvent.click(getByTestId('submit-usery-query-step'))
    })

    const addFirstGroupQueryBtn = wizardDialog.querySelector('[data-testid="add-first-group-query-btn"')

    await act(async () => {
      addFirstGroupQueryBtn && fireEvent.click(addFirstGroupQueryBtn)
    })

    // There are no errors when form rendered at first
    expect(wizardDialog.querySelectorAll('.FormError--error').length).toEqual(0)

    await act(async () => {
      const testGroupQueryBtn = wizardDialog.querySelector('[data-testid="test-group-query-btn"')
      testGroupQueryBtn && fireEvent.click(testGroupQueryBtn)
    })

    // The form shows errors when we try to test user query
    expect(wizardDialog.querySelectorAll('.FormError--error').length).toEqual(4)

    fillAtForm(getGroupQueryFormFieldValues(wizardDialog))

    await act(async () => {
      fireEvent.click(getByTestId('commit-group-query-btn'))
    })

    expect(getByText('authSettings.ldap.descriptionAttributes:')).toBeVisible()

    await act(async () => {
      fireEvent.click(getByTestId('back-to-user-query-step'))
    })

    expect(getByText('ou=Users,o=611a119873e7186e37f75599,dc=jumpcloud,dc=com')).toBeVisible()

    await act(async () => {
      fireEvent.click(getByTestId('submit-usery-query-step'))
    })

    expect(getByText('authSettings.ldap.descriptionAttributes:')).toBeVisible()
  })
})

describe('LDAP Wizard in edit mode', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  test('Check for wizard rendering in edit mode and overview', async () => {
    jest.spyOn(cdngServices, 'useValidateLdapConnectionSettings').mockReturnValue({
      data: errorTestConnectionSettingsResponse,
      loading: false,
      refetch: jest.fn().mockReturnValue(errorTestConnectionSettingsResponse),
      mutate: jest.fn().mockReturnValue(errorTestConnectionSettingsResponse),
      error: null
    } as any)

    jest.spyOn(cdngServices, 'useValidateLdapUserSettings').mockReturnValue({
      loading: false,
      refetch: jest.fn().mockReturnValue(testQuerySuccessResponse),
      mutate: jest.fn().mockReturnValue(testQuerySuccessResponse),
      error: null
    } as any)

    jest.spyOn(cdngServices, 'useValidateLdapGroupSettings').mockReturnValue({
      loading: false,
      refetch: jest.fn().mockReturnValue(testQuerySuccessResponse),
      mutate: jest.fn().mockReturnValue(testQuerySuccessResponse),
      error: null
    } as any)

    jest.spyOn(cdngServices, 'useUpdateLdapSettings').mockReturnValue({
      loading: false,
      refetch: jest.fn().mockReturnValue(testQuerySuccessResponse),
      mutate: jest.fn().mockReturnValue(testQuerySuccessResponse),
      error: null
    } as any)

    const { container, getByTestId, getByText, getAllByTestId } = render(
      <TestWrapper pathParams={{ accountId: 'testAcc' }} defaultFeatureFlagValues={{ NG_ENABLE_LDAP_CHECK: true }}>
        <LDAPProvider
          authSettings={mockAuthSettingsResponse as AuthenticationSettingsResponse}
          canEdit={true}
          refetchAuthSettings={refetchAuthSettings}
          permissionRequest={permissionRequest}
          setUpdating={mockDispatch}
        />
      </TestWrapper>
    )
    const ldapPopoverEl = getByTestId('provider-button')
    expect(ldapPopoverEl).not.toBeNull()
    await act(async () => {
      ldapPopoverEl && fireEvent.click(ldapPopoverEl)
    })
    await waitFor(() => expect(getByTestId('ldap-edit-config')).toBeVisible())
    await act(async () => {
      fireEvent.click(getByTestId('ldap-edit-config'))
    })
    await waitFor(() => expect(getByTestId('close-ldap-edit-wizard')).toBeVisible())
    const wizardDialog = findDialogContainer()
    expect((wizardDialog?.querySelector('[name="displayName"]') as HTMLInputElement).value).toBe('ldap11223355')

    await act(async () => {
      fireEvent.click(getByTestId('submit-overview-step'))
    })

    await act(async () => {
      fireEvent.click(getByText('common.smtp.testConnection'))
    })

    const crossIcon = document.querySelector('[class*="bp3-icon-cross"]')
    expect(crossIcon).toBeTruthy()

    await act(async () => {
      fireEvent.click(getByTestId('submit-connection-step'))
    })
    await waitFor(() => expect(getByTestId('edit-user-query-btn')).toBeVisible())
    await act(async () => {
      fireEvent.click(getByTestId('edit-user-query-btn'))
    })
    await waitFor(() => expect(getByTestId('test-user-query-btn')).toBeVisible())
    await act(async () => {
      fireEvent.click(getByTestId('test-user-query-btn'))
    })
    await waitFor(() => expect(getByText('authSettings.ldap.queryTestSuccessful')).toBeVisible())
    await act(async () => {
      fireEvent.click(getByTestId('discard-query-btn'))
    })
    await waitFor(() => expect(getByTestId('edit-user-query-btn')).toBeVisible())
    await act(async () => {
      fireEvent.click(getByTestId('add-another-user-query-btn'))
    })
    await waitFor(() => expect(getByTestId('commit-query-btn')).toBeVisible())
    wizardDialog && fillAtForm(getUserQueryFormFieldValues(wizardDialog))
    expect(getByTestId('add-another-user-query-btn')).toBeDisabled()
    await act(async () => {
      fireEvent.click(getByTestId('commit-query-btn'))
    })
    await waitFor(() => expect(getAllByTestId('delete-user-query-btn').length).toEqual(2))
    await act(async () => {
      fireEvent.click(getAllByTestId('delete-user-query-btn')[0])
    })
    await waitFor(() => expect(getAllByTestId('delete-user-query-btn').length).toEqual(1))
    await act(async () => {
      fireEvent.click(getByTestId('submit-usery-query-step'))
    })

    /* Group Query Step tests start here */

    await waitFor(() => expect(getByTestId('edit-group-query-btn')).toBeVisible())
    await act(async () => {
      fireEvent.click(getByTestId('edit-group-query-btn'))
    })
    await waitFor(() => expect(getByTestId('test-group-query-btn')).toBeVisible())
    await act(async () => {
      fireEvent.click(getByTestId('test-group-query-btn'))
    })
    await waitFor(() => expect(getByText('authSettings.ldap.queryTestSuccessful')).toBeVisible())
    await act(async () => {
      fireEvent.click(getByTestId('discard-group-query-btn'))
    })
    await waitFor(() => expect(getByTestId('edit-group-query-btn')).toBeVisible())
    await act(async () => {
      fireEvent.click(getByTestId('add-another-group-query-btn'))
    })
    await waitFor(() => expect(getByTestId('commit-group-query-btn')).toBeVisible())
    wizardDialog && fillAtForm(getGroupQueryFormFieldValues(wizardDialog))
    expect(getByTestId('add-another-group-query-btn')).toBeDisabled()
    await act(async () => {
      fireEvent.click(getByTestId('commit-group-query-btn'))
    })
    await waitFor(() => expect(getAllByTestId('delete-group-query-btn').length).toEqual(2))
    await act(async () => {
      fireEvent.click(getAllByTestId('delete-group-query-btn')[0])
    })
    await waitFor(() => expect(getAllByTestId('delete-group-query-btn').length).toEqual(1))
    await act(async () => {
      fireEvent.click(getByTestId('submit-group-query-step'))
    })
    expect(container).toMatchSnapshot()
  })

  test('Check for wizard rendering in edit mode and query test failure', async () => {
    jest.spyOn(cdngServices, 'useValidateLdapConnectionSettings').mockReturnValue({
      data: errorTestConnectionSettingsResponse,
      loading: false,
      refetch: jest.fn().mockReturnValue(errorTestConnectionSettingsResponse),
      mutate: jest.fn().mockReturnValue(errorTestConnectionSettingsResponse),
      error: null
    } as any)

    jest.spyOn(cdngServices, 'useValidateLdapUserSettings').mockReturnValue({
      loading: false,
      refetch: jest.fn().mockReturnValue(testQuerySuccessFailure),
      mutate: jest.fn().mockReturnValue(testQuerySuccessFailure),
      error: null
    } as any)

    jest.spyOn(cdngServices, 'useValidateLdapGroupSettings').mockReturnValue({
      loading: false,
      refetch: jest.fn().mockReturnValue(testQuerySuccessFailure),
      mutate: jest.fn().mockReturnValue(testQuerySuccessFailure),
      error: null
    } as any)

    jest.spyOn(cdngServices, 'useUpdateLdapSettings').mockReturnValue({
      loading: false,
      refetch: jest.fn().mockReturnValue(testQuerySuccessFailure),
      mutate: jest.fn().mockReturnValue(testQuerySuccessFailure),
      error: null
    } as any)

    const { container, getByTestId, getByText } = render(
      <TestWrapper pathParams={{ accountId: 'testAcc' }} defaultFeatureFlagValues={{ NG_ENABLE_LDAP_CHECK: true }}>
        <LDAPProvider
          authSettings={mockAuthSettingsResponse as AuthenticationSettingsResponse}
          canEdit={true}
          refetchAuthSettings={refetchAuthSettings}
          permissionRequest={permissionRequest}
          setUpdating={mockDispatch}
        />
      </TestWrapper>
    )
    const ldapPopoverEl = getByTestId('provider-button')
    expect(ldapPopoverEl).not.toBeNull()
    await act(async () => {
      ldapPopoverEl && fireEvent.click(ldapPopoverEl)
    })
    await waitFor(() => expect(getByTestId('ldap-edit-config')).toBeVisible())
    await act(async () => {
      fireEvent.click(getByTestId('ldap-edit-config'))
    })
    await waitFor(() => expect(getByTestId('close-ldap-edit-wizard')).toBeVisible())

    await act(async () => {
      fireEvent.click(getByTestId('submit-overview-step'))
    })

    await act(async () => {
      fireEvent.click(getByTestId('submit-connection-step'))
    })
    await waitFor(() => expect(getByTestId('edit-user-query-btn')).toBeVisible())
    await act(async () => {
      fireEvent.click(getByTestId('edit-user-query-btn'))
    })
    await waitFor(() => expect(getByTestId('test-user-query-btn')).toBeVisible())
    await act(async () => {
      fireEvent.click(getByTestId('test-user-query-btn'))
    })
    await waitFor(() => expect(getByText('Query failed.')).toBeVisible())
    await act(async () => {
      fireEvent.click(getByTestId('discard-query-btn'))
    })

    await act(async () => {
      fireEvent.click(getByTestId('submit-usery-query-step'))
    })

    /* Group Query Step tests start here */

    await waitFor(() => expect(getByTestId('edit-group-query-btn')).toBeVisible())
    await act(async () => {
      fireEvent.click(getByTestId('edit-group-query-btn'))
    })
    await waitFor(() => expect(getByTestId('test-group-query-btn')).toBeVisible())
    await act(async () => {
      fireEvent.click(getByTestId('test-group-query-btn'))
    })
    await waitFor(() => expect(getByText('Query failed.')).toBeVisible())
    await act(async () => {
      fireEvent.click(getByTestId('discard-group-query-btn'))
    })
    await act(async () => {
      fireEvent.click(getByTestId('submit-group-query-step'))
    })
    expect(container).toMatchSnapshot()
  })
})
