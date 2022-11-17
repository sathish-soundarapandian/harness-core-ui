/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Container, Layout, Text, Icon } from '@harness/uicore'
import { Color } from '@harness/design-system'
import type { Renderer, CellProps } from 'react-table'
import ResourceHandlerTable from '@rbac/components/ResourceHandlerTable/ResourceHandlerTable'
import { PageSpinner } from '@common/components'
import type { RbacResourceModalProps } from '@rbac/factories/RbacFactory'
import { useStrings } from 'framework/strings'
import { useGetUserGroupAggregateList, UserGroupAggregateDTO } from 'services/cd-ng'
import { UserGroupColumn } from '@rbac/pages/UserGroups/views/UserGroupsListView'

type UserGroupAggregate = UserGroupAggregateDTO & { identifier: string }

const RenderColumnUserGroup: Renderer<CellProps<UserGroupAggregate>> = ({ row }) => {
  const data = row.original.userGroupDTO
  return UserGroupColumn(data)
}

const UserGroupsResourceModalBody: React.FC<RbacResourceModalProps> = ({
  searchTerm,
  onSelectChange,
  selectedData,
  resourceScope
}) => {
  const { accountIdentifier, orgIdentifier, projectIdentifier } = resourceScope
  const [page, setPage] = useState(0)
  const { getString } = useStrings()
  const { data, loading } = useGetUserGroupAggregateList({
    queryParams: {
      accountIdentifier,
      orgIdentifier,
      projectIdentifier,
      pageIndex: page,
      pageSize: 10,
      searchTerm
    },
    debounce: 300
  })

  const userGroups = data?.data?.content?.map(resource => ({
    ...resource,
    identifier: resource.userGroupDTO.identifier
  }))

  if (loading) return <PageSpinner />
  return userGroups?.length ? (
    <Container>
      <ResourceHandlerTable<UserGroupAggregate>
        data={userGroups}
        selectedData={selectedData}
        columns={[
          {
            Header: getString('common.userGroup'),
            id: 'name',
            accessor: row => row.userGroupDTO.name,
            width: '95%',
            Cell: RenderColumnUserGroup,
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
      <Icon name="resources-icon" size={20} />
      <Text font="medium" color={Color.BLACK}>
        {getString('noData')}
      </Text>
    </Layout.Vertical>
  )
}

export default UserGroupsResourceModalBody
