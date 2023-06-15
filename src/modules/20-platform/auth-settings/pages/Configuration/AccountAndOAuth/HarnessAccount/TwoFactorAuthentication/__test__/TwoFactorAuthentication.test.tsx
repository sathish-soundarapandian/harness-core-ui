/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React from 'react'
import { render, act, fireEvent, waitFor, queryByText, queryAllByText } from '@testing-library/react'
import { TestWrapper, findDialogContainer } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps } from '@common/utils/routeUtils'
import { mockResponse } from '@auth-settings/pages/Configuration/__test__/mock'
import TwoFactorAuthentication from '../TwoFactorAuthentication'

jest.mock('services/cd-ng', () => ({
  useSetTwoFactorAuthAtAccountLevel: jest.fn().mockImplementation(() => {
    return { mutate: () => Promise.resolve(mockResponse) }
  })
}))

const refetchAuthSettings = jest.fn()
const setUpdating = jest.fn()

describe('Two Factor Authentication', () => {
  test('Redirect to UserProfile', async () => {
    const { getByTestId } = render(
      <TestWrapper
        path={routes.toAuthenticationSettings({ ...accountPathProps })}
        pathParams={{ accountId: 'testAcc' }}
      >
        <TwoFactorAuthentication
          twoFactorEnabled={false}
          onSuccess={refetchAuthSettings}
          canEdit
          setUpdating={setUpdating}
        />
      </TestWrapper>
    )

    const twoFAToggle = getByTestId('twoFA-toggle')
    act(() => {
      fireEvent.click(twoFAToggle!)
    })

    await waitFor(() => queryAllByText(document.body, 'authSettings.enforceTwoFA'))
    const confirmRedirectDialog = findDialogContainer()
    expect(confirmRedirectDialog).toBeTruthy()

    const goToSettingsBtn = queryByText(confirmRedirectDialog!, 'authSettings.goToSettings')
    await act(async () => {
      fireEvent.click(goToSettingsBtn!)
    })

    await waitFor(() => queryAllByText(document.body, 'authSettings.enforceTwoFA'))
    expect(findDialogContainer()).toBeFalsy()
  }),
    test('Disable Two Factor Authentication', async () => {
      const { getByTestId } = render(
        <TestWrapper
          path={routes.toAuthenticationSettings({ ...accountPathProps })}
          pathParams={{ accountId: 'testAcc' }}
        >
          <TwoFactorAuthentication twoFactorEnabled onSuccess={refetchAuthSettings} canEdit setUpdating={setUpdating} />
        </TestWrapper>
      )

      const twoFAToggle = getByTestId('twoFA-toggle')
      act(() => {
        fireEvent.click(twoFAToggle!)
      })

      await waitFor(() => queryAllByText(document.body, 'authSettings.disableTwoFAEnforcement'))
      const confirmDisableDialog = findDialogContainer()
      expect(confirmDisableDialog).toBeTruthy()

      const disableButton = queryByText(confirmDisableDialog!, 'confirm')
      await act(async () => {
        fireEvent.click(disableButton!)
      })

      expect(queryByText(document.body, 'authSettings.twoFAEnforcementDisabled')).toBeTruthy()
    })
})
