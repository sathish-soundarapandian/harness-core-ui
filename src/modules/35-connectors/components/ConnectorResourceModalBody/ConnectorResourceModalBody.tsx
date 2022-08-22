/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState } from 'react'
import type { Column } from 'react-table'
import { Container, Layout, Text, Icon } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import ResourceHandlerTable from '@rbac/components/ResourceHandlerTable/ResourceHandlerTable'
import { useGetConnectorListV2, ConnectorResponse } from 'services/cd-ng'
import { PageSpinner } from '@common/components'
import type { RbacResourceModalProps } from '@rbac/factories/RbacFactory'
import { useMutateAsGet } from '@common/hooks'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { RenderColumnConnector } from '@connectors/pages/connectors/views/ConnectorsListView'
import css from './ConnectorResourceModalBody.module.scss'

type ParsedColumnContent = ConnectorResponse & { identifier: string }

const ConnectorResourceModalBody: React.FC<RbacResourceModalProps> = ({
  searchTerm,
  onSelectChange,
  selectedData,
  resourceScope
}) => {
  const { accountIdentifier, orgIdentifier, projectIdentifier } = resourceScope
  const [page, setPage] = useState(0)
  const { getString } = useStrings()
  const { isGitSyncEnabled: isGitSyncEnabledForProject, gitSyncEnabledOnlyForFF } = useAppStore()
  const isGitSyncEnabled = isGitSyncEnabledForProject && !gitSyncEnabledOnlyForFF
  const defaultQueryParams = useMemo(
    () => ({
      accountIdentifier,
      searchTerm,
      pageIndex: page,
      pageSize: 10,
      orgIdentifier,
      projectIdentifier,
      ...(isGitSyncEnabled ? { getDistinctFromBranches: true } : {})
    }),
    [accountIdentifier, searchTerm, page, orgIdentifier, projectIdentifier, isGitSyncEnabled]
  )

  const { data: connectorData, loading } = useMutateAsGet(useGetConnectorListV2, {
    body: { filterType: 'Connector' },
    queryParams: defaultQueryParams
  })
  const data = connectorData?.data

  const connectorDataContent = data?.content?.map(dataContent => ({
    identifier: dataContent.connector?.identifier,
    ...dataContent
  }))

  const columns: Column<ParsedColumnContent>[] = useMemo(
    () => [
      {
        Header: getString('connector').toUpperCase(),
        accessor: row => row.connector?.name,
        id: 'name',
        width: '95%',
        Cell: RenderColumnConnector
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  if (loading) return <PageSpinner />
  return !loading && connectorDataContent?.length ? (
    <Container>
      <ResourceHandlerTable
        data={connectorDataContent as ParsedColumnContent[]}
        selectedData={selectedData}
        columns={columns}
        pagination={{
          itemCount: data?.totalItems || 0,
          pageSize: data?.pageSize || 10,
          pageCount: data?.totalPages || -1,
          pageIndex: data?.pageIndex || 0,
          gotoPage: pageNumber => setPage(pageNumber)
        }}
        onSelectChange={onSelectChange}
      />
    </Container>
  ) : (
    <Layout.Vertical flex={{ align: 'center-center' }} spacing="small" className={css.noDataContainer}>
      <Icon name="resources-icon" size={20} />
      <Text font="medium" color={Color.BLACK}>
        {getString('noData')}
      </Text>
    </Layout.Vertical>
  )
}

export default ConnectorResourceModalBody
