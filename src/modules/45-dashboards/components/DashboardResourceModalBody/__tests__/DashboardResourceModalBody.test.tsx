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
import { useGetFoldersWithHidden } from 'services/custom-dashboards'
import DashboardResourceModalBody, { DashboardResourceModalBodyProps } from '../DashboardResourceModalBody'

jest.mock('services/custom-dashboards', () => ({
  useGetFoldersWithHidden: jest.fn(),
  useGetOotbFolderId: jest.fn()
}))
const useGetFoldersWithHiddenMock = useGetFoldersWithHidden as jest.Mock

const renderComponent = (props: Partial<DashboardResourceModalBodyProps> = {}): RenderResult =>
  render(
    <TestWrapper>
      <DashboardResourceModalBody
        onSelectChange={jest.fn()}
        selectedData={[]}
        resourceScope={{ accountIdentifier: '' }}
        {...props}
      />
    </TestWrapper>
  )

describe('DashboardResourceModalBody', () => {
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

    expect(screen.getByText('noData')).toBeInTheDocument()
  })

  test('it should display the folder names', async () => {
    renderComponent()

    expect(screen.getByText('you_got_it (0)')).toBeInTheDocument()
    expect(screen.getByText('but you dont got this (1)')).toBeInTheDocument()
    expect(screen.getByText('also_you_got_this (5)')).toBeInTheDocument()
  })

  test('it should display the child dashboard names', async () => {
    renderComponent()

    expect(screen.getByText('child_one')).toBeInTheDocument()
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

  test('calls onSelect handler with IDs of the selected folders', async () => {
    const onSelectChangeMock = jest.fn()

    renderComponent({ onSelectChange: onSelectChangeMock })
    const folderCheckboxFirst = screen
      .getByText('you_got_it (0)')
      .closest('.TableV2--row')
      ?.querySelector('input') as Element
    const folderCheckboxLast = screen
      .getByText('also_you_got_this (5)')
      .closest('.TableV2--row')
      ?.querySelector('input') as Element
    await userEvent.click(folderCheckboxFirst)
    await userEvent.click(folderCheckboxLast)

    await waitFor(() => expect(onSelectChangeMock).toHaveBeenCalledWith(['12']))
    await waitFor(() => expect(onSelectChangeMock).toHaveBeenLastCalledWith(['41']))
  })
})
