/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render, RenderResult, screen, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps } from '@common/utils/routeUtils'
import { useDashboardsContext } from '@dashboards/pages/DashboardsContext'
import { LookerEventType } from '@dashboards/constants/LookerEventType'
import * as sharedService from 'services/custom-dashboards'
import DashboardViewPage from '../DashboardView'

const accountId = 'ggre4325'
const folderId = 'gh544'
const viewId = '45udb23'

const iframeId = 'dashboard-iframe'

const renderComponent = (folder = folderId, queryParams?: Record<string, unknown>): RenderResult =>
  render(
    <TestWrapper
      path={routes.toViewCustomDashboard({ ...accountPathProps, folderId: ':folderId', viewId: ':viewId' })}
      pathParams={{ accountId: accountId, folderId: folder, viewId: viewId }}
      queryParams={queryParams}
    >
      <DashboardViewPage />
    </TestWrapper>
  )

jest.mock('@dashboards/pages/DashboardsContext', () => ({
  useDashboardsContext: jest.fn()
}))

const useDashboardsContextMock = useDashboardsContext as jest.Mock

const generateMockSignedUrl = (mockUrl = ''): Promise<sharedService.SignedUrlResponse> => {
  return new Promise(resolve => {
    resolve({ resource: mockUrl })
  })
}

describe('DashboardView', () => {
  const useCreateSignedUrlMock = jest.spyOn(sharedService, 'useCreateSignedUrl')
  const useGetDashboardDetailMock = jest.spyOn(sharedService, 'useGetDashboardDetail')
  const useGetFolderDetailMock = jest.spyOn(sharedService, 'useGetFolderDetail')

  const includeBreadcrumbs = jest.fn()
  const fetchFolderDetailMock = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()

    useGetFolderDetailMock.mockReturnValue({ data: { resource: 'folder name' }, refetch: fetchFolderDetailMock } as any)
    useGetDashboardDetailMock.mockReturnValue({ resource: true, title: 'dashboard name' } as any)
    useDashboardsContextMock.mockReturnValue({ includeBreadcrumbs: includeBreadcrumbs, breadcrumbs: [] })
    useCreateSignedUrlMock.mockReturnValue({
      mutate: generateMockSignedUrl,
      loading: true,
      error: null
    } as any)
  })

  test('it should display loading message before dashboard request completes', async () => {
    renderComponent()

    await waitFor(() => expect(screen.getByText('common.loading')).toBeInTheDocument())
  })

  test('it should display Dashboard iframe when dashboard URL returned', async () => {
    useCreateSignedUrlMock.mockReturnValue({
      mutate: () => generateMockSignedUrl('mockUrl'),
      loading: false,
      error: null
    } as any)

    renderComponent()

    await waitFor(() => expect(screen.getByTestId(iframeId)).toBeInTheDocument())
    expect(screen.getByText('Loading, please wait...')).toBeInTheDocument()

    const lookerEvent: any = {
      type: LookerEventType.DASHBOARD_LOADED
    }
    await act(async () => {
      fireEvent(
        window,
        new MessageEvent<string>('message', {
          data: JSON.stringify(lookerEvent),
          origin: 'https://dashboards.harness.io'
        })
      )
    })

    expect(screen.queryByText('Loading, please wait...')).not.toBeInTheDocument()
  })

  test('it should display Dashboard not available when dashboard request returns no URL', async () => {
    useCreateSignedUrlMock.mockReturnValue({
      mutate: generateMockSignedUrl,
      loading: false,
      error: null
    } as any)

    renderComponent()

    await waitFor(() => expect(screen.getByText('Dashboard not available')).toBeInTheDocument())
  })

  test('it should display an error message when dashboard request fails', async () => {
    const testErrorMessage = 'this the actual error message'
    useCreateSignedUrlMock.mockReturnValue({
      mutate: generateMockSignedUrl,
      loading: false,
      error: { data: { responseMessages: testErrorMessage } }
    } as any)

    renderComponent()

    await waitFor(() => expect(screen.getByText(testErrorMessage)).toBeInTheDocument())
  })

  test('it should include a folder link in breadcrumbs when using a named folder', async () => {
    renderComponent()

    await waitFor(() =>
      expect(includeBreadcrumbs).toBeCalledWith([
        { label: 'dashboards.homePage.folders', url: `/account/${accountId}/dashboards/folders` },
        { label: 'folder name', url: `/account/${accountId}/dashboards/folder/${folderId}` }
      ])
    )
  })

  test('it should include a dashboard in breadcrumbs when a dashboard details has been retrieved', async () => {
    useGetFolderDetailMock.mockReturnValue({ data: null, refetch: jest.fn() } as any)

    useCreateSignedUrlMock.mockReturnValue({
      mutate: () => generateMockSignedUrl('mockUrl'),
      loading: false,
      error: null
    } as any)

    const mockDashboardTitle = 'Test Dashboard'
    const mockDashboardDetail: sharedService.GetDashboardDetailResponse = {
      resource: true,
      title: mockDashboardTitle
    }
    useGetDashboardDetailMock.mockReturnValue({ data: mockDashboardDetail } as any)
    renderComponent()

    await waitFor(() => expect(screen.getByTestId(iframeId)).toBeInTheDocument())

    expect(includeBreadcrumbs).toBeCalledWith([
      { label: mockDashboardTitle, url: `/account/${accountId}/dashboards/folder/${folderId}/view/${viewId}` }
    ])
  })

  test('it should not include a folder link in breadcrumbs when using the shared folder', async () => {
    useGetFolderDetailMock.mockReturnValue({} as any)

    renderComponent('shared')

    await waitFor(() => expect(includeBreadcrumbs).toBeCalledWith([]))
  })

  test('it should not call the folder detail endpoint when using the shared folder', async () => {
    renderComponent('shared')

    await waitFor(() => expect(fetchFolderDetailMock).not.toHaveBeenCalled())
  })
})
