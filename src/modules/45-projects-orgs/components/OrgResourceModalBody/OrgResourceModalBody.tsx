/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Container, Layout, Text, Icon } from '@harness/uicore'
import type { CellProps, Renderer } from 'react-table'
import { Color } from '@harness/design-system'
import ResourceHandlerTable from '@rbac/components/ResourceHandlerTable/ResourceHandlerTable'
import { Organization, useGetOrganizationList } from 'services/cd-ng'
import { PageSpinner } from '@common/components'
import type { RbacResourceModalProps } from '@rbac/factories/RbacFactory'
import { useStrings } from 'framework/strings'

const RenderColumnOrganization: Renderer<CellProps<Organization>> = ({ row }) => {
  const data = row.original
  return (
    <Layout.Vertical padding={{ left: 'small' }}>
      <Text color={Color.BLACK} lineClamp={1}>
        {data.name}
      </Text>
      <Text color={Color.GREY_400} lineClamp={1}>
        {data.description}
      </Text>
    </Layout.Vertical>
  )
}

const OrgResourceModalBody: React.FC<RbacResourceModalProps> = ({
  searchTerm,
  onSelectChange,
  selectedData,
  resourceScope
}) => {
  const { accountIdentifier } = resourceScope
  const [page, setPage] = useState(0)
  const { getString } = useStrings()
  const { data, loading } = useGetOrganizationList({
    queryParams: {
      accountIdentifier,
      searchTerm,
      pageIndex: page,
      pageSize: 5
    },
    debounce: 300
  })
  const organizationData = data?.data?.content?.map(organizationResponse => organizationResponse.organization)

  if (loading) return <PageSpinner />
  return organizationData?.length ? (
    <Container>
      <ResourceHandlerTable
        data={organizationData}
        selectedData={selectedData}
        columns={[
          {
            Header: getString('orgLabel'),
            id: 'name',
            accessor: 'name',
            width: '25%',
            Cell: RenderColumnOrganization,
            disableSortBy: true
          }
        ]}
        pagination={{
          itemCount: data?.data?.totalItems || 0,
          pageSize: data?.data?.pageSize || 10,
          pageCount: data?.data?.totalPages || -1,
          pageIndex: data?.data?.pageIndex || 0,
          gotoPage: pageNumber => setPage(pageNumber)
        }}
        onSelectChange={onSelectChange}
      />
    </Container>
  ) : (
    <Layout.Vertical flex={{ align: 'center-center' }} spacing="small">
      <Icon name="nav-project" size={20} />
      <Text font="medium" color={Color.BLACK}>
        {getString('noData')}
      </Text>
    </Layout.Vertical>
  )
}

export default OrgResourceModalBody
