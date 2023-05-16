/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { Renderer, CellProps } from 'react-table'
import type { RbacResourceRendererProps } from '@rbac/factories/RbacFactory'
import StaticResourceRenderer from '@rbac/components/StaticResourceRenderer/StaticResourceRenderer'
import { PageSpinner } from '@common/components'
import { useMutateAsGet } from '@common/hooks/useMutateAsGet'
import type { UserGroupDTO } from 'services/cd-ng';
import { useGetBatchUserGroupList } from 'services/cd-ng'
import { UserGroupColumn } from '@rbac/pages/UserGroups/views/UserGroupsListView'

const RenderColumnUserGroup: Renderer<CellProps<UserGroupDTO>> = ({ row }) => {
  const data = row.original
  return UserGroupColumn(data)
}

const UserGroupssResourceRenderer: React.FC<RbacResourceRendererProps> = ({
  identifiers,
  resourceScope,
  resourceType,
  onResourceSelectionChange
}) => {
  const { accountIdentifier, orgIdentifier, projectIdentifier } = resourceScope
  const { data, loading } = useMutateAsGet(useGetBatchUserGroupList, {
    body: { accountIdentifier, orgIdentifier, projectIdentifier, identifierFilter: identifiers }
  })

  const userGroups = data?.data

  if (loading) return <PageSpinner />
  return userGroups?.length ? (
    <StaticResourceRenderer
      data={userGroups}
      resourceType={resourceType}
      onResourceSelectionChange={onResourceSelectionChange}
      columns={[
        {
          Header: '',
          id: 'name',
          accessor: 'name',
          width: '95%',
          Cell: RenderColumnUserGroup,
          disableSortBy: true
        }
      ]}
    />
  ) : null
}

export default UserGroupssResourceRenderer
