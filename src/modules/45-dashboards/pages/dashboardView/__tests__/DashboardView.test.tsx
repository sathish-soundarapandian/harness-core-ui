/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps } from '@common/utils/routeUtils'
import { useDashboardsContext } from '@dashboards/pages/DashboardsContext'
import { useGetDashboardDetail, useMutateCreateSignedUrl } from '@dashboards/services/CustomDashboardsService'
import { useGetFolderDetail } from 'services/custom-dashboards'
import DashboardViewPage from '../DashboardView'

const accountId = 'ggre4325'
const folderId = 'gh544'
const viewId = '45udb23'

jest.mock('@dashboards/pages/DashboardsContext', () => ({
  useDashboardsContext: jest.fn()
}))

jest.mock('@dashboards/services/CustomDashboardsService', () => ({
  useGetDashboardDetail: jest.fn(),
  useMutateCreateSignedUrl: jest.fn()
}))
const useDashboardsContextMock = useDashboardsContext as jest.Mock
const useGetDashboardDetailMock = useGetDashboardDetail as jest.Mock
const useMutateCreateSignedUrlMock = useMutateCreateSignedUrl as jest.Mock

jest.mock('services/custom-dashboards', () => ({
  useGetFolderDetail: jest.fn()
}))
const useGetFolderDetailMock = useGetFolderDetail as jest.Mock

const renderComponent = (folder = folderId): RenderResult =>
  render(
    <TestWrapper
      path={routes.toViewCustomDashboard({ ...accountPathProps, folderId: ':folderId', viewId: ':viewId' })}
      pathParams={{ accountId: accountId, folderId: folder, viewId: viewId }}
    >
      <DashboardViewPage />
    </TestWrapper>
  )

describe('DashboardView', () => {
  const includeBreadcrumbs = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    useGetFolderDetailMock.mockReturnValue({ data: { resource: 'folder name' } })
    useGetDashboardDetailMock.mockReturnValue({ data: { title: 'dashboard name' } })
    useMutateCreateSignedUrlMock.mockReturnValue({
      mutate: () => new Promise(() => void 0),
      loading: true,
      error: null
    })
    useDashboardsContextMock.mockReturnValue({ includeBreadcrumbs: includeBreadcrumbs, breadcrumbs: [] })
  })

  test('it should display loading message before dashboard request completes', async () => {
    renderComponent()

    expect(screen.getByText('Loading, please wait...')).toBeInTheDocument()
  })

  test('it should display Dashboard not available when dashboard request returns no URL', async () => {
    useMutateCreateSignedUrlMock.mockReturnValue({
      mutate: () => new Promise(() => void 0),
      loading: false,
      error: null
    })

    renderComponent()

    expect(screen.getByText('Dashboard not available')).toBeInTheDocument()
  })

  test('it should display an error message when dashboard request fails', async () => {
    useMutateCreateSignedUrlMock.mockReturnValue({
      mutate: () => new Promise(() => void 0),
      loading: false,
      error: { message: 'this is required by the error type', data: { message: 'this the actual error message' } }
    })

    renderComponent()

    expect(screen.getByText('this the actual error message')).toBeInTheDocument()
  })

  test('it should include a folder link in breadcrumbs when using a named folder', async () => {
    renderComponent()

    expect(includeBreadcrumbs).toBeCalledWith([
      { label: 'dashboards.homePage.folders', url: `/account/${accountId}/dashboards/folders` },
      { label: 'folder name', url: `/account/${accountId}/dashboards/folder/${folderId}` },
      { label: 'dashboard name', url: `/account/${accountId}/dashboards/folder/${folderId}/view/${viewId}` }
    ])
  })

  test('it should not include a folder link in breadcrumbs when using the shared folder', async () => {
    useGetFolderDetailMock.mockReturnValue({})

    renderComponent('shared')

    expect(includeBreadcrumbs).toBeCalledWith([
      { label: 'dashboard name', url: `/account/${accountId}/dashboards/folder/shared/view/${viewId}` }
    ])
  })
})
