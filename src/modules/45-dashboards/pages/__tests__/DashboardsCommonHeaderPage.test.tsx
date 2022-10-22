/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import * as dashboardsContext from '@dashboards/pages/DashboardsContext'
import DashboardsHeader from '@dashboards/pages/DashboardsCommonHeaderPage'

const renderComponent = (): RenderResult =>
  render(
    <TestWrapper>
      <DashboardsHeader />
    </TestWrapper>
  )

describe('DashboardsHeader', () => {
  const useDashboardsContextMock = jest.spyOn(dashboardsContext, 'useDashboardsContext')

  beforeEach(() => {
    jest.clearAllMocks()
    useDashboardsContextMock.mockReturnValue({
      editableFolders: [],
      includeBreadcrumbs: jest.fn(),
      breadcrumbs: [
        { label: 'Home', url: 'path/to/link' },
        { label: 'Dashboards', url: 'path/to/link' }
      ]
    })
  })

  test('it should display breadcrumbs in the header', async () => {
    renderComponent()

    expect(screen.getByText('Home')).toBeInTheDocument()
  })

  test('it should display last breadcrumb as the title', async () => {
    renderComponent()

    expect(screen.getAllByText('Dashboards')).toHaveLength(2)
  })

  test('it should include default breadcrumb in breadcrumbs and title', async () => {
    useDashboardsContextMock.mockReturnValue({
      editableFolders: [],
      includeBreadcrumbs: jest.fn(),
      breadcrumbs: []
    })

    renderComponent()

    expect(screen.getAllByText('common.dashboards')).toHaveLength(2)
  })

  test('it should open the getting started sidebar when clicking the getStarted button', async () => {
    renderComponent()

    const getStartedButton = screen.getByText('getStarted') as HTMLButtonElement
    const sidebarQueryText = 'dashboards.getStarted.title'

    expect(getStartedButton).toBeInTheDocument()
    expect(screen.queryByText(sidebarQueryText)).not.toBeInTheDocument()

    userEvent.click(getStartedButton)

    await waitFor(() => expect(screen.queryByText(sidebarQueryText)).toBeInTheDocument())
  })
})
