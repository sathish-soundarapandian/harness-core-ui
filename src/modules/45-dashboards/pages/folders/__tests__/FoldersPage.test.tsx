/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render, RenderResult, screen, waitFor } from '@testing-library/react'
import { renderHook } from '@testing-library/react-hooks'
import { TestWrapper } from '@common/utils/testUtils'
import { DashboardsContextProvider } from '@dashboards/pages/DashboardsContext'
import { FolderType } from '@dashboards/constants/FolderType'
import { useStrings } from 'framework/strings'
import * as customDashboardServices from 'services/custom-dashboards'
import FoldersPage from '../FoldersPage'

const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
  <TestWrapper>{children}</TestWrapper>
)

const { result } = renderHook(() => useStrings(), { wrapper })

const renderComponent = (): RenderResult => {
  return render(
    <TestWrapper>
      <DashboardsContextProvider>
        <FoldersPage />
      </DashboardsContextProvider>
    </TestWrapper>
  )
}

const mockEmptyGetFolderResponse: customDashboardServices.GetFoldersResponse = {
  resource: [],
  items: 0,
  pages: 0
}

const mockFolderOne: customDashboardServices.FolderModel = {
  id: '1',
  name: 'testName',
  title: 'testTitle',
  type: FolderType.ACCOUNT,
  child_count: 0,
  created_at: '01/01/2022'
}

describe('FoldersPage', () => {
  beforeEach(() => {
    jest
      .spyOn(customDashboardServices, 'useGetFolders')
      .mockImplementation(() => ({ data: mockEmptyGetFolderResponse, loading: false } as any))
    jest.spyOn(customDashboardServices, 'useCreateFolder').mockImplementation(() => ({ mutate: jest.fn() } as any))
  })
  afterEach(() => {
    jest.spyOn(customDashboardServices, 'useGetFolders').mockReset()
    jest.spyOn(customDashboardServices, 'useCreateFolder').mockReset()
  })

  test('it should display "No Folder" content if no folders are returned', async () => {
    renderComponent()

    const noFolderComponent = screen.getByText(result.current.getString('dashboards.homePage.noFolderAvailable'))
    await waitFor(() => expect(noFolderComponent).toBeInTheDocument())
  })

  test('it should display a series of FolderCards if Folders are returned', async () => {
    const mockGetFolderResponse: customDashboardServices.GetFoldersResponse = {
      resource: [mockFolderOne],
      items: 1,
      pages: 1
    }
    jest
      .spyOn(customDashboardServices, 'useGetFolders')
      .mockImplementation(() => ({ data: mockGetFolderResponse, loading: false } as any))
    const { container } = renderComponent()

    await waitFor(() => expect(container.querySelector('.folderMasonry')).toBeInTheDocument())
  })

  test('it should display a NewFoldersForm when create button clicked', async () => {
    const { container } = renderComponent()

    const noFolderComponent = screen.getByText(result.current.getString('dashboards.homePage.noFolderAvailable'))
    await waitFor(() => expect(noFolderComponent).toBeInTheDocument())

    const createButton = container.querySelector('.createButton')!
    expect(createButton).toBeInTheDocument()

    act(() => {
      fireEvent.click(createButton)
    })

    const newFolderComponent = screen.getByText(result.current.getString('dashboards.folderForm.stepOne'))
    await waitFor(() => expect(newFolderComponent).toBeInTheDocument())
  })
})
