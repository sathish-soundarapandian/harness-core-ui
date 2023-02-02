/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useEffect } from 'react'
import { isNil } from 'lodash-es'
import { useUpdateQueryParams } from './useUpdateQueryParams'

export type UsePreviousPageWhenEmpty = (arg: { page?: number; pageItemCount?: number }) => void

export const usePreviousPageWhenEmpty: UsePreviousPageWhenEmpty = ({ page, pageItemCount }): void => {
  const { updateQueryParams } = useUpdateQueryParams<{ page: number }>()

  useEffect(() => {
    if (pageItemCount === 0 && !isNil(page) && page > 0) {
      updateQueryParams({ page: page - 1 })
    }
  }, [page, pageItemCount, updateQueryParams])
}
