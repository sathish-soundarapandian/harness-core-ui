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
import PasswordExpire from '../PasswordExpire'

jest.mock('services/cd-ng', () => ({
  updateLoginSettings: jest.fn().mockImplementation(() => {
    return { mutate: () => Promise.resolve(mockResponse) }
  }),
  usePutLoginSettings: jest.fn().mockImplementation(() => {
    return { mutate: () => Promise.resolve(mockResponse) }
  })
}))

const refetchAuthSettings = jest.fn()
const setUpdating = jest.fn()

const disablePasswordExpire = {
  ...loginSettings,
  passwordExpirationPolicy: {
    ...loginSettings.passwordExpirationPolicy,
    enabled: false
  }
}

describe('PasswordExpire', () => {
  test('Disable password Expire', async () => {
    const { getByTestId, container } = render(
      <TestWrapper
        path={routes.toAuthenticationSettings({ ...accountPathProps })}
        pathParams={{ accountId: 'testAcc' }}
      >
        <PasswordExpire
          loginSettings={loginSettings}
          refetchAuthSettings={refetchAuthSettings}
          canEdit
          setUpdating={setUpdating}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()

    const togglePasswordExpire = getByTestId('toggle-password-expire')
    act(() => {
      fireEvent.click(togglePasswordExpire)
    })

    await waitFor(() => queryByText(document.body, 'authSettings.disablePasswordExpiration'))
    const confirmDisable = findDialogContainer()
    expect(confirmDisable).toBeTruthy()

    const confirmBtn = queryByText(confirmDisable!, 'confirm')
    await act(async () => {
      fireEvent.click(confirmBtn!)
    })

    expect(queryByText(document.body, 'authSettings.passwordExpirationDisabled')).toBeTruthy()
  }),
    test('Cancel enable password Expire', async () => {
      const { getByTestId } = render(
        <TestWrapper
          path={routes.toAuthenticationSettings({ ...accountPathProps })}
          pathParams={{ accountId: 'testAcc' }}
        >
          <PasswordExpire
            loginSettings={disablePasswordExpire}
            refetchAuthSettings={refetchAuthSettings}
            canEdit
            setUpdating={setUpdating}
          />
        </TestWrapper>
      )

      const togglePasswordExpire = getByTestId('toggle-password-expire')
      act(() => {
        fireEvent.click(togglePasswordExpire)
      })

      await waitFor(() => queryByText(document.body, 'authSettings.passwordExpiration'))
      const passwordExpireForm = findDialogContainer()
      expect(passwordExpireForm).toBeTruthy()

      const cancelButton = queryByText(passwordExpireForm!, 'cancel')
      await act(async () => {
        fireEvent.click(cancelButton!)
      })

      expect(cancelButton).toMatchSnapshot()
    }),
    test('Enable password Expire', async () => {
      const { getByTestId } = render(
        <TestWrapper
          path={routes.toAuthenticationSettings({ ...accountPathProps })}
          pathParams={{ accountId: 'testAcc' }}
        >
          <PasswordExpire
            loginSettings={disablePasswordExpire}
            refetchAuthSettings={refetchAuthSettings}
            canEdit
            setUpdating={setUpdating}
          />
        </TestWrapper>
      )

      const togglePasswordExpire = getByTestId('toggle-password-expire')
      act(() => {
        fireEvent.click(togglePasswordExpire)
      })

      await waitFor(() => queryByText(document.body, 'authSettings.passwordExpiration'))
      const passwordExpireForm = findDialogContainer()
      expect(passwordExpireForm).toBeTruthy()

      const saveButton = queryByText(passwordExpireForm!, 'save')
      await act(async () => {
        fireEvent.click(saveButton!)
      })

      expect(queryAllByText(document.body, 'authSettings.passwordExpirationEnabled')).toBeTruthy()
    }),
    test('Update PasswordExpire settings', async () => {
      const { getByTestId } = render(
        <TestWrapper
          path={routes.toAuthenticationSettings({ ...accountPathProps })}
          pathParams={{ accountId: 'testAcc' }}
        >
          <PasswordExpire
            loginSettings={loginSettings}
            refetchAuthSettings={refetchAuthSettings}
            canEdit
            setUpdating={setUpdating}
          />
        </TestWrapper>
      )

      const updatePasswordExpire = getByTestId('update-password-expire-settings')
      act(() => {
        fireEvent.click(updatePasswordExpire)
      })

      await waitFor(() => queryByText(document.body, 'authSettings.passwordExpiration'))
      const passwordExpireForm = findDialogContainer()
      expect(passwordExpireForm).toBeTruthy()

      const saveButton = queryByText(passwordExpireForm!, 'save')
      await act(async () => {
        fireEvent.click(saveButton!)
      })

      expect(queryAllByText(document.body, 'authSettings.passwordExpirationEnabled')).toBeTruthy()
    })
})
