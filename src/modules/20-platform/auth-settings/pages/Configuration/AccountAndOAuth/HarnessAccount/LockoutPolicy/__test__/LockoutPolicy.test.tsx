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
import LockoutPolicy from '../LockoutPolicy'

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

const disabledLockoutPolicy = {
  ...loginSettings,
  userLockoutPolicy: {
    ...loginSettings.userLockoutPolicy,
    enableLockoutPolicy: false
  }
}

describe('LockoutPolicy', () => {
  test('Disable lockout policy', async () => {
    const { getByTestId, container } = render(
      <TestWrapper
        path={routes.toAuthenticationSettings({ ...accountPathProps })}
        pathParams={{ accountId: 'testAcc' }}
      >
        <LockoutPolicy
          loginSettings={loginSettings}
          refetchAuthSettings={refetchAuthSettings}
          canEdit
          setUpdating={setUpdating}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()

    const toggleLockoutPolicy = getByTestId('toggle-lockout-policy')
    act(() => {
      fireEvent.click(toggleLockoutPolicy)
    })

    await waitFor(() => queryByText(document.body, 'authSettings.disableLockoutPolicy'))
    const confirmDisable = findDialogContainer()
    expect(confirmDisable).toBeTruthy()

    const confirmBtn = queryByText(confirmDisable!, 'confirm')
    await act(async () => {
      fireEvent.click(confirmBtn!)
    })

    expect(queryByText(document.body, 'authSettings.lockoutPolicyDisabled')).toBeTruthy()
  }),
    test('Cancel enable lockout policy', async () => {
      const { getByTestId } = render(
        <TestWrapper
          path={routes.toAuthenticationSettings({ ...accountPathProps })}
          pathParams={{ accountId: 'testAcc' }}
        >
          <LockoutPolicy
            loginSettings={disabledLockoutPolicy}
            refetchAuthSettings={refetchAuthSettings}
            canEdit
            setUpdating={setUpdating}
          />
        </TestWrapper>
      )

      const toggleLockoutPolicy = getByTestId('toggle-lockout-policy')
      act(() => {
        fireEvent.click(toggleLockoutPolicy)
      })

      await waitFor(() => queryByText(document.body, 'authSettings.lockoutPolicy'))
      const lockoutPolicyForm = findDialogContainer()
      expect(lockoutPolicyForm).toBeTruthy()

      const cancelButton = queryByText(lockoutPolicyForm!, 'cancel')
      await act(async () => {
        fireEvent.click(cancelButton!)
      })

      expect(cancelButton).toMatchSnapshot()
    }),
    test('Enable lockout policy', async () => {
      const { getByTestId } = render(
        <TestWrapper
          path={routes.toAuthenticationSettings({ ...accountPathProps })}
          pathParams={{ accountId: 'testAcc' }}
        >
          <LockoutPolicy
            loginSettings={disabledLockoutPolicy}
            refetchAuthSettings={refetchAuthSettings}
            canEdit
            setUpdating={setUpdating}
          />
        </TestWrapper>
      )

      const toggleLockoutPolicy = getByTestId('toggle-lockout-policy')
      act(() => {
        fireEvent.click(toggleLockoutPolicy)
      })

      await waitFor(() => queryByText(document.body, 'authSettings.lockoutPolicy'))
      const lockoutPolicyForm = findDialogContainer()
      expect(lockoutPolicyForm).toBeTruthy()

      const notifyUserCheckbox = queryByText(lockoutPolicyForm!, 'authSettings.notifyUsersWhenTheyLocked')

      const saveButton = queryByText(lockoutPolicyForm!, 'save')
      await act(async () => {
        fireEvent.click(notifyUserCheckbox!)
        fireEvent.click(saveButton!)
      })

      expect(queryAllByText(document.body, 'authSettings.lockoutPolicyEnabled')).toBeTruthy()
    }),
    test('Update LockoutPolicy', async () => {
      const { getByTestId } = render(
        <TestWrapper
          path={routes.toAuthenticationSettings({ ...accountPathProps })}
          pathParams={{ accountId: 'testAcc' }}
        >
          <LockoutPolicy
            loginSettings={loginSettings}
            refetchAuthSettings={refetchAuthSettings}
            canEdit
            setUpdating={setUpdating}
          />
        </TestWrapper>
      )

      const updateLockoutPolicy = getByTestId('update-lockout-policy')
      act(() => {
        fireEvent.click(updateLockoutPolicy)
      })

      await waitFor(() => queryByText(document.body, 'authSettings.lockoutPolicy'))
      const lockoutPolicyForm = findDialogContainer()
      expect(lockoutPolicyForm).toBeTruthy()

      const saveButton = queryByText(lockoutPolicyForm!, 'save')
      await act(async () => {
        fireEvent.click(saveButton!)
      })

      expect(queryAllByText(document.body, 'authSettings.lockoutPolicyEnabled')).toBeTruthy()
    })
})
