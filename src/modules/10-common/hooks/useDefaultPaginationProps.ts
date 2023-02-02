/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { PopoverPosition } from '@blueprintjs/core'
import type { PaginationProps } from '@harness/uicore'
import { useUpdateQueryParams } from './useUpdateQueryParams'

export type CommonPaginationQueryParams = {
  page?: number
  size?: number
}

export type PaginationPropsWithDefaults = RequiredPick<
  PaginationProps,
  'gotoPage' | 'onPageSizeChange' | 'showPagination' | 'pageSizeDropdownProps' | 'pageSizeOptions'
>

export const useDefaultPaginationProps = (props: PaginationProps): PaginationPropsWithDefaults => {
  const { updateQueryParams } = useUpdateQueryParams<CommonPaginationQueryParams>()
  return {
    gotoPage: page => updateQueryParams({ page }),
    onPageSizeChange: size => updateQueryParams({ page: 0, size }),
    showPagination: true,
    pageSizeDropdownProps: {
      usePortal: true,
      popoverProps: {
        position: PopoverPosition.TOP
      }
    },
    pageSizeOptions: [10, 20, 50, 100],
    ...props
  }
}
