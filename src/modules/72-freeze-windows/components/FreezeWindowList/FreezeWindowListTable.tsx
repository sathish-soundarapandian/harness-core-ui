/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { Column } from 'react-table'
import { Color, TableV2, Text } from '@harness/uicore'
import type { SortBy } from '@freeze-windows/types'
import type { FreezeSummaryResponse, PageFreezeSummaryResponse } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@pipeline/utils/constants'
import {
  MenuCell,
  LastModifiedCell,
  FreezeWindowCell,
  ScheduleCell,
  StatusCell,
  RowSelectCell,
  FreezeWindowListColumnActions
} from './FreezeWindowListCells'
import { ToggleAllSelection } from './ToggleAllSelection'
import css from './FreezeWindowList.module.scss'

export interface FreezeWindowListTableProps extends FreezeWindowListColumnActions {
  data: PageFreezeSummaryResponse
  gotoPage: (pageNumber: number) => void
  setSortBy: (sortBy: string[]) => void
  sortBy: string[]
}

export function FreezeWindowListTable({
  data,
  gotoPage,
  sortBy,
  setSortBy,
  onRowSelectToggle,
  onToggleFreezeRow,
  onDeleteRow,
  onViewFreezeRow,
  getViewFreezeRowLink,
  selectedItems,
  disabled,
  freezeStatusMap
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

  const columns: Column<FreezeSummaryResponse>[] = React.useMemo(() => {
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
        Header: <ToggleAllSelection data={content} />,
        id: 'rowSelectToggle',
        width: '2%',
        Cell: RowSelectCell,
        disableSortBy: true,
        onRowSelectToggle,
        selectedItems,
        disabled
      },
      {
        Header: 'Freeze Window',
        accessor: 'name',
        width: '27%',
        Cell: FreezeWindowCell,
        serverSortProps: getServerSortProps('name'),
        getViewFreezeRowLink,
        onToggleFreezeRow,
        disabled
      },
      {
        Header: 'Schedule',
        accessor: 'schedule',
        width: '35%',
        Cell: ScheduleCell,
        disableSortBy: true
      },
      {
        Header: (
          <Text tooltipProps={{ dataTooltipId: 'freezeStatusColumnTitle' }} color={Color.GREY_800}>
            Status
          </Text>
        ),
        accessor: 'status',
        width: '16%',
        Cell: StatusCell,
        disableSortBy: true,
        freezeStatusMap
      },
      {
        Header: getString('common.lastModified'),
        accessor: 'lastUpdatedAt',
        width: '15%',
        Cell: LastModifiedCell,
        serverSortProps: getServerSortProps('lastUpdatedAt')
      },
      {
        Header: '',
        accessor: 'menu',
        width: '5%',
        Cell: MenuCell,
        disableSortBy: true,
        getViewFreezeRowLink,
        onDeleteRow,
        onToggleFreezeRow,
        disabled,
        freezeStatusMap
      }
    ] as unknown as Column<FreezeSummaryResponse>[]
  }, [currentOrder, currentSort, selectedItems, disabled, freezeStatusMap])

  return (
    <TableV2
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
      onRowClick={rowDetails => onViewFreezeRow(rowDetails)}
      className={css.table}
    />
  )
}
