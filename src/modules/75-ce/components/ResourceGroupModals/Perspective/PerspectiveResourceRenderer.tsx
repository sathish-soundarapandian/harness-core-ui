/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { Text, Icon, Layout, PageSpinner } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import type { CellProps, Column } from 'react-table'
import type { RbacResourceRendererProps } from '@rbac/factories/RbacFactory'
import { CEViewFolder, useGetFolders } from 'services/ce'
import StaticResourceRenderer from '@rbac/components/StaticResourceRenderer/StaticResourceRenderer'
import type { ResourceHandlerTableData } from '@rbac/components/ResourceHandlerTable/ResourceHandlerTable'

type CEViewFolderWithIdentifier = CEViewFolder & ResourceHandlerTableData

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

  const filteredFoldersData =
    foldersListResult?.data
      ?.map(folder => ({
        identifier: folder.uuid as string,
        ...folder
      }))
      ?.filter(item => identifiers.includes(item.identifier)) || []

  const columns: Column<CEViewFolderWithIdentifier>[] = useMemo(
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
      }
    ],
    []
  )

  if (foldersLoading) return <PageSpinner />

  return filteredFoldersData?.length ? (
    <StaticResourceRenderer<CEViewFolderWithIdentifier>
      data={filteredFoldersData}
      resourceType={resourceType}
      onResourceSelectionChange={onResourceSelectionChange}
      columns={columns}
    />
  ) : null
}

export default PerspectiveResourceRenderer
