/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render, RenderResult, screen, within } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import type { DashboardModel } from 'services/custom-dashboards'
import { DashboardType } from '@dashboards/types/DashboardTypes.types'
import { DashboardsContextProvider } from '@dashboards/pages/DashboardsContext'
import { FolderType } from '@dashboards/constants/FolderType'
import type { StringKeys } from 'framework/strings'
import * as customDashboardServices from 'services/custom-dashboards'
import DashboardCard, { DashboardCardProps } from '../DashboardCard'

const testTitle = 'test title'

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

const defaultTestDashboard: DashboardModel = {
  id: '1',
  type: DashboardType.SHARED,
  description: 'testTag',
  title: testTitle,
  view_count: 0,
  favorite_count: 0,
  created_at: '',
  data_source: [],
  last_accessed_at: '',
  resourceIdentifier: '1',
  folder: mockFolderOne
}

const defaultProps: DashboardCardProps = {
  dashboard: defaultTestDashboard,
  cloneDashboard: jest.fn(),
  deleteDashboard: jest.fn(),
  editDashboard: jest.fn()
}

const renderComponent = (props: DashboardCardProps): RenderResult => {
  return render(
    <TestWrapper>
      <DashboardsContextProvider>
        <DashboardCard {...props} />
      </DashboardsContextProvider>
    </TestWrapper>
  )
}

const openContextMenu = (element: HTMLElement): void => {
  const dashboardCard = element.querySelector('.card')!
  const button = within(dashboardCard as HTMLElement).getByRole(`button`)!

  act(() => {
    fireEvent.click(button)
  })
}

describe('DashboardCard', () => {
  const cloneText: StringKeys = 'projectCard.clone'
  const deleteText: StringKeys = 'delete'
  const editText: StringKeys = 'edit'

  beforeEach(() => {
    jest.clearAllMocks()
    jest
      .spyOn(customDashboardServices, 'useGetFolders')
      .mockImplementation(() => ({ data: mockGetFolderResponse } as any))
  })

  test('it should show read only dashboard card for a shared dashboard', async () => {
    jest.spyOn(customDashboardServices, 'useGetFolders').mockReturnValue({ data: {} } as any)

    const { container } = renderComponent(defaultProps)

    expect(screen.getByText(testTitle)).toBeInTheDocument()

    await openContextMenu(container)

    expect(screen.getByText(cloneText)).toBeInTheDocument()
    expect(screen.queryByText(editText)).toBeNull()
    expect(screen.queryByText(deleteText)).toBeNull()
  })

  test('it should show editable dashboard card for an account dashboard', async () => {
    jest.spyOn(customDashboardServices, 'useGetFolders').mockReturnValue({ data: {} } as any)
    const viewCount = 5678

    const testDashboard: DashboardModel = {
      ...defaultTestDashboard,
      type: DashboardType.ACCOUNT,
      view_count: viewCount
    }

    const { container } = renderComponent({ ...defaultProps, dashboard: testDashboard })

    expect(screen.getByText(testTitle)).toBeInTheDocument()

    await openContextMenu(container)
    expect(screen.getByText(cloneText)).toBeInTheDocument()
    expect(screen.getAllByText(editText).length).toBe(2)
    expect(screen.getByText(deleteText)).toBeInTheDocument()

    expect(screen.getByText(viewCount.toString())).toBeInTheDocument()
  })

  test('it should trigger callback for cloning a dashboard', async () => {
    const mockCallback = jest.fn()
    const testProps: DashboardCardProps = {
      ...defaultProps,
      cloneDashboard: mockCallback
    }

    const { container } = renderComponent({ ...testProps })
    await openContextMenu(container)

    const cloneButton = screen.getByText(cloneText)
    act(() => {
      fireEvent.click(cloneButton)
    })

    expect(mockCallback).toHaveBeenCalled()
  })

  test('it should trigger callback for editing an account dashboard', async () => {
    const testDashboard: DashboardModel = {
      ...defaultTestDashboard,
      type: DashboardType.ACCOUNT
    }
    const mockCallback = jest.fn()
    const testProps: DashboardCardProps = {
      ...defaultProps,
      editDashboard: mockCallback
    }

    const { container } = renderComponent({ ...testProps, dashboard: testDashboard })
    await openContextMenu(container)

    const editElements = screen.getAllByText(editText)
    act(() => {
      fireEvent.click(editElements[0])
    })

    expect(mockCallback).toHaveBeenCalled()
  })

  test('it should trigger callback for deleting an account dashboard', async () => {
    const testDashboard: DashboardModel = {
      ...defaultTestDashboard,
      type: DashboardType.ACCOUNT
    }
    const mockCallback = jest.fn()
    const testProps: DashboardCardProps = {
      ...defaultProps,
      deleteDashboard: mockCallback
    }

    const { container } = renderComponent({ ...testProps, dashboard: testDashboard })
    await openContextMenu(container)

    const deleteElement = screen.getByText(deleteText)
    act(() => {
      fireEvent.click(deleteElement)
    })

    expect(mockCallback).toHaveBeenCalled()
  })
})
