/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, findByText } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import { FreezeWindowContext } from '@freeze-windows/context/FreezeWindowContext'
import { DrawerTypes } from '@freeze-windows/context/FreezeWidowActions'
import { RightBar } from '../RightBar/RightBar'
import { defaultContext } from './helper'

export const accountId = 'accountId'
export const projectIdentifier = 'project1'
export const orgIdentifier = 'default'

describe('Freeze Window Studio - Right Bar', () => {
  test('it should render in closed state', async () => {
    const updateFreeze = jest.fn()
    const setDrawerType = jest.fn()
    const { getByRole } = render(
      <TestWrapper
        path="/account/:accountId/:module/orgs/:orgIdentifier/projects/:projectIdentifier/setup/freeze-window-studio/window/:windowIdentifier/"
        pathParams={{ projectIdentifier, orgIdentifier, accountId, module: 'cd', windowIdentifier: '-1' }}
      >
        <FreezeWindowContext.Provider
          value={{
            ...defaultContext,
            drawerType: '',
            updateFreeze,
            setDrawerType
          }}
        >
          <RightBar />
        </FreezeWindowContext.Provider>
      </TestWrapper>
    )

    expect(document.body.getElementsByClassName('rightBar')[0]).toMatchSnapshot('closed state of Right Bar')

    await userEvent.click(getByRole('button', { name: 'rbac.notifications.pipelineName' }))
    expect(setDrawerType).toHaveBeenCalledWith(DrawerTypes.Notification)
  })
  test('it should render in open state of Notifications', async () => {
    const updateFreeze = jest.fn()
    const setDrawerType = jest.fn()
    render(
      <TestWrapper
        path="/account/:accountId/:module/orgs/:orgIdentifier/projects/:projectIdentifier/setup/freeze-window-studio/window/:windowIdentifier/"
        pathParams={{ projectIdentifier, orgIdentifier, accountId, module: 'cd', windowIdentifier: '-1' }}
      >
        <FreezeWindowContext.Provider
          value={{
            ...defaultContext,
            drawerType: DrawerTypes.Notification,
            updateFreeze,
            setDrawerType
          }}
        >
          <RightBar />
        </FreezeWindowContext.Provider>
      </TestWrapper>
    )

    expect(document.body.getElementsByClassName('rightBar')[0]).toMatchSnapshot('open state')
    expect(document.body.getElementsByClassName('almostFullScreenPortal')[0]).toMatchSnapshot('open state')

    const closeBtn = document.getElementsByClassName('almostFullScreenCloseBtn')[0]
    expect(closeBtn).toBeInTheDocument()
    await userEvent.click(closeBtn)
    expect(setDrawerType).toHaveBeenCalledWith()
  })

  test('it should render Text area in Notifications wizard', async () => {
    const { getByText } = render(
      <TestWrapper
        path="/account/:accountId/:module/orgs/:orgIdentifier/projects/:projectIdentifier/setup/freeze-window-studio/window/:windowIdentifier/"
        pathParams={{ projectIdentifier, orgIdentifier, accountId, module: 'cd', windowIdentifier: '-1' }}
      >
        <FreezeWindowContext.Provider
          value={{
            ...defaultContext,
            drawerType: DrawerTypes.Notification
          }}
        >
          <RightBar />
        </FreezeWindowContext.Provider>
      </TestWrapper>
    )

    const notifyBtn = getByText('rbac.notifications.pipelineName')
    expect(notifyBtn).toBeInTheDocument()
    await userEvent.click(notifyBtn)

    const notificationBtn = document.getElementsByClassName('bp3-drawer')[0].querySelector('#newNotificationBtn')
    await userEvent.click(notificationBtn!)

    //Notification Wizard
    const notificationWizard = findDialogContainer()
    fireEvent.change(notificationWizard!.querySelector('input[name="name"]')!, {
      target: { value: 'testNotification' }
    })
    expect(notificationWizard?.querySelector('input[name="name"]')).toHaveValue('testNotification')
    await userEvent.click(await findByText(notificationWizard!, 'continue'))

    expect(
      await findByText(notificationWizard!, 'freezeWindows.freezeNotifications.rejectedDeployments')
    ).toBeInTheDocument()

    //check if text area is in document
    expect(notificationWizard?.querySelector('textarea[name="customizedMessage"]')).toBeInTheDocument()
  })
})
