/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen, RenderResult, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import routes from '@common/RouteDefinitions'
import { orgPathProps } from '@common/utils/routeUtils'
import { useGlobalFreeze, useGetGlobalFreezeWithBannerDetails, useGetGlobalFreeze } from 'services/cd-ng'
import FreezeWindowsPage from '../FreezeWindowsPage'
import { projectLevelFreezeList } from './mocks/freezeListMock'
import { getGlobalfreezeEnabledOrgScope, getGlobalfreezeDisabledOrgScope } from './mocks/getGlobalfreezeMock'
import {
  getGlobalFreezeWithBannerDetailsMultiFreeze,
  getGlobalFreezeWithBannerDetailsSingleFreeze
} from './mocks/getGlobalFreezeWithBannerDetailsMock'

jest.mock('services/cd-ng', () => ({
  useGetFreezeList: jest.fn().mockImplementation(() => ({
    loading: false,
    mutate: jest.fn().mockResolvedValue(projectLevelFreezeList),
    refetch: jest.fn()
  })),
  useGetGlobalFreeze: jest
    .fn()
    .mockImplementation(() => ({ loading: false, data: getGlobalfreezeEnabledOrgScope, refetch: jest.fn() })),
  useGetGlobalFreezeWithBannerDetails: jest.fn().mockImplementation(() => ({
    loading: false,
    data: getGlobalFreezeWithBannerDetailsSingleFreeze,
    refetch: jest.fn()
  })),
  useGlobalFreeze: jest.fn().mockImplementation(() => ({ loading: false, data: null, refetch: jest.fn() })),
  useUpdateFreezeStatus: jest.fn().mockReturnValue({ data: null, loading: false }),
  useDeleteManyFreezes: jest.fn().mockReturnValue({ data: null, loading: false })
}))

jest.useFakeTimers()

const ORG_LEVEL_FREEZE_ROUTE = routes.toFreezeWindows(orgPathProps)

const ORG_LEVEL_FREEZE_ROUTE_PARAMS = {
  accountId: 'accountId',
  orgIdentifier: 'orgIdentifier'
}

const renderFreezeWindows = (path = ORG_LEVEL_FREEZE_ROUTE): RenderResult =>
  render(
    <TestWrapper path={path} pathParams={ORG_LEVEL_FREEZE_ROUTE_PARAMS} defaultAppStoreValues={defaultAppStoreValues}>
      <FreezeWindowsPage />
    </TestWrapper>
  )

describe('Global Freeze - Org Level', () => {
  test('disable an existing global freeze', async () => {
    const useGlobalFreezeMock = useGlobalFreeze as jest.MockedFunction<any>
    const mutateAction = jest.fn().mockResolvedValue({})
    useGlobalFreezeMock.mockReturnValue({
      mutate: mutateAction,
      loading: false,
      cancel: jest.fn()
    })
    renderFreezeWindows()

    const globalFreezeToggle = await screen.findByRole('checkbox', {
      name: /global freeze toggle/i
    })
    expect(globalFreezeToggle).toBeChecked()
    expect(screen.getByText(/freeze in place/i)).toBeInTheDocument() // banner text
    userEvent.click(globalFreezeToggle)
    expect(findDialogContainer()).toBeTruthy()
    userEvent.click(screen.getByRole('button', { name: /confirm/i }))
    expect(mutateAction).toHaveBeenLastCalledWith(expect.stringContaining('status: Disabled'))
  })

  test('existing global freeze with multiple level freezes', async () => {
    const useGetGlobalFreezeWithBannerDetailsMock = useGetGlobalFreezeWithBannerDetails as jest.MockedFunction<any>
    useGetGlobalFreezeWithBannerDetailsMock.mockImplementation(() => ({
      loading: false,
      data: getGlobalFreezeWithBannerDetailsMultiFreeze,
      refetch: jest.fn()
    }))
    renderFreezeWindows()
    expect(
      await screen.findByRole('checkbox', {
        name: /global freeze toggle/i
      })
    ).toBeEnabled()
    userEvent.click(
      screen.getByRole('button', {
        name: /expand list/i
      })
    ) // multi banner text
    expect(
      await screen.findByRole('button', {
        name: /collapse list/i
      })
    ).toBeInTheDocument()

    expect(screen.getAllByText('common.freezeListActiveBannerExpandedTextPrefix')).toHaveLength(2)
  })

  test('enable global freeze default values', async () => {
    const useGlobalFreezeMock = useGlobalFreeze as jest.MockedFunction<any>
    const mutateAction = jest.fn().mockResolvedValue({})
    useGlobalFreezeMock.mockReturnValue({
      mutate: mutateAction,
      loading: false,
      cancel: jest.fn()
    })

    const useGetGlobalFreezeMock = useGetGlobalFreeze as jest.MockedFunction<any>
    useGetGlobalFreezeMock.mockImplementation(() => ({
      loading: false,
      data: getGlobalfreezeDisabledOrgScope,
      refetch: jest.fn()
    }))
    renderFreezeWindows()
    const globalFreezeToggle = await screen.findByRole('checkbox', {
      name: /global freeze toggle/i
    })
    expect(globalFreezeToggle).not.toBeChecked()

    // With default form values
    userEvent.click(globalFreezeToggle)
    const dialog = findDialogContainer()
    expect(dialog).toBeTruthy()
    userEvent.click(
      within(dialog!).getByRole('button', {
        name: /save/i
      })
    )
    await waitFor(() => expect(dialog).not.toBeInTheDocument())
    expect(mutateAction).toHaveBeenCalledWith(expect.stringContaining(`duration: 30m`))
  })
})
