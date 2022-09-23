/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { renderHook } from '@testing-library/react-hooks'
import React from 'react'
import { TestWrapper } from '@common/utils/testUtils'
import mockImport from 'framework/utils/mockImport'
import { useGetConnectorsListHook } from '../hooks/useGetConnectorsListHook/useGetConectorsListHook'
import { catalogueData } from './mockData'

jest.mock('services/cd-ng', () => ({
  useGetConnectorCatalogue: jest.fn().mockImplementation(() => {
    return { data: catalogueData, loading: false }
  })
}))
jest.mock('@common/hooks/useFeatures', () => {
  return {
    useFeature: () => {
      return {
        enabled: true
      }
    }
  }
})
mockImport('framework/AppStore/AppStoreContext', {
  useAppStore: jest.fn().mockImplementation(() => ({
    currentUserInfo: {}
  }))
})
describe('useGetConnectorsListHook', () => {
  test('useGetConnectorsListHook render data', () => {
    const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
      <TestWrapper>{children}</TestWrapper>
    )

    const { result } = renderHook(() => useGetConnectorsListHook({}), { wrapper })

    const { loading, categoriesMap, connectorsList, connectorCatalogueOrder } = result.current
    expect(loading).toBeFalsy()
    expect(connectorCatalogueOrder.length).toBeGreaterThan(0)
    expect(connectorsList?.length).toBeGreaterThan(0)
    expect(categoriesMap?.categories?.length).toBeGreaterThan(0)
  })
})
