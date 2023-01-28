/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { renderHook } from '@testing-library/react-hooks'
import { usePreviousPageWhenEmpty } from '../usePreviousPageWhenEmpty'
import * as useUpdateQueryParams from '../useUpdateQueryParams'

describe('usePreviousPageWhenEmpty', () => {
  test('should call updateQueryParams with the expected params when page has no items and when not on first page', () => {
    const updateQueryParams = jest.fn()
    jest.spyOn(useUpdateQueryParams, 'useUpdateQueryParams').mockReturnValue({
      updateQueryParams,
      replaceQueryParams: jest.fn()
    })

    const { rerender } = renderHook<{ page?: number; pageItemCount?: number }, void>(usePreviousPageWhenEmpty, {
      initialProps: {
        page: undefined,
        pageItemCount: undefined
      }
    })

    expect(updateQueryParams).not.toHaveBeenCalled()

    rerender({
      page: 0,
      pageItemCount: 0
    })

    expect(updateQueryParams).not.toHaveBeenCalled()

    rerender({
      page: 5,
      pageItemCount: 0
    })

    expect(updateQueryParams).toHaveBeenCalledWith({ page: 4 })
  })
})
