/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { useGetFoldersWithHidden } from 'services/custom-dashboards'
import type { RbacResourceRendererProps } from '@rbac/factories/RbacFactory'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import DashboardResourceRenderer from '../DashboardResourceRenderer'

jest.mock('services/custom-dashboards', () => ({
  useGetFoldersWithHidden: jest.fn(),
  useGetOotbFolderId: jest.fn()
}))
const useGetFoldersWithHiddenMock = useGetFoldersWithHidden as jest.Mock

const renderComponent = (props: Partial<RbacResourceRendererProps> = {}): RenderResult =>
  render(
    <TestWrapper>
      <DashboardResourceRenderer
        identifiers={['12', '41']}
        resourceScope={{ accountIdentifier: '' }}
        resourceType={ResourceType.DASHBOARDS}
        onResourceSelectionChange={jest.fn()}
        {...props}
      />
    </TestWrapper>
  )

describe('DashboardResourceRenderer', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useGetFoldersWithHiddenMock.mockReturnValue({
      data: {
        resource: [
          { id: '12', name: 'you_got_it', Children: [] },
          { id: '23', name: 'but you dont got this', Children: [{ id: 6, name: 'child_one' }] },
          {
            id: '41',
            name: 'also_you_got_this',
            Children: [
              { id: 1, name: '2nd_child_one' },
              { id: 2, name: 'child_two' },
              { id: 3, name: 'child_three' },
              { id: 4, name: 'child_four' },
              { id: 5, name: 'child_five' }
            ]
          }
        ]
      }
    })
  })

  test('it should display the no data message when no folders are returned', async () => {
    useGetFoldersWithHiddenMock.mockReturnValue({ data: { resource: [] } })

    renderComponent()

    expect(screen.getByRole('rowgroup')).toBeEmptyDOMElement()
  })

  test('it should display the loading spinner when folders are loading', async () => {
    useGetFoldersWithHiddenMock.mockReturnValue({ data: { resource: [] }, loading: true })

    renderComponent()

    expect(screen.getByText('Loading, please wait...')).toBeInTheDocument()
  })

  test('it should display the folder names', async () => {
    renderComponent()

    expect(screen.getByText('you_got_it (0)')).toBeInTheDocument()
    expect(screen.getByText('also_you_got_this (5)')).toBeInTheDocument()
  })

  test('it should display the child dashboard names', async () => {
    renderComponent()

    expect(screen.getByText('2nd_child_one')).toBeInTheDocument()
  })

  test('renders only first 3 child dashboards', async () => {
    renderComponent()

    expect(screen.getByText('2nd_child_one')).toBeInTheDocument()
    expect(screen.getByText('child_two')).toBeInTheDocument()
    expect(screen.getByText('child_three')).toBeInTheDocument()
    expect(screen.queryByText('child_four')).not.toBeInTheDocument()
    expect(screen.queryByText('child_five')).not.toBeInTheDocument()
  })
})
