/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { Button, Text, Icon, Layout, PageSpinner, TableV2 } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import type { CellProps, Column } from 'react-table'
import { defaultTo } from 'lodash-es'
import type { RbacResourceRendererProps } from '@rbac/factories/RbacFactory'
import { CEViewFolder, useGetFolders } from 'services/ce'

const PerspectiveResourceRenderer: React.FC<RbacResourceRendererProps> = ({
  identifiers,
  resourceScope,
  resourceType,
  onResourceSelectionChange
}) => {
  const { accountIdentifier } = resourceScope

  const { data: foldersListResult, loading: foldersLoading } = useGetFolders({
    queryParams: {
      accountIdentifier: accountIdentifier
    }
  })
  const data = defaultTo(foldersListResult?.data, [])

  const filteredFoldersData = data.filter(item => item.uuid && identifiers.includes(item.uuid))

  const columns: Column<CEViewFolder>[] = useMemo(
    () => [
      {
        id: 'name',
        accessor: 'name',
        width: '95%',
        disableSortBy: true,
        Cell: ({ row }: CellProps<CEViewFolder>) => {
          return (
            <Layout.Horizontal spacing={'small'}>
              <Icon name="main-folder" color={Color.GREY_600} />
              <Text font={{ variation: FontVariation.BODY2_SEMI }} color={Color.GREY_600}>
                {row.original.name}
              </Text>
            </Layout.Horizontal>
          )
        }
      },
      {
        id: 'removeBtn',
        width: '5%',
        disableSortBy: true,
        Cell: ({ row }: CellProps<CEViewFolder>) => {
          return (
            <Button
              data-test-id={`deleteIcon_${row.original.uuid}`}
              icon="trash"
              minimal
              onClick={() => {
                onResourceSelectionChange(resourceType, false, [row.original.uuid || ''])
              }}
            />
          )
        }
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  if (foldersLoading) return <PageSpinner />

  return <TableV2 columns={columns} data={filteredFoldersData} hideHeaders={true} />
}

export default PerspectiveResourceRenderer
