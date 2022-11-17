/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { waitFor } from '@testing-library/react'
import { renderHook } from '@testing-library/react-hooks'

import * as cdNgServices from 'services/cd-ng'

import { TestWrapper } from '@common/utils/testUtils'
import { Scope } from '@common/interfaces/SecretsInterface'

import { useGetEnvironmentGroupsData } from '../useGetEnvironmentGroupsData'

import defaultEnvironmentGroupsData from './__mocks__/defaultEnvironmentGroupsData.json'
import newEnvironmentGroupData from './__mocks__/newEnvironmentGroupData.json'

const showError = jest.fn()

jest.mock('@harness/uicore', () => ({
  ...jest.requireActual('@harness/uicore'),
  useToaster: () => ({
    showError
  })
}))

describe('useGetEnvironmentGroupsData hook', () => {
  beforeEach(() => {
    jest.spyOn(cdNgServices, 'useGetEnvironmentGroupList').mockImplementation(
      () =>
        ({
          mutate: jest.fn().mockReturnValue(defaultEnvironmentGroupsData),
          loading: false
        } as any)
    )
  })

  test('default case - hook returns list of environment group', async () => {
    const { result } = renderHook(() => useGetEnvironmentGroupsData(), { wrapper: TestWrapper })
    await waitFor(() => expect(result.current.environmentGroupsList).toHaveLength(2))

    expect(result.current.environmentGroupsList).toMatchSnapshot()
  })

  test('at account scope - hook returns no data', async () => {
    const { result } = renderHook(() => useGetEnvironmentGroupsData(Scope.ACCOUNT), { wrapper: TestWrapper })
    await waitFor(() => expect(result.current.environmentGroupsList).toHaveLength(0))
  })

  test('at org scope - hook returns no data', async () => {
    const { result } = renderHook(() => useGetEnvironmentGroupsData(Scope.ORG), { wrapper: TestWrapper })
    await waitFor(() => expect(result.current.environmentGroupsList).toHaveLength(0))
  })

  test('prepends environment group to list', async () => {
    const { result } = renderHook(() => useGetEnvironmentGroupsData(), { wrapper: TestWrapper })
    await waitFor(() => expect(result.current.environmentGroupsList).toHaveLength(2))

    result.current.prependEnvironmentGroupToEnvironmentGroupsList(newEnvironmentGroupData as any)

    await waitFor(() => expect(result.current.environmentGroupsList).toHaveLength(3))
  })

  test('shows error', async () => {
    jest.spyOn(cdNgServices, 'useGetEnvironmentGroupList').mockImplementation(
      () =>
        ({
          mutate: jest.fn().mockRejectedValue({
            message: 'Failed to Load'
          }),
          loading: false
        } as any)
    )

    const { result } = renderHook(() => useGetEnvironmentGroupsData(), { wrapper: TestWrapper })

    await waitFor(() => expect(showError).toHaveBeenCalledWith('Failed to Load'))
    expect(result.current.environmentGroupsList).toHaveLength(0)
  })
})
