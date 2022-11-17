/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Table } from '@harness/uicore'
import type { RDSDatabase } from 'services/lw'
import { TableCell } from './common'

interface DisplaySelectedRdsDatabaseProps {
  data: RDSDatabase[]
}

export const DisplaySelectedRdsDatabse: React.FC<DisplaySelectedRdsDatabaseProps> = props => {
  return (
    <Table<RDSDatabase>
      data={props.data}
      bpTableProps={{}}
      columns={[
        {
          accessor: 'id',
          Header: 'ID',
          Cell: TableCell,
          disableSortBy: true
        },
        {
          accessor: 'region',
          Header: 'REGION',
          Cell: TableCell,
          disableSortBy: true
        }
      ]}
    />
  )
}
