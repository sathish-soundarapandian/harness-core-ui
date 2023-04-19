/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, getByText, render, RenderResult } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import * as cdng from 'services/cd-ng'
import { accountPathProps, pipelineModuleParams, pipelinePathProps } from '@common/utils/routeUtils'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'

import FrozenExecutionDrawer from '../FrozenExecutionDrawer'
import { frozenExecData } from './FrozenExecMocks'

export const findDrawerContainer = (): HTMLElement | null => document.querySelector('.bp3-drawer')

const refetchCall = jest.fn()

jest.mock('services/cd-ng', () => ({
  useGetFrozenExecutionDetails: jest
    .fn()
    .mockImplementation(() => ({ loading: false, data: frozenExecData, error: false, refetch: refetchCall }))
}))

const TEST_PATH = routes.toDeployments({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams })
const getModuleParams = {
  accountId: 'accountId',
  orgIdentifier: 'orgIdentifier',
  projectIdentifier: 'projectIdentifier',
  module: 'cd'
}

const renderFrozenExecDrawer = (): RenderResult =>
  render(
    <TestWrapper
      path={TEST_PATH}
      pathParams={getModuleParams}
      defaultAppStoreValues={defaultAppStoreValues}
      queryParams={{ listview: true }}
    >
      <FrozenExecutionDrawer drawerOpen={true} setDrawerOpen={jest.fn()} planExecutionId="ctmaHpqoSQmNAzXtgk4Uxw" />
    </TestWrapper>
  )

jest.useFakeTimers()

jest.mock('moment', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    isBetween: jest.fn().mockReturnValue(false),
    format: jest.fn().mockReturnValue('Dec 20, 2022 11:59 PM')
  }))
}))

describe('FrozenExecutionDrawer', () => {
  test('initial render - snaphshot testing', async () => {
    renderFrozenExecDrawer()
    const frozenExecDetailDrawer = findDrawerContainer()
    expect(frozenExecDetailDrawer).toMatchSnapshot()

    fireEvent.click(frozenExecDetailDrawer?.querySelector('span[icon="cross"]')!)
  })

  test('test for FreezeName navigation', async () => {
    window.open = jest.fn()
    renderFrozenExecDrawer()
    const frozenExecDetailDrawer = findDrawerContainer()

    //test refresh function
    const refreshIcon = frozenExecDetailDrawer?.querySelector('span[icon="refresh"]')
    fireEvent.click(refreshIcon!)
    expect(refetchCall).toBeCalled()

    //freezeName click navigation
    const freezeName = getByText(frozenExecDetailDrawer!, 'test-B-freeze')
    expect(freezeName).toBeDefined()

    fireEvent.click(freezeName)
    expect(window.open).toHaveBeenCalledTimes(1)
    expect(window.open).toHaveBeenCalledWith(
      'http://localhost/#/account/accountId/cd/orgs/default/projects/projectId/setup/freeze-window-studio/window/testBfreeze/'
    )
  })

  test('test loading state', async () => {
    jest.spyOn(cdng, 'useGetFrozenExecutionDetails').mockImplementation(() => {
      return {
        data: null,
        loading: true,
        error: false,
        refetch: refetchCall
      } as any
    })
    renderFrozenExecDrawer()
    const frozenExecDetailDrawer = findDrawerContainer()

    expect(frozenExecDetailDrawer?.querySelector('span[data-icon="spinner"]')).toBeDefined()
  })

  test('test Error state', async () => {
    jest.spyOn(cdng, 'useGetFrozenExecutionDetails').mockImplementation(() => {
      return {
        data: null,
        loading: false,
        error: true,
        refetch: refetchCall
      } as any
    })
    renderFrozenExecDrawer()
    const frozenExecDetailDrawer = findDrawerContainer()

    const errorRetryBtn = frozenExecDetailDrawer?.querySelector('button[aria-label="Retry"]')
    expect(errorRetryBtn).toBeDefined()
    fireEvent.click(errorRetryBtn as HTMLButtonElement)

    expect(frozenExecDetailDrawer?.querySelector('[data-test="FrozenExecutionListTableError"]')).toBeTruthy()
  })

  test('test Empty state', async () => {
    jest.spyOn(cdng, 'useGetFrozenExecutionDetails').mockImplementation(() => {
      return {
        data: null,
        loading: false,
        error: false,
        refetch: refetchCall
      } as any
    })
    renderFrozenExecDrawer()
    const frozenExecDetailDrawer = findDrawerContainer()

    expect(getByText(frozenExecDetailDrawer!, 'pipeline.frozenExecList.emptyStateMsg')).toBeTruthy()
  })
})
