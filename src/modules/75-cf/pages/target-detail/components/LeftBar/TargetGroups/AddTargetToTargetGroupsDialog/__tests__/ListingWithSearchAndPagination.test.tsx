/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { getByRole, queryByRole, render, RenderResult, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { merge } from 'lodash-es'
import type { Segments } from 'services/cf'
import { TestWrapper } from '@common/utils/testUtils'
import { CF_DEFAULT_PAGE_SIZE } from '@cf/utils/CFUtils'
import { AddTargetToTargetGroupsDialogStatus } from '@cf/pages/target-detail/TargetDetailPage.types'
import ListingWithSearchAndPagination, { ListingWithSearchAndPaginationProps } from '../ListingWithSearchAndPagination'

jest.mock('@common/components/ContainerSpinner/ContainerSpinner', () => ({
  ContainerSpinner: () => <span data-testid="container-spinner">Container Spinner</span>
}))

const mockTargetGroups = [
  { identifier: 'tg1', name: 'Target Group 1' },
  { identifier: 'tg2', name: 'Target Group 2' },
  { identifier: 'tg3', name: 'Target Group 3' }
]

const mockTargetGroupsWithPagination: Segments = {
  segments: mockTargetGroups,
  pageSize: CF_DEFAULT_PAGE_SIZE,
  pageIndex: 0,
  pageCount: Math.ceil(mockTargetGroups.length / CF_DEFAULT_PAGE_SIZE),
  itemCount: mockTargetGroups.length
}

const renderComponent = (props: Partial<ListingWithSearchAndPaginationProps> = {}): RenderResult =>
  render(
    <TestWrapper>
      <ListingWithSearchAndPagination
        state={AddTargetToTargetGroupsDialogStatus.ok}
        onSearch={jest.fn()}
        targetGroups={mockTargetGroupsWithPagination}
        setPageNumber={jest.fn()}
        setFieldValue={jest.fn()}
        values={{ targetGroups: {} }}
        {...props}
      />
    </TestWrapper>
  )

describe('ListingWithSearchAndPagination', () => {
  describe('search', function () {
    test('it should call the onSearch callback when the user searches', async () => {
      const onSearchMock = jest.fn()
      const searchString = 'TEST SEARCH'

      renderComponent({ onSearch: onSearchMock })

      expect(onSearchMock).not.toHaveBeenCalled()

      await userEvent.type(screen.getByRole('searchbox'), searchString)

      await waitFor(() => expect(onSearchMock).toHaveBeenCalledWith(searchString))
    })
  })

  describe('pagination', function () {
    const getPaginationEl = (): HTMLElement | null => document.querySelector('[class*="Pagination"]')

    test('it should hide the pagination when the state is noSearchResults', async () => {
      renderComponent({ state: AddTargetToTargetGroupsDialogStatus.noSearchResults })

      expect(getPaginationEl()).not.toBeInTheDocument()
    })

    test.each([
      ['show', 1, true],
      ['show', 4, true],
      ['hide', 5, false],
      ['hide', 20, false]
    ])('it should %s the page numbers when there are %s pages', async (_, pageCount, inDocument) => {
      const targetGroups = merge(mockTargetGroupsWithPagination, { pageCount })

      renderComponent({ targetGroups })

      const el = queryByRole(getPaginationEl() as HTMLElement, 'button', { name: '1' })
      if (inDocument) {
        expect(el).toBeInTheDocument()
      } else {
        expect(el).not.toBeInTheDocument()
      }
    })

    test('it should call the setPageNumber callback when the page is changed', async () => {
      const targetGroups = merge(mockTargetGroupsWithPagination, { pageCount: 2 })
      const setPageNumberMock = jest.fn()

      renderComponent({ targetGroups, setPageNumber: setPageNumberMock })

      expect(setPageNumberMock).not.toHaveBeenCalled()

      userEvent.click(getByRole(getPaginationEl() as HTMLElement, 'button', { name: '2' }))

      await waitFor(() => {
        // sent page number is 0 indexed, so 1 lower than button clicked
        expect(setPageNumberMock).toHaveBeenCalledWith(1)
      })
    })
  })

  test('it should call the setFieldValue callback when a row is clicked', async () => {
    const setFieldValueMock = jest.fn()
    const firstRowData = mockTargetGroups[0]

    renderComponent({ setFieldValue: setFieldValueMock })

    expect(setFieldValueMock).not.toHaveBeenCalled()
    userEvent.click(screen.getByText(firstRowData.name))

    await waitFor(() => expect(setFieldValueMock).toHaveBeenCalledWith(`targetGroups.${firstRowData.identifier}`, true))
  })

  test('it should show the loading indicator when loading', async () => {
    renderComponent({ state: AddTargetToTargetGroupsDialogStatus.loading })

    expect(screen.getByTestId('container-spinner')).toBeInTheDocument()
  })
})
