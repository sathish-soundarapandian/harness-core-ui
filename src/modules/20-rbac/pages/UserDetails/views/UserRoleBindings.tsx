/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState } from 'react'
import {
  ButtonSize,
  ButtonVariation,
  Button,
  Color,
  Container,
  FontVariation,
  Layout,
  PageSpinner,
  TableV2,
  Text
} from '@harness/uicore'
import { useHistory, useParams } from 'react-router-dom'
import type { CellProps, Column, Renderer } from 'react-table'
import { defaultTo } from 'lodash-es'
import type { UserPathProps, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { RoleAssignmentAggregate, ScopeSelector, useGetFilteredRoleAssignmentByScopeList } from 'services/rbac'
import { useMutateAsGet } from '@common/hooks'
import { useStrings } from 'framework/strings'
import { RoleBindingTag } from '@rbac/components/RoleBindingsList/RoleBindingsList'
import type { RoleAssignmentMetadataDTO, UserAggregate } from 'services/cd-ng'
import { useRoleAssignmentModal } from '@rbac/modals/RoleAssignmentModal/useRoleAssignmentModal'
import ManagePrincipalButton from '@rbac/components/ManagePrincipalButton/ManagePrincipalButton'
import { PrincipalType } from '@rbac/utils/utils'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import routes from '@common/RouteDefinitions'
import css from '../UserDetails.module.scss'

interface UserRoleBindingsProps {
  scopeFilters: ScopeSelector[]
  user: UserAggregate
}
const RenderColumnRoleAssignments: Renderer<CellProps<RoleAssignmentAggregate>> = ({ row }) => {
  const data = row.original
  /* istanbul ignore next */ const roleAssignment = {
    identifier: data.identifier,
    managedRole: data.role?.harnessManaged,
    managedRoleAssignment: data.harnessManaged,
    resourceGroupIdentifier: data.resourceGroup?.identifier,
    resourceGroupName: data.resourceGroup?.name,
    roleIdentifier: data.role?.role.identifier,
    roleName: data.role?.role.name
  }

  return (
    <Layout.Horizontal spacing="small" flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
      <RoleBindingTag roleAssignment={roleAssignment as RoleAssignmentMetadataDTO} roleScope={data.scope} />
    </Layout.Horizontal>
  )
}

const RenderColumnAssignedAt: Renderer<CellProps<RoleAssignmentAggregate>> = ({ row }) => {
  const scope = row.original.scope
  const { getString } = useStrings()
  /* istanbul ignore next */ if (!scope) {
    return <></>
  }

  const organization = (
    <Text lineClamp={1} font={{ variation: FontVariation.SMALL }} color={Color.GREY_600} icon="nav-organization">
      {scope?.orgName}
    </Text>
  )

  if (scope.projectName) {
    return (
      <Layout.Horizontal
        padding={{ right: 'medium' }}
        spacing="small"
        flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
      >
        <Text lineClamp={1} font={{ variation: FontVariation.SMALL }} color={Color.GREY_600} icon="nav-project">
          {scope.projectName}
        </Text>
        <Text font={{ variation: FontVariation.TINY }} color={Color.GREY_600}>
          {getString('common.at')}
        </Text>
        {organization}
      </Layout.Horizontal>
    )
  } else if (scope.orgName) {
    return organization
  } else
    return (
      <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_600} icon="Account">
        {getString('account')}
      </Text>
    )
}

const RenderColumnAssignedThrough: Renderer<CellProps<RoleAssignmentAggregate>> = ({ row }) => {
  const data = row.original
  const { getString } = useStrings()
  const history = useHistory()
  const principal = data.principal
  const isViaUserGroup = principal?.type === 'USER_GROUP'

  return isViaUserGroup && principal ? (
    <Button
      text={principal.name}
      variation={ButtonVariation.LINK}
      size={ButtonSize.SMALL}
      color={Color.GREY_600}
      icon="user-groups"
      onClick={
        /* istanbul ignore next */ () => {
          history.push({
            pathname: routes.toUserGroupDetails({
              accountId: defaultTo(data.scope?.accountIdentifier, ''),
              orgIdentifier: data.scope?.orgIdentifier,
              projectIdentifier: data.scope?.projectIdentifier,
              userGroupIdentifier: principal.identifier
            }),
            search: `?parentScope=${principal.scopeLevel}`
          })
        }
      }
    />
  ) : (
    <Text color={Color.GREY_600} icon="arrow">
      {getString('common.directly')}
    </Text>
  )
}

const UserRoleBindings: React.FC<UserRoleBindingsProps> = ({ user, scopeFilters }) => {
  const { accountId, orgIdentifier, projectIdentifier, userIdentifier } = useParams<ProjectPathProps & UserPathProps>()
  const [page, setPage] = useState(0)
  const { getString } = useStrings()
  const { data, loading, refetch } = useMutateAsGet(useGetFilteredRoleAssignmentByScopeList, {
    body: {
      scopeFilters,
      principalFilter: {
        identifier: userIdentifier,
        type: PrincipalType.USER
      }
    },
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      pageIndex: page,
      pageSize: 10
    }
  })

  const { openRoleAssignmentModal } = useRoleAssignmentModal({
    onSuccess: refetch
  })

  const columns: Column<RoleAssignmentAggregate>[] = useMemo(
    () => [
      {
        Header: getString('rbac.roleBinding'),
        id: 'roleBindings',
        accessor: row => row.identifier,
        width: '40%',
        Cell: RenderColumnRoleAssignments
      },
      {
        Header: getString('common.assignedAt'),
        id: 'assignedAt',
        accessor: row => row.scope?.accountName,
        width: '30%',
        Cell: RenderColumnAssignedAt
      },
      {
        Header: getString('common.assignedThrough'),
        id: 'assignedThrough',
        accessor: row => row.role?.createdAt,
        width: '24%',
        Cell: RenderColumnAssignedThrough
      },
      {
        Header: (
          <ManagePrincipalButton
            data-testid={'addRole-UserGroup'}
            text={getString('common.plusNumber', { number: getString('common.role') })}
            variation={ButtonVariation.SECONDARY}
            size={ButtonSize.SMALL}
            onClick={
              /* istanbul ignore next */ event => {
                event.stopPropagation()
                openRoleAssignmentModal(PrincipalType.USER, user.user, user.roleAssignmentMetadata)
              }
            }
            resourceIdentifier={userIdentifier}
            resourceType={ResourceType.USER}
          />
        ),
        id: 'addRole',
        accessor: row => row.role?.harnessManaged,
        width: '6%',
        Cell: <></>
      }
    ],
    []
  )

  return (
    <Container className={css.body}>
      {loading && <PageSpinner />}
      <TableV2
        data={data?.data?.content || []}
        columns={columns}
        name="UserRoleBindingsView"
        className={css.roleBindingTable}
        pagination={{
          itemCount: data?.data?.totalItems || 0,
          pageSize: data?.data?.pageSize || 10,
          pageCount: data?.data?.totalPages || 0,
          pageIndex: data?.data?.pageIndex || 0,
          gotoPage: index => setPage(index)
        }}
      />
    </Container>
  )
}

export default UserRoleBindings
