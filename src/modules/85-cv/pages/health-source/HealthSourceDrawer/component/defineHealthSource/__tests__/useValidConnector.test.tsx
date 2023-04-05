/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { renderHook } from '@testing-library/react-hooks'
import * as serviceCDNG from 'services/cd-ng'
import { useValidConnector } from '../useValidConnector'

const mockUseGetConnector = jest.fn()

jest.mock('framework/strings', () => ({
  useStrings: () => ({
    getString: (str: string) => str
  })
}))

describe('useValidConnector', () => {
  const mockConnectorRef = 'connectorRef'
  const mockOrgIdentifier = 'org-id'
  const mockProjectIdentifier = 'project-id'
  const mockAccountId = 'account-id'

  test('should return isConnectorEnabled as true if there are no fetch errors', async () => {
    jest.spyOn(serviceCDNG, 'useGetConnector').mockImplementation(() => {
      return {
        refetch: mockUseGetConnector
      } as any
    })
    const { result } = renderHook(() =>
      useValidConnector({
        connectorRef: mockConnectorRef,
        orgIdentifier: mockOrgIdentifier,
        projectIdentifier: mockProjectIdentifier,
        accountId: mockAccountId
      })
    )
    expect(result.current.isConnectorEnabled).toBe(true)
    expect(mockUseGetConnector).toHaveBeenCalled()
  })

  test('should return isConnectorEnabled as false if there are no fetch errors', async () => {
    jest.spyOn(serviceCDNG, 'useGetConnector').mockImplementation(() => {
      return {
        error: { data: { code: 'RESOURCE_NOT_FOUND_EXCEPTION' } },
        refetch: mockUseGetConnector
      } as any
    })
    const { result } = renderHook(() =>
      useValidConnector({
        connectorRef: '',
        orgIdentifier: mockOrgIdentifier,
        projectIdentifier: mockProjectIdentifier,
        accountId: mockAccountId
      })
    )

    expect(result.current.isConnectorEnabled).toBe(false)
    expect(mockUseGetConnector).toHaveBeenCalled()
  })
})
