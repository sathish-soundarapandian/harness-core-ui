/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React from 'react'
import { render, act, fireEvent, waitFor, queryByText } from '@testing-library/react'
import { TestWrapper, findDialogContainer } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps } from '@common/utils/routeUtils'
import { mockResponse, authSettings } from '@auth-settings/pages/Configuration/__test__/mock'
import { AuthenticationMechanisms } from '@rbac/utils/utils'
import HarnessAccount from '../HarnessAccount'

jest.mock('services/cd-ng', () => ({
  useUpdateAuthMechanism: jest.fn().mockImplementation(() => {
    return { mutate: () => Promise.resolve(mockResponse) }
  }),
  usePutLoginSettings: jest.fn().mockImplementation(() => {
    return { mutate: () => Promise.resolve(mockResponse) }
  }),
  useSetTwoFactorAuthAtAccountLevel: jest.fn().mockImplementation(() => {
    return { mutate: () => Promise.resolve(mockResponse) }
  })
}))

const refetchAuthSettings = jest.fn()
const submitUserPasswordUpdate = jest.fn()
const setUpdating = jest.fn()
const updatingAuthMechanism = false

const disabledUserPasswordLogin = {
  ...authSettings,
  authenticationMechanism: AuthenticationMechanisms.OAUTH
}

const disabledOauthLogin = {
  ...authSettings,
  ngAuthSettings: authSettings.ngAuthSettings.filter(
    settings => settings.settingsType !== AuthenticationMechanisms.OAUTH
  )
}

describe('HarnessAccount', () => {
  test('Disable login via Username-Password', async () => {
    const { getByTestId, container } = render(
      <TestWrapper
        path={routes.toAuthenticationSettings({ ...accountPathProps })}
        pathParams={{ accountId: 'testAcc' }}
      >
        <HarnessAccount
          authSettings={authSettings}
          refetchAuthSettings={refetchAuthSettings}
          submitUserPasswordUpdate={submitUserPasswordUpdate}
          updatingAuthMechanism={updatingAuthMechanism}
          canEdit
          setUpdating={setUpdating}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()

    const toggleUserPasswordLogin = getByTestId('toggle-user-password-login')
    act(() => {
      fireEvent.click(toggleUserPasswordLogin)
    })

    await waitFor(() => queryByText(document.body, 'authSettings.disableUserPasswordLogin'))
    const confirmDisable = findDialogContainer()
    expect(confirmDisable).toBeTruthy()

    const confirmBtn = queryByText(confirmDisable!, 'confirm')
    await act(async () => {
      fireEvent.click(confirmBtn!)
    })

    expect(submitUserPasswordUpdate).toBeCalled()
  }),
    test('Enable login via Username-Password', () => {
      const { getByTestId } = render(
        <TestWrapper
          path={routes.toAuthenticationSettings({ ...accountPathProps })}
          pathParams={{ accountId: 'testAcc' }}
        >
          <HarnessAccount
            authSettings={disabledUserPasswordLogin}
            refetchAuthSettings={refetchAuthSettings}
            submitUserPasswordUpdate={submitUserPasswordUpdate}
            updatingAuthMechanism={updatingAuthMechanism}
            canEdit
            setUpdating={setUpdating}
          />
        </TestWrapper>
      )

      const toggleUserPasswordLogin = getByTestId('toggle-user-password-login')
      act(() => {
        fireEvent.click(toggleUserPasswordLogin)
      })

      expect(submitUserPasswordUpdate).toBeCalled()
    }),
    test('Enable at least one SSO before disabling login via Username-Password', () => {
      const { getByTestId } = render(
        <TestWrapper
          path={routes.toAuthenticationSettings({ ...accountPathProps })}
          pathParams={{ accountId: 'testAcc' }}
        >
          <HarnessAccount
            authSettings={disabledOauthLogin}
            refetchAuthSettings={refetchAuthSettings}
            submitUserPasswordUpdate={submitUserPasswordUpdate}
            updatingAuthMechanism={updatingAuthMechanism}
            canEdit
            setUpdating={setUpdating}
          />
        </TestWrapper>
      )

      const toggleUserPasswordLogin = getByTestId('toggle-user-password-login')
      act(() => {
        fireEvent.click(toggleUserPasswordLogin)
      })

      expect(
        queryByText(document.body, 'authSettings.enableAtLeastOneSsoBeforeDisablingUserPasswordLogin')
      ).toBeTruthy()
    })
})
