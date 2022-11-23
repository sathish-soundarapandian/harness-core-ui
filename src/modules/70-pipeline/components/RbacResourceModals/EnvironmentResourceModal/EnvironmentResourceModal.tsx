/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Container, Layout, Text, Icon } from '@harness/uicore'
import { Color } from '@harness/design-system'
import type { CellProps, Renderer } from 'react-table'
import ResourceHandlerTable, {
  ResourceHandlerTableData
} from '@rbac/components/ResourceHandlerTable/ResourceHandlerTable'
import { PageSpinner } from '@common/components'
import type { RbacResourceModalProps } from '@rbac/factories/RbacFactory'
import { useStrings } from 'framework/strings'
import { EnvironmentResponseDTO, useGetEnvironmentList } from 'services/cd-ng'

// eslint-disable-next-line react/function-component-definition
const RenderColumnPipeline: Renderer<CellProps<EnvironmentResponseDTO>> = ({ row }) => {
  const rowdata = row.original

  return (
    <Layout.Vertical spacing="small" data-testid={rowdata.identifier}>
      <Text color={Color.GREY_800} iconProps={{ size: 16 }}>
        {rowdata.name}
      </Text>
      <Text color={Color.GREY_400}>{rowdata.description}</Text>
    </Layout.Vertical>
  )
}

// eslint-disable-next-line react/function-component-definition
const RenderEnvType: Renderer<CellProps<EnvironmentResponseDTO>> = ({ row }) => {
  const rowdata = row.original

  return (
    <Layout.Vertical spacing="small">
      <Text color={Color.GREY_800} iconProps={{ size: 16 }}>
        {rowdata.type}
      </Text>
    </Layout.Vertical>
  )
}

function EnvironmentResourceModal({
  searchTerm,
  onSelectChange,
  selectedData,
  resourceScope
}: RbacResourceModalProps): React.ReactElement {
  const { accountIdentifier, orgIdentifier = '', projectIdentifier = '' } = resourceScope
  const { getString } = useStrings()
  const [page, setPage] = useState(0)

  const { data: environmentsResponse, loading: isFetchingEnvironments } = useGetEnvironmentList({
    queryParams: { accountIdentifier, orgIdentifier, projectIdentifier, searchTerm, page, size: 10 }
  })

  const environmentsData = environmentsResponse?.data?.content?.map(
    environmentContent => environmentContent.environment
  )

  if (isFetchingEnvironments) return <PageSpinner />

  return environmentsData?.length ? (
    <Container>
      <ResourceHandlerTable
        data={environmentsData as ResourceHandlerTableData[]}
        selectedData={selectedData}
        columns={[
          {
            Header: getString('environment'),
            id: 'name',
            accessor: 'name' as any,
            Cell: RenderColumnPipeline,
            width: '60%',
            disableSortBy: true
          },
          {
            Header: getString('envType'),
            id: 'type',
            accessor: 'type',
            Cell: RenderEnvType,
            width: '20%',
            disableSortBy: true
          }
        ]}
        pagination={{
          itemCount: environmentsResponse?.data?.totalItems || 0,
          pageSize: environmentsResponse?.data?.pageSize || 10,
          pageCount: environmentsResponse?.data?.totalPages ?? 1,
          pageIndex: environmentsResponse?.data?.pageIndex ?? 0,
          gotoPage: pageNumber => setPage(pageNumber)
        }}
        onSelectChange={onSelectChange}
      />
    </Container>
  ) : (
    <Layout.Vertical flex={{ align: 'center-center' }} spacing="small">
      <Icon name="resources-icon" size={20} />
      <Text font="medium" color={Color.BLACK}>
        {getString('noData')}
      </Text>
    </Layout.Vertical>
  )
}

export default EnvironmentResourceModal
