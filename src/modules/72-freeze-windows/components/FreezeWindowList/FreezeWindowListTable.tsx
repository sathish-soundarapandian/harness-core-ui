/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { Column } from 'react-table'
import { TableV2 } from '@harness/uicore'
import type { PageFreezeResponse, ResponsePageFreezeResponse } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@pipeline/utils/constants'
import type { SortBy } from '@freeze-windows/pages/FreezeWindowsPage/types'
import { MenuCell, LastModifiedCell, FreezeNameCell, FreezeTimeCell, StatusCell } from './FreezeWindowListCells'
import css from './FreezeWindowList.module.scss'

export interface FreezeWindowListColumnActions {
  onViewFreezeWindow: (freezeWindow: PageFreezeResponse) => void
  onDeleteFreezeWindow: (freezeWindow: PageFreezeResponse) => void
  getViewFreezeWindowLink: (freezeWindow: PageFreezeResponse) => string
}

export interface FreezeWindowListTableProps extends FreezeWindowListColumnActions {
  data: PageFreezeResponse
  gotoPage: (pageNumber: number) => void
  setSortBy: (sortBy: string[]) => void
  sortBy: string[]
}

export function FreezeWindowListTable({
  data,
  gotoPage,
  sortBy,
  setSortBy,
  onViewFreezeWindow,
  onDeleteFreezeWindow,
  getViewFreezeWindowLink
}: FreezeWindowListTableProps): React.ReactElement {
  const { getString } = useStrings()
  const {
    content = [],
    totalItems = 0,
    totalPages = 0,
    pageIndex = DEFAULT_PAGE_INDEX,
    pageSize = DEFAULT_PAGE_SIZE
  } = data
  const [currentSort, currentOrder] = sortBy

  const columns: Column<ResponsePageFreezeResponse>[] = React.useMemo(() => {
    const getServerSortProps = (id: string) => {
      return {
        enableServerSort: true,
        isServerSorted: currentSort === id,
        isServerSortedDesc: currentOrder === 'DESC',
        getSortedColumn: ({ sort }: SortBy) => {
          setSortBy([sort, currentOrder === 'DESC' ? 'ASC' : 'DESC'])
        }
      }
    }
    return [
      {
        Header: 'Name',
        accessor: 'name',
        width: '25%',
        Cell: FreezeNameCell,
        serverSortProps: getServerSortProps('name'),
        getViewFreezeWindowLink
      },
      {
        Header: 'Freeze Time',
        accessor: 'freezeTime',
        width: '30%',
        Cell: FreezeTimeCell,
        disableSortBy: true
      },
      {
        Header: 'Status',
        accessor: 'status',
        width: '20%',
        Cell: StatusCell,
        disableSortBy: true
      },
      {
        Header: getString('common.lastModified'),
        accessor: 'lastUpdatedAt',
        width: '20%',
        Cell: LastModifiedCell,
        serverSortProps: getServerSortProps('lastUpdatedAt')
      },
      {
        Header: '',
        accessor: 'menu',
        width: '5%',
        Cell: MenuCell,
        disableSortBy: true,
        getViewFreezeWindowLink,
        onDeleteFreezeWindow
      }
    ] as unknown as Column<ResponsePageFreezeResponse>[]
  }, [currentOrder, currentSort, getString, getViewFreezeWindowLink, onDeleteFreezeWindow, setSortBy])

  return (
    <TableV2
      className={css.table}
      columns={columns}
      data={content}
      pagination={
        totalItems > pageSize
          ? {
              itemCount: totalItems,
              pageCount: totalPages,
              pageSize,
              pageIndex,
              gotoPage
            }
          : undefined
      }
      sortable
      onRowClick={rowDetails => onViewFreezeWindow(rowDetails)}
    />
  )
}
