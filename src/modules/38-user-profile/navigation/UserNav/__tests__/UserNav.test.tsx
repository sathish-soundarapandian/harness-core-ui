/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import UserNav from '../UserNav'

let mockLogout = jest.fn()
jest.mock('services/portal', () => ({
  useLogout1: jest.fn().mockImplementation(() => ({ mutate: mockLogout }))
}))

describe('User Profile Page', () => {
  test('To Profile', () => {
    const renderObj = render(
      <TestWrapper path="/account/:accountId" pathParams={{ accountId: 'testAcc' }}>
        <UserNav />
      </TestWrapper>
    )
    const container = renderObj.container
    const getByTestId = renderObj.getByTestId
    const getByText = renderObj.getByText

    expect(container).toMatchSnapshot()

    const userProfile = getByText('profile')
    fireEvent.click(userProfile)
    expect(
      getByTestId('location').innerHTML.endsWith(
        routes.toUserProfile({
          accountId: 'testAcc'
        })
      )
    ).toBeTruthy()
  })

  test('Logout with no return url', async () => {
    mockLogout = jest.fn().mockReturnValue({ resource: { logoutUrl: undefined } })
    const { getByTestId } = render(
      <TestWrapper path="/account/:accountId" pathParams={{ accountId: 'testAcc' }}>
        <UserNav />
      </TestWrapper>
    )
    const logoutBtn = getByTestId('signout-link')
    userEvent.click(logoutBtn)

    expect(mockLogout).toBeCalled()
    await waitFor(() =>
      expect(getByTestId('location')).toHaveTextContent('/redirect?returnUrl=%2F%23%2Flogin%3Faction%3Dsignout')
    )
  })

  test('Logout with return url', async () => {
    delete (window as any).location
    window.location = {} as any
    const setHrefSpy = jest.fn(href => href)
    Object.defineProperty(window.location, 'href', {
      set: setHrefSpy
    })

    mockLogout = jest.fn().mockReturnValue({ resource: { logoutUrl: 'http://dummy.com' } })
    const { getByTestId } = render(
      <TestWrapper path="/account/:accountId" pathParams={{ accountId: 'testAcc' }}>
        <UserNav />
      </TestWrapper>
    )

    const logoutBtn = getByTestId('signout-link')
    userEvent.click(logoutBtn)

    expect(mockLogout).toBeCalled()
    await waitFor(() => expect(setHrefSpy).toHaveBeenCalledWith('http://dummy.com'))
  })
})
