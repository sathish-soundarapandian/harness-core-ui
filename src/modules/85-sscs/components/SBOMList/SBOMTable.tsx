/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { TableV2 } from '@harness/uicore'
import React, { FC } from 'react'
import type { Column } from 'react-table'
import type { PackageReferenceResponseBody } from 'services/sscs'
import { NameCell, OriginatorCell, StageNameCell, VersionInfoCell } from './SBOMTableCells'
import css from './SBOMList.module.scss'

export const SBOMTable: FC<{ data: PackageReferenceResponseBody[] }> = ({ data }) => {
  const columns: Column<PackageReferenceResponseBody>[] = React.useMemo(() => {
    return [
      {
        Header: 'Name',
        accessor: 'name',
        width: '25%',
        Cell: NameCell
      },
      {
        Header: 'Originator',
        accessor: 'originator',
        width: '25%',
        Cell: OriginatorCell
      },
      {
        Header: 'StageName',
        accessor: 'Stage Name',
        width: '25%',
        Cell: StageNameCell
      },
      {
        Header: 'VersionInfo',
        accessor: 'Version',
        width: '25%',
        Cell: VersionInfoCell
      }
    ] as unknown as Column<PackageReferenceResponseBody>[]
  }, [])

  return <TableV2 className={css.table} columns={columns} data={data} sortable />
}
