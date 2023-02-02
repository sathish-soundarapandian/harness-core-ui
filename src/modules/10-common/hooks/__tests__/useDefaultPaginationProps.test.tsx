/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { renderHook } from '@testing-library/react-hooks'
import { PopoverPosition } from '@blueprintjs/core'
import { useDefaultPaginationProps } from '../useDefaultPaginationProps'
import * as useUpdateQueryParams from '../useUpdateQueryParams'

const initialProps = {
  pageSize: 10,
  pageCount: 10,
  itemCount: 100
}

describe('useDefaultPaginationProps', () => {
  test('should return pagination props with default values for the missing props', () => {
    jest.spyOn(useUpdateQueryParams, 'useUpdateQueryParams').mockReturnValue({
      updateQueryParams: jest.fn(),
      replaceQueryParams: jest.fn()
    })

    const { result, rerender } = renderHook(useDefaultPaginationProps, {
      initialProps
    })

    expect(result.current).toEqual({
      pageSize: 10,
      pageCount: 10,
      itemCount: 100,
      gotoPage: expect.any(Function),
      onPageSizeChange: expect.any(Function),
      showPagination: true,
      pageSizeDropdownProps: { usePortal: true, popoverProps: { position: PopoverPosition.TOP } },
      pageSizeOptions: [10, 20, 50, 100]
    })

    rerender({ pageSize: 10, pageCount: 10, itemCount: 100, pageSizeOptions: [5, 10], showPagination: false })

    expect(result.current).toEqual({
      pageSize: 10,
      pageCount: 10,
      itemCount: 100,
      gotoPage: expect.any(Function),
      onPageSizeChange: expect.any(Function),
      showPagination: false,
      pageSizeDropdownProps: { usePortal: true, popoverProps: { position: PopoverPosition.TOP } },
      pageSizeOptions: [5, 10]
    })
  })

  test('should call updateQueryParams with the expected params when gotoPage is called', () => {
    const updateQueryParams = jest.fn()
    jest.spyOn(useUpdateQueryParams, 'useUpdateQueryParams').mockReturnValue({
      updateQueryParams,
      replaceQueryParams: jest.fn()
    })

    const { result } = renderHook(useDefaultPaginationProps, {
      initialProps
    })

    result.current.gotoPage(5)

    expect(updateQueryParams).toHaveBeenCalledWith({ page: 5 })
  })

  test('should call updateQueryParams with the expected params when onPageSizeChange is called', () => {
    const updateQueryParams = jest.fn()
    jest.spyOn(useUpdateQueryParams, 'useUpdateQueryParams').mockReturnValue({
      updateQueryParams,
      replaceQueryParams: jest.fn()
    })

    const { result } = renderHook(useDefaultPaginationProps, {
      initialProps
    })

    result.current.onPageSizeChange(20)

    expect(updateQueryParams).toHaveBeenCalledWith({ page: 0, size: 20 })
  })
})
