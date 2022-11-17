/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Table } from '@harness/uicore'
import React from 'react'
import type { ASGMinimal } from 'services/lw'
import { NameCell, TableCell } from './common'

interface DisplaySelectedASGProps {
  data: ASGMinimal[]
}

export const DisplaySelectedASG: React.FC<DisplaySelectedASGProps> = props => {
  return (
    <Table<ASGMinimal>
      data={props.data}
      bpTableProps={{}}
      columns={[
        {
          accessor: 'name',
          Header: 'Name and ID',
          width: '16.5%',
          Cell: NameCell
        },
        {
          accessor: 'desired',
          Header: 'Instances',
          width: '10%',
          Cell: TableCell,
          disableSortBy: true
        },
        {
          accessor: 'region',
          Header: 'Region',
          width: '16.5%',
          Cell: TableCell
        }
      ]}
    />
  )
}
