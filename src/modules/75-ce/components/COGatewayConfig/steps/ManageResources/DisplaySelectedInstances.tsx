/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import type { CellProps, Column } from 'react-table'
import { Button, Table } from '@harness/uicore'
import type { InstanceDetails } from '@ce/components/COCreateGateway/models'
import { NameCell, TableCell } from './common'
import css from '../../COGatewayConfig.module.scss'

interface DisplaySelectedInstancesProps {
  data: InstanceDetails[]
  onDelete: (index: number) => void
}

export const DisplaySelectedInstances: React.FC<DisplaySelectedInstancesProps> = props => {
  const RemoveCell = (tableProps: CellProps<InstanceDetails>) => {
    return <Button className={css.clearBtn} icon={'delete'} onClick={() => props.onDelete(tableProps.row.index)} />
  }

  const columns: Array<Column<InstanceDetails>> = useMemo(
    () => [
      {
        accessor: 'name',
        Header: 'NAME AND ID',
        width: '15%',
        Cell: NameCell
      },
      {
        accessor: 'ipv4',
        Header: 'IP ADDRESS',
        width: '15%',
        Cell: TableCell,
        disableSortBy: true
      },
      {
        accessor: 'region',
        Header: 'REGION',
        width: '10%',
        Cell: TableCell
      },
      {
        accessor: 'type',
        Header: 'TYPE',
        width: '15%',
        Cell: TableCell
      },
      {
        accessor: 'tags',
        Header: 'TAGS',
        width: '15%',
        Cell: TableCell
      },
      {
        accessor: 'launch_time',
        Header: 'LAUNCH TIME',
        width: '15%',
        Cell: TableCell
      },
      {
        accessor: 'status',
        Header: 'STATUS',
        width: '15%',
        Cell: TableCell
      },
      {
        Header: '',
        id: 'menu',
        accessor: row => row.id,
        width: '5%',
        Cell: RemoveCell,
        disableSortBy: true
      }
    ],
    [props.data]
  )
  return <Table<InstanceDetails> data={props.data} bpTableProps={{}} className={css.instanceTable} columns={columns} />
}
