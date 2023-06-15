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
import { mockResponse, loginSettings } from '@auth-settings/pages/Configuration/__test__/mock'
import PasswordStrength from '../PasswordStrength'

jest.mock('services/cd-ng', () => ({
  updateLoginSettings: jest.fn().mockImplementation(() => {
    return { mutate: () => Promise.resolve(mockResponse) }
  }),
  usePutLoginSettings: jest.fn().mockImplementation(() => {
    return { mutate: () => Promise.resolve(mockResponse) }
  }),
  onSuccess: jest.fn()
}))

const refetchAuthSettings = jest.fn()
const setUpdating = jest.fn()

const disablePasswordSettings = {
  ...loginSettings,
  passwordStrengthPolicy: {
    ...loginSettings.passwordStrengthPolicy,
    enabled: false
  }
}

describe('PasswordStrength', () => {
  test('Disable password strength', async () => {
    const { getByTestId, container } = render(
      <TestWrapper
        path={routes.toAuthenticationSettings({ ...accountPathProps })}
        pathParams={{ accountId: 'testAcc' }}
      >
        <PasswordStrength
          loginSettings={loginSettings}
          refetchAuthSettings={refetchAuthSettings}
          canEdit
          setUpdating={setUpdating}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()

    const togglePasswordStrength = getByTestId('toggle-password-strength')
    act(() => {
      fireEvent.click(togglePasswordStrength)
    })

    await waitFor(() => queryByText(document.body, 'authSettings.disablePasswordStrength'))
    const confirmDisable = findDialogContainer()
    expect(confirmDisable).toBeTruthy()

    const confirmBtn = queryByText(confirmDisable!, 'confirm')
    await act(async () => {
      fireEvent.click(confirmBtn!)
    })

    expect(queryByText(document.body, 'authSettings.passwordStrengthDisabled')).toBeTruthy()
  }),
    test('Cancel enable password strength', async () => {
      const { getByTestId } = render(
        <TestWrapper
          path={routes.toAuthenticationSettings({ ...accountPathProps })}
          pathParams={{ accountId: 'testAcc' }}
        >
          <PasswordStrength
            loginSettings={disablePasswordSettings}
            refetchAuthSettings={refetchAuthSettings}
            canEdit
            setUpdating={setUpdating}
          />
        </TestWrapper>
      )

      const togglePasswordStrength = getByTestId('toggle-password-strength')
      act(() => {
        fireEvent.click(togglePasswordStrength)
      })

      await waitFor(() => queryByText(document.body, 'authSettings.passwordStrength'))
      const passwordStrengthForm = findDialogContainer()
      expect(passwordStrengthForm).toBeTruthy()

      const cancelButton = queryByText(passwordStrengthForm!, 'cancel')
      await act(async () => {
        fireEvent.click(cancelButton!)
      })

      expect(cancelButton).toMatchSnapshot()
    }),
    test('Enable password strength', async () => {
      const { getByTestId } = render(
        <TestWrapper
          path={routes.toAuthenticationSettings({ ...accountPathProps })}
          pathParams={{ accountId: 'testAcc' }}
        >
          <PasswordStrength
            loginSettings={disablePasswordSettings}
            refetchAuthSettings={refetchAuthSettings}
            canEdit
            setUpdating={setUpdating}
          />
        </TestWrapper>
      )

      const togglePasswordStrength = getByTestId('toggle-password-strength')
      act(() => {
        fireEvent.click(togglePasswordStrength)
      })

      await waitFor(() => queryByText(document.body, 'authSettings.passwordStrength'))
      const passwordStrengthForm = findDialogContainer()
      expect(passwordStrengthForm).toBeTruthy()

      const uppercaseCheckbox = queryByText(passwordStrengthForm!, 'authSettings.haveOneUppercase')
      const lowercaseCheckbox = queryByText(passwordStrengthForm!, 'authSettings.haveOneLowercase')
      const digitCheckbox = queryByText(passwordStrengthForm!, 'authSettings.haveOneDigit')
      const specialCharCheckbox = queryByText(passwordStrengthForm!, 'authSettings.haveOneSpecialChar')

      const saveButton = queryByText(passwordStrengthForm!, 'save')
      await act(async () => {
        fireEvent.click(uppercaseCheckbox!)
        fireEvent.click(lowercaseCheckbox!)
        fireEvent.click(digitCheckbox!)
        fireEvent.click(specialCharCheckbox!)
        fireEvent.click(saveButton!)
      })

      expect(queryAllByText(document.body, 'authSettings.passwordStrengthEnabled')).toBeTruthy()
    }),
    test('Update Password settings', async () => {
      const { getByTestId } = render(
        <TestWrapper
          path={routes.toAuthenticationSettings({ ...accountPathProps })}
          pathParams={{ accountId: 'testAcc' }}
        >
          <PasswordStrength
            loginSettings={loginSettings}
            refetchAuthSettings={refetchAuthSettings}
            canEdit
            setUpdating={setUpdating}
          />
        </TestWrapper>
      )

      const updatePasswordStrength = getByTestId('updatePasswordSettings')
      act(() => {
        fireEvent.click(updatePasswordStrength)
      })

      await waitFor(() => queryByText(document.body, 'authSettings.passwordStrength'))
      const passwordStrengthForm = findDialogContainer()
      expect(passwordStrengthForm).toBeTruthy()

      const saveButton = queryByText(passwordStrengthForm!, 'save')
      await act(async () => {
        fireEvent.click(saveButton!)
      })

      expect(queryAllByText(document.body, 'authSettings.passwordStrengthEnabled')).toBeTruthy()
    })
})
