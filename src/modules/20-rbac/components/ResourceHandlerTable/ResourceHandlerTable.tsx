/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { Checkbox, PaginationProps, TableV2 } from '@wings-software/uicore'
import type { CellProps, Column } from 'react-table'
import produce from 'immer'
import css from './ResourceHandlerTable.module.scss'

interface ResourceHandlerTableProps<T extends ResourceHandlerTableData> {
  data: T[]
  columns: Column<T>[]
  selectedData?: string[]
  pagination?: PaginationProps
  onSelectChange: (items: string[]) => void
  hideHeaders?: boolean
}

export interface ResourceHandlerTableData {
  identifier: string
}

const ResourceHandlerTable = <T extends ResourceHandlerTableData>(
  props: ResourceHandlerTableProps<T>
): React.ReactElement => {
  const { data, pagination, columns, onSelectChange, selectedData = [], hideHeaders = false } = props

  const handleSelectChange = (isSelect: boolean, identifier: string): void => {
    if (isSelect) onSelectChange([...selectedData, identifier])
    else
      onSelectChange(
        produce(selectedData, draft => {
          draft?.splice(draft.indexOf(identifier), 1)
        })
      )
  }

  const resourceHandlerTableColumns: Column<T>[] = useMemo(
    () => [
      {
        id: 'enabled',
        accessor: 'identifier',
        width: '5%',
        disableSortBy: true,
        // eslint-disable-next-line react/display-name
        Cell: ({ row }: CellProps<T>) => {
          return (
            <Checkbox
              key={row.original.identifier}
              className={css.checkBox}
              defaultChecked={selectedData.includes(row.original.identifier)}
              onChange={(event: React.FormEvent<HTMLInputElement>) => {
                handleSelectChange(event.currentTarget.checked, row.original.identifier)
              }}
            />
          )
        }
      },
      ...columns
    ],
    [selectedData]
  )
  return (
    <TableV2<T>
      columns={resourceHandlerTableColumns}
      data={data}
      pagination={pagination}
      hideHeaders={hideHeaders}
      onRowClick={row => {
        handleSelectChange(!selectedData.includes(row.identifier), row.identifier)
      }}
    />
  )
}

export default ResourceHandlerTable
