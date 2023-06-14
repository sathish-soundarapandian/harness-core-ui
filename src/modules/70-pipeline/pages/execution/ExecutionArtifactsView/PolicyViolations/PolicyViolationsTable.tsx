/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { TableV2 } from '@harness/uicore'
import React from 'react'
import type { Column } from 'react-table'
import type { EnforcementGetEnforcementResultsByIDResponseBody, EnforcementResultResponseBody } from 'services/ssca'
import { useStrings } from 'framework/strings'
import {
  PackageSupplierCell,
  PackageNameCell,
  VersionCell,
  ViolationsDetailsCell,
  EnforcementResultColumnActions,
  SortBy
} from './PolicyViolationsTableCells'
import css from './PolicyViolations.module.scss'

export interface PolicyViolationsTableProps extends EnforcementResultColumnActions {
  data: EnforcementGetEnforcementResultsByIDResponseBody | null
}

export function PolicyViolationsTable({ data, sortBy, setSortBy }: PolicyViolationsTableProps): React.ReactElement {
  const { getString } = useStrings()
  const columns: Column<EnforcementResultResponseBody>[] = React.useMemo(() => {
    const getServerSortProps = (id: string) => {
      return {
        enableServerSort: true,
        isServerSorted: sortBy.sort === id,
        isServerSortedDesc: sortBy.order === 'DESC',
        getSortedColumn: ({ sort }: SortBy) => {
          setSortBy({ sort, order: sortBy.order === 'DESC' ? 'ASC' : 'DESC' })
        }
      }
    }

    return [
      {
        Header: getString('pipeline.artifactsSelection.packageName'),
        accessor: 'name',
        Cell: PackageNameCell,
        serverSortProps: getServerSortProps('name')
      },
      {
        Header: getString('version'),
        accessor: 'version',
        Cell: VersionCell,
        disableSortBy: true
      },
      {
        Header: getString('pipeline.supplier'),
        accessor: 'supplier',
        Cell: PackageSupplierCell,
        serverSortProps: getServerSortProps('supplier')
      },
      {
        Header: getString('pipeline.violationDetails'),
        accessor: 'violationDetails',
        Cell: ViolationsDetailsCell,
        disableSortBy: true
      }
    ]
  }, [getString, setSortBy, sortBy.order, sortBy.sort])

  return <TableV2 className={css.table} columns={columns} data={data?.results || []} sortable />
}
