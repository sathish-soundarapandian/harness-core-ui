/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import type { CellProps, Column } from 'react-table'
import { Container, Layout, Text, Icon } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import ResourceHandlerTable from '@rbac/components/ResourceHandlerTable/ResourceHandlerTable'
import { PageSpinner } from '@common/components'
import type { RbacResourceModalProps } from '@rbac/factories/RbacFactory'
import { useStrings } from 'framework/strings'
import { CEViewFolder, useGetFolders } from 'services/ce'
import css from './PerspectiveResourceModalBody.module.scss'

type ParsedColumnContent = CEViewFolder & { identifier: string }

const PerspectiveResourceModalBody: React.FC<RbacResourceModalProps> = ({
  searchTerm,
  resourceScope,
  onSelectChange,
  selectedData
}) => {
  const { getString } = useStrings()
  const { accountIdentifier } = resourceScope
  const { data: foldersListResult, loading: foldersLoading } = useGetFolders({
    queryParams: {
      accountIdentifier: accountIdentifier,
      folderNamePattern: searchTerm
    }
  })
  const data = foldersListResult?.data

  const foldersDataContent = data?.map(dataContent => ({
    identifier: dataContent.uuid,
    ...dataContent
  }))

  const columns: Column<ParsedColumnContent>[] = useMemo(
    () => [
      {
        Header: getString('ce.perspectives.folders.title').toUpperCase(),
        accessor: 'name',
        id: 'name',
        width: '95%',
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  if (foldersLoading) return <PageSpinner />
  return foldersDataContent?.length ? (
    <Container>
      <ResourceHandlerTable
        data={foldersDataContent as ParsedColumnContent[]}
        selectedData={selectedData}
        columns={columns}
        onSelectChange={onSelectChange}
      />
    </Container>
  ) : (
    <Layout.Vertical flex={{ align: 'center-center' }} spacing="small" className={css.noDataContainer}>
      <Icon name="resources-icon" size={20} />
      <Text font={{ variation: FontVariation.BODY1 }} color={Color.BLACK}>
        {getString('noData')}
      </Text>
    </Layout.Vertical>
  )
}

export default PerspectiveResourceModalBody
