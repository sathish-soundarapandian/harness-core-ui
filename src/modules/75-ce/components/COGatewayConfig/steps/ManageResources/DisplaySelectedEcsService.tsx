/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Table } from '@harness/uicore'
import type { ContainerSvc } from 'services/lw'
import { TableCell } from './common'

interface DisplaySelectedEcsServiceProps {
  data: ContainerSvc[]
}

export const DisplaySelectedEcsService: React.FC<DisplaySelectedEcsServiceProps> = props => {
  return (
    <Table<ContainerSvc>
      data={props.data}
      bpTableProps={{}}
      columns={[
        {
          accessor: 'cluster',
          Header: 'Cluster',
          width: '10%',
          Cell: TableCell,
          disableSortBy: true
        },
        {
          accessor: 'service',
          Header: 'Service',
          width: '10%',
          Cell: TableCell,
          disableSortBy: true
        },
        {
          accessor: 'region',
          Header: 'Region',
          width: '16.5%',
          Cell: TableCell
        },
        {
          accessor: 'task_count',
          Header: 'Current Task Count',
          width: '10%',
          Cell: TableCell,
          disableSortBy: true
        }
      ]}
    />
  )
}
