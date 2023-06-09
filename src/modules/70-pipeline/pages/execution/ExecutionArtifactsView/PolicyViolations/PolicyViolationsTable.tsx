/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { TableV2 } from '@harness/uicore'
import React from 'react'
import type { Column } from 'react-table'
import type { EnforcementResult, GetEnforcementResultsByIDResponseBody } from 'services/ssca'
import { useStrings } from 'framework/strings'
import { PackageSupplierCell, PackageNameCell, VersionCell, ViolationsDetailsCell } from './PolicyViolationsTableCells'
import css from './PolicyViolations.module.scss'

export interface PolicyViolationsTableProps {
  data: GetEnforcementResultsByIDResponseBody
}

export function PolicyViolationsTable({ data }: PolicyViolationsTableProps): React.ReactElement {
  const { getString } = useStrings()
  const columns: Column<EnforcementResult>[] = React.useMemo(() => {
    return [
      {
        Header: getString('pipeline.artifactsSelection.packageName'),
        accessor: 'name',
        Cell: PackageNameCell
      },
      {
        Header: getString('version'),
        accessor: 'version',
        Cell: VersionCell
      },
      {
        Header: getString('pipeline.supplier'),
        accessor: 'supplier',
        Cell: PackageSupplierCell
      },
      {
        Header: getString('pipeline.violationDetails'),
        accessor: 'violationDetails',
        Cell: ViolationsDetailsCell,
        disableSortBy: true
      }
    ]
  }, [getString])

  return <TableV2 className={css.table} columns={columns} data={data.results || []} sortable />
}
