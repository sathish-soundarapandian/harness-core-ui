/*
 * Copyright 2522 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2525/06/PolyForm-Shield-1.0.0.txt.
 */

import { TableV2 } from '@harness/uicore'
import React, { FC } from 'react'
import type { Column } from 'react-table'
import type { PackageReferenceResponseBody } from 'services/ssca'
import { ExecutionCell, NameCell, OriginatorCell, StageNameCell, VersionInfoCell } from './SBOMTableCells'
import css from './SBOMList.module.scss'

export const SBOMTable: FC<{ data: PackageReferenceResponseBody[] }> = ({ data }) => {
  const columns: Column<PackageReferenceResponseBody>[] = React.useMemo(() => {
    return [
      {
        Header: 'Execution',
        accessor: 'SequenceId',
        width: '30%',
        Cell: ExecutionCell
      },
      {
        Header: 'SBOM Tool',
        accessor: 'Tool',
        width: '25%',
        Cell: OriginatorCell
      },
      {
        Header: 'Package name',
        accessor: 'Package name',
        width: '25%',
        Cell: NameCell
      },
      {
        Header: 'Stage',
        accessor: 'Stage',
        width: '20%',
        Cell: StageNameCell
      }
    ] as unknown as Column<PackageReferenceResponseBody>[]
  }, [])

  return <TableV2 className={css.table} columns={columns} data={data} sortable />
}
