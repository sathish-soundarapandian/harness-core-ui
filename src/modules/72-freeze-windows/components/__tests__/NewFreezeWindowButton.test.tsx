/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { FreezeWindowContext } from '@freeze-windows/context/FreezeWindowContext'
import { NewFreezeWindowButton } from '../NewFreezeWindowButton/NewFreezeWindowButton'
import { defaultContext } from './helper'

export const accountId = 'accountId'
export const projectIdentifier = 'project1'
export const orgIdentifier = 'default'

describe('Freeze Window Studio - Right Bar', () => {
  test('it should render New Freeze Button', async () => {
    const { container } = render(
      <TestWrapper
        path="/account/:accountId/:module/orgs/:orgIdentifier/projects/:projectIdentifier/setup/freeze-window-studio/window/:windowIdentifier/"
        pathParams={{ projectIdentifier, orgIdentifier, accountId, module: 'cd', windowIdentifier: '-1' }}
      >
        <FreezeWindowContext.Provider value={defaultContext}>
          <NewFreezeWindowButton />
        </FreezeWindowContext.Provider>
      </TestWrapper>
    )

    expect(container).toMatchSnapshot('New Freeze Window Button')

    // click on button
    const button = container.getElementsByTagName('button')
    expect(button[0]).toBeDefined()
    fireEvent.click(button[0])
  })
})
