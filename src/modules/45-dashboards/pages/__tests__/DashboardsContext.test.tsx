/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act } from 'react-test-renderer'
import { waitFor } from '@testing-library/react'
import { renderHook } from '@testing-library/react-hooks'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps } from '@common/utils/routeUtils'
import { FolderType } from '@dashboards/constants/FolderType'
import * as customDashboardServices from 'services/custom-dashboards'
import { DashboardsContextProvider, useDashboardsContext } from '../DashboardsContext'

const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
  <TestWrapper
    path={routes.toCustomDashboardHome({ ...accountPathProps, folderId: ':folderId' })}
    pathParams={{ accountId: '1234', folderId: '5678' }}
  >
    <DashboardsContextProvider>{children}</DashboardsContextProvider>
  </TestWrapper>
)

describe('DashboardsContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(customDashboardServices, 'useGetFolders').mockImplementation(() => ({ data: {} } as any))
  })
  test('it should provide no default breadcrumbs', async () => {
    const { result } = renderHook(() => useDashboardsContext(), { wrapper })

    await waitFor(() => expect(result.current.breadcrumbs).toHaveLength(0))
  })

  test('it should overwrite the breadcrumbs when calling include breadcrumbs', async () => {
    const breadcrumb = { url: '/example/path', label: 'example label' }
    const { result } = renderHook(() => useDashboardsContext(), { wrapper })

    await act(async () => {
      result.current.includeBreadcrumbs([breadcrumb])
    })

    await waitFor(() => expect(result.current.breadcrumbs).toEqual([breadcrumb]))
  })

  test('it should return the folders taken from GetFolders response', async () => {
    const mockFolderOne: customDashboardServices.FolderModel = {
      id: '1',
      name: 'testName',
      title: 'testTitle',
      type: FolderType.ACCOUNT,
      child_count: 0,
      created_at: '01/01/2022'
    }

    const mockGetFolderResponse: customDashboardServices.GetFoldersResponse = {
      resource: [mockFolderOne],
      items: 1,
      pages: 1
    }

    jest
      .spyOn(customDashboardServices, 'useGetFolders')
      .mockImplementation(() => ({ data: mockGetFolderResponse } as any))

    const { result } = renderHook(() => useDashboardsContext(), { wrapper })
    expect(result.current.editableFolders).toEqual([mockFolderOne])
  })
})
