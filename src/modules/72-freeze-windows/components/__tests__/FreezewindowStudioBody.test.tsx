/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { FreezeWindowContext } from '@freeze-windows/context/FreezeWindowContext'
import { FreezeWindowStudioBody } from '@freeze-windows/components/FreezeWindowStudioBody/FreezeWindowStudioBody'
import { defaultContext, resources } from './helper'

export const accountId = 'accountId'
export const projectIdentifier = 'project1'
export const orgIdentifier = 'default'

jest.mock('services/cd-ng', () => ({
  useGetFreezeSchema: jest.fn(() => ({}))
}))

describe('Freeze Window Studio Body Visual View', () => {
  test('it should render Visual View, Overview tab by default', () => {
    const updateFreeze = jest.fn()
    const { getByText, container } = render(
      <TestWrapper
        path="/account/:accountId/:module/orgs/:orgIdentifier/projects/:projectIdentifier/setup/freeze-window-studio/window/:windowIdentifier/"
        pathParams={{ projectIdentifier, orgIdentifier, accountId, module: 'cd', windowIdentifier: '-1' }}
      >
        <FreezeWindowContext.Provider
          value={{
            ...defaultContext,
            updateFreeze
          }}
        >
          <FreezeWindowStudioBody resources={resources} />
        </FreezeWindowContext.Provider>
      </TestWrapper>
    )

    const allTabs = container.getElementsByClassName('bp3-tab')
    expect(allTabs.length).toBe(3)
    expect(getByText('overview')).toBeInTheDocument()
    expect(getByText('freezeWindows.freezeStudio.freezeConfiguration')).toBeInTheDocument()
    expect(getByText('common.schedule')).toBeInTheDocument()

    // Freeze Overview Section should be defined
    expect(getByText('freezeWindows.freezeStudio.freezeOverview')).toBeInTheDocument()
    expect(container).toMatchSnapshot('Overview Tab snapshot')
  })
  test('it should render YAML View', () => {
    const updateFreeze = jest.fn()
    const { getByText, container } = render(
      <TestWrapper
        path="/account/:accountId/:module/orgs/:orgIdentifier/projects/:projectIdentifier/setup/freeze-window-studio/window/:windowIdentifier/"
        pathParams={{ projectIdentifier, orgIdentifier, accountId, module: 'cd', windowIdentifier: '-1' }}
      >
        <FreezeWindowContext.Provider
          value={{
            ...defaultContext,
            updateFreeze,
            view: 'YAML'
          }}
        >
          <FreezeWindowStudioBody resources={resources} />
        </FreezeWindowContext.Provider>
      </TestWrapper>
    )

    expect(getByText('common.readOnly')).toBeInTheDocument()
    expect(getByText('common.editYaml')).toBeInTheDocument()
    expect(container).toMatchSnapshot('YAML View Snapshot')
  })
})
