/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { renderHook } from '@testing-library/react-hooks'
import { act } from 'react-dom/test-utils'
import { getLoginPageURL, useLogout } from '../SessionUtils'

const mockHistoryPush = jest.fn()
// eslint-disable-next-line jest-no-mock
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: mockHistoryPush
  })
}))

describe('Session Utils', () => {
  test('getLoginPageUrl with CG login', () => {
    window.HARNESS_ENABLE_NG_AUTH_UI = false
    expect(getLoginPageURL({})).toBe('/#/login?action=signout')
    expect(getLoginPageURL({ returnUrl: window.location.href })).toBe(
      '/#/login?action=signout&returnUrl=http%3A%2F%2Flocalhost%2F'
    )
  })

  test('getLoginPageUrl with NG Auth UI', () => {
    window.HARNESS_ENABLE_NG_AUTH_UI = true
    expect(getLoginPageURL({ returnUrl: window.location.href })).toBe(
      '/auth/#/signin?action=signout&returnUrl=http%3A%2F%2Flocalhost%2F'
    )
    expect(getLoginPageURL({})).toBe('/auth/#/signin?action=signout')
  })

  test('useLogout', () => {
    window.HARNESS_ENABLE_NG_AUTH_UI = false
    const { result } = renderHook(() => useLogout())
    expect(typeof result.current.forceLogout).toBe('function')
    act(() => {
      result.current.forceLogout()
    })
    expect(mockHistoryPush).toBeCalledTimes(1)
    expect(mockHistoryPush).toBeCalledWith({
      pathname: '/redirect',
      search: '?returnUrl=%2F%23%2Flogin%3Faction%3Dsignout%26returnUrl%3Dhttp%253A%252F%252Flocalhost%252F'
    })

    act(() => {
      result.current.forceLogout()
    })
    expect(mockHistoryPush).toBeCalledTimes(1)
  })
})
