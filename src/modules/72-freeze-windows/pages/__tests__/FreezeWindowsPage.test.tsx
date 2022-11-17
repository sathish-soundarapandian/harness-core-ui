/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen, RenderResult, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import routes from '@common/RouteDefinitions'
import { projectPathProps, modulePathProps } from '@common/utils/routeUtils'
import { useUpdateFreezeStatus, useDeleteManyFreezes } from 'services/cd-ng'
import FreezeWindowsPage from '../FreezeWindowsPage'
import { projectLevelFreezeList } from './mocks/freezeListMock'
import { getGlobalfreezeDisabledOrgScope } from './mocks/getGlobalfreezeMock'
import { getGlobalFreezeWithBannerDetailsNoFreeze } from './mocks/getGlobalFreezeWithBannerDetailsMock'

jest.mock('services/cd-ng', () => ({
  useGetFreezeList: jest.fn().mockImplementation(() => ({
    loading: false,
    mutate: jest.fn().mockResolvedValue(projectLevelFreezeList),
    refetch: jest.fn()
  })),
  useGetGlobalFreeze: jest
    .fn()
    .mockImplementation(() => ({ loading: false, data: getGlobalfreezeDisabledOrgScope, refetch: jest.fn() })),
  useGetGlobalFreezeWithBannerDetails: jest
    .fn()
    .mockImplementation(() => ({ loading: false, data: getGlobalFreezeWithBannerDetailsNoFreeze, refetch: jest.fn() })),
  useGlobalFreeze: jest.fn().mockImplementation(() => ({ loading: false, data: null, refetch: jest.fn() })),
  useUpdateFreezeStatus: jest.fn().mockReturnValue({ data: null, loading: false }),
  useDeleteManyFreezes: jest.fn().mockReturnValue({ data: null, loading: false })
}))

jest.useFakeTimers()

const PROJECT_LEVEL_FREEZE_ROUTE = routes.toFreezeWindows({ ...projectPathProps, ...modulePathProps })

const PROJECT_LEVEL_FREEZE_ROUTE_PARAMS = {
  accountId: 'accountId',
  orgIdentifier: 'orgIdentifier',
  projectIdentifier: 'projectIdentifier',
  module: 'cd'
}

const renderFreezeWindows = (path = PROJECT_LEVEL_FREEZE_ROUTE): RenderResult =>
  render(
    <TestWrapper
      path={path}
      pathParams={PROJECT_LEVEL_FREEZE_ROUTE_PARAMS}
      defaultAppStoreValues={defaultAppStoreValues}
    >
      <FreezeWindowsPage />
    </TestWrapper>
  )

describe('Freeze Windows - Project Level', () => {
  test('render table and go to a specific freeze window', async () => {
    renderFreezeWindows()
    const rows = await screen.findAllByRole('row')
    const row = rows[1]
    expect(
      within(row).getByRole('link', {
        name: projectLevelFreezeList.data.content[0].name
      })
    ).toHaveAttribute(
      'href',
      routes.toFreezeWindowStudio({
        ...PROJECT_LEVEL_FREEZE_ROUTE_PARAMS,
        windowIdentifier: projectLevelFreezeList.data.content[0].identifier
      } as any)
    )
  })

  test('enable/disable by a quick toggle on individual freeze', async () => {
    const useUpdateFreezeStatusMock = useUpdateFreezeStatus as jest.MockedFunction<any>
    const mutateAction = jest.fn().mockResolvedValue({})
    useUpdateFreezeStatusMock.mockReturnValue({
      mutate: mutateAction,
      loading: false,
      cancel: jest.fn()
    })

    renderFreezeWindows()
    const toggleFreezeSwitches = await screen.findAllByRole('checkbox', {
      name: /toggle freeze/i
    })
    userEvent.click(toggleFreezeSwitches[0])
    expect(mutateAction).toHaveBeenLastCalledWith([projectLevelFreezeList.data.content[0].identifier], {
      queryParams: { status: 'Enabled' }
    })

    userEvent.click(toggleFreezeSwitches[2])
    expect(mutateAction).toHaveBeenLastCalledWith([projectLevelFreezeList.data.content[2].identifier], {
      queryParams: { status: 'Disabled' }
    })
  })

  test('enable/disable multiple freezes with bulk action', async () => {
    const useUpdateFreezeStatusMock = useUpdateFreezeStatus as jest.MockedFunction<any>
    const mutateAction = jest.fn().mockResolvedValue({})
    useUpdateFreezeStatusMock.mockReturnValue({
      mutate: mutateAction,
      loading: false,
      cancel: jest.fn()
    })

    renderFreezeWindows()
    const selectAll = await screen.findByRole('checkbox', {
      name: /select all row/i
    })
    userEvent.click(selectAll)

    const toggleFreezeSwitches = screen.getAllByRole('checkbox', {
      name: /select row/i
    })
    expect(toggleFreezeSwitches[0]).toBeChecked() // individual row is selected when select all is clicked
    userEvent.click(toggleFreezeSwitches[1]) // unselect second row
    userEvent.click(screen.getByRole('button', { name: /disable/i })) // bulk disable
    expect(mutateAction).toHaveBeenLastCalledWith(
      [projectLevelFreezeList.data.content[0].identifier, projectLevelFreezeList.data.content[2].identifier],
      {
        queryParams: { status: 'Disabled' }
      }
    )
  })

  test('delete multiple freezes with bulk action', async () => {
    const useDeleteManyFreezesMock = useDeleteManyFreezes as jest.MockedFunction<any>
    const mutateAction = jest.fn().mockResolvedValue({})
    useDeleteManyFreezesMock.mockReturnValue({
      mutate: mutateAction,
      loading: false,
      cancel: jest.fn()
    })
    renderFreezeWindows()
    userEvent.click(
      await screen.findByRole('checkbox', {
        name: /select all row/i
      })
    )
    userEvent.click(screen.getByRole('button', { name: /delete/i }))
    expect(findDialogContainer()).toBeTruthy()
    userEvent.click(screen.getByRole('button', { name: /confirm/i }))
    expect(mutateAction).toHaveBeenLastCalledWith([
      projectLevelFreezeList.data.content[0].identifier,
      projectLevelFreezeList.data.content[1].identifier,
      projectLevelFreezeList.data.content[2].identifier
    ])
  })

  test('individual freeze actions from menu', async () => {
    const useDeleteManyFreezesMock = useDeleteManyFreezes as jest.MockedFunction<any>
    const mutateAction = jest.fn().mockResolvedValue({})
    useDeleteManyFreezesMock.mockReturnValue({
      mutate: mutateAction,
      loading: false,
      cancel: jest.fn()
    })
    renderFreezeWindows()
    userEvent.click(
      await screen.findByRole('checkbox', {
        name: /select all row/i
      })
    )
    userEvent.click(screen.getByRole('button', { name: /delete/i }))
    expect(findDialogContainer()).toBeTruthy()
    userEvent.click(screen.getByRole('button', { name: /confirm/i }))
    expect(mutateAction).toHaveBeenLastCalledWith([
      projectLevelFreezeList.data.content[0].identifier,
      projectLevelFreezeList.data.content[1].identifier,
      projectLevelFreezeList.data.content[2].identifier
    ])
  })
})
