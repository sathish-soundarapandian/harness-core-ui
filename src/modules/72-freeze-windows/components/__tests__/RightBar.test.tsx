/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
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

    userEvent.click(getByRole('button', { name: 'notifications.pipelineName' }))
    expect(setDrawerType).toHaveBeenCalledWith(DrawerTypes.Notification)
  })
  test('it should render in open state of Notifications', async () => {
    const updateFreeze = jest.fn()
    render(
      <TestWrapper
        path="/account/:accountId/:module/orgs/:orgIdentifier/projects/:projectIdentifier/setup/freeze-window-studio/window/:windowIdentifier/"
        pathParams={{ projectIdentifier, orgIdentifier, accountId, module: 'cd', windowIdentifier: '-1' }}
      >
        <FreezeWindowContext.Provider
          value={{
            ...defaultContext,
            drawerType: DrawerTypes.Notification,
            updateFreeze
          }}
        >
          <RightBar />
        </FreezeWindowContext.Provider>
      </TestWrapper>
    )

    expect(document.body.getElementsByClassName('rightBar')[0]).toMatchSnapshot('open state')
    expect(document.body.getElementsByClassName('almostFullScreenPortal')[0]).toMatchSnapshot('open state')
  })
})
