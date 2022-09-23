/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import type { CellProps, Column, Renderer } from 'react-table'
import {
  Text,
  Button,
  Container,
  TableV2,
  useConfirmationDialog,
  ButtonVariation,
  AvatarGroup,
  ButtonSize,
  Page
} from '@wings-software/uicore'
import { FontVariation, Intent } from '@harness/design-system'
import { Classes, Menu, Popover, Position, PopoverInteractionKind } from '@blueprintjs/core'
import { defaultTo } from 'lodash-es'
import { useToaster } from '@common/components'
import { useMutateAsGet } from '@common/hooks'
import type { PipelineType, ProjectPathProps, UserPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import {
  AddUsers,
  ResponsePageUserGroupAggregateDTO,
  ScopeSelector,
  useAddUsers,
  useGetUserGroupAggregateListByUser,
  UserAggregate,
  useRemoveMember,
  UserGroupAggregateDTO
} from 'services/cd-ng'
import ManagePrincipalButton from '@rbac/components/ManagePrincipalButton/ManagePrincipalButton'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import useSelectUserGroupsModal from '@common/modals/SelectUserGroups/useSelectUserGroupsModal'
import { getPrincipalScopeFromDTO, getScopeFromDTO } from '@common/components/EntityReference/EntityReference'
import type { ScopeAndIdentifier } from '@common/components/MultiSelectEntityReference/MultiSelectEntityReference'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { UserGroupColumn } from '@rbac/pages/UserGroups/views/UserGroupsListView'
import UserGroupEmptyState from '@rbac/pages/UserGroups/user-group-empty-state.png'
import routes from '@common/RouteDefinitions'
import css from '@rbac/pages/UserDetails/UserDetails.module.scss'

const RenderColumnUserGroup: Renderer<CellProps<UserGroupAggregateDTO>> = ({ row }) => {
  const data = row.original.userGroupDTO
  return UserGroupColumn(data)
}

const RenderColumnMembers: Renderer<CellProps<UserGroupAggregateDTO>> = ({ row }) => {
  const data = row.original
  const avatars =
    data.users?.map(user => {
      return { email: user.email, name: user.name }
    }) || []

  return <AvatarGroup avatars={avatars} restrictLengthTo={6} />
}

const ResourceGroupColumnMenu: Renderer<CellProps<UserGroupAggregateDTO>> = ({ row, column }) => {
  const data = row.original
  const {
    accountIdentifier = '',
    orgIdentifier,
    projectIdentifier,
    identifier,
    name,
    externallyManaged
  } = data.userGroupDTO
  const [menuOpen, setMenuOpen] = useState(false)
  const { showSuccess, showError } = useToaster()
  const { getRBACErrorMessage } = useRBACError()
  const { getString } = useStrings()
  const { mutate: deleteUserGroup } = useRemoveMember({
    identifier: (column as any).userIdentifier,
    pathParams: {
      identifier: identifier
    },
    queryParams: { accountIdentifier, projectIdentifier, orgIdentifier }
  })

  const { openDialog } = useConfirmationDialog({
    contentText: `${getString('rbac.userDetails.userGroup.confirmDeleteText', { name: name })}`,
    titleText: getString('rbac.userDetails.userGroup.deleteTitle'),
    confirmButtonText: getString('common.remove'),
    cancelButtonText: getString('cancel'),
    intent: Intent.DANGER,
    buttonIntent: Intent.DANGER,
    onCloseDialog: async (isConfirmed: boolean) => {
      /* istanbul ignore else */ if (isConfirmed) {
        try {
          const deleted = await deleteUserGroup((column as any).userIdentifier, {
            headers: { 'content-type': 'application/json' }
          })
          /* istanbul ignore else */ if (deleted) {
            showSuccess(
              getString('rbac.userDetails.userGroup.deleteSuccessMessage', {
                name: name
              })
            )
            ;(column as any).reload?.()
          }
        } catch (err) {
          showError(getRBACErrorMessage(err))
        }
      }
    }
  })

  const handleDelete = (e: React.MouseEvent<HTMLElement, MouseEvent>): void => {
    e.stopPropagation()
    setMenuOpen(false)
    openDialog()
  }

  return (
    <Popover
      isOpen={menuOpen}
      onInteraction={nextOpenState => {
        setMenuOpen(nextOpenState)
      }}
      className={Classes.DARK}
      position={Position.RIGHT_TOP}
    >
      <Button
        minimal
        icon="Options"
        data-testid={`menu-UserGroup-${identifier}`}
        onClick={e => {
          e.stopPropagation()
          setMenuOpen(true)
        }}
      />
      <Menu>
        {externallyManaged ? (
          <Popover
            position={Position.TOP}
            fill
            usePortal
            inheritDarkTheme={false}
            interactionKind={PopoverInteractionKind.HOVER}
            hoverCloseDelay={50}
            content={
              <div className={css.popover}>
                <Text font={{ variation: FontVariation.SMALL }}>{getString('rbac.unableToEditSCIMMembership')}</Text>
              </div>
            }
          >
            <div
              onClick={
                /* istanbul ignore next */ (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
                  event.stopPropagation()
                }
              }
            >
              <Menu.Item icon="trash" text={getString('common.remove')} onClick={handleDelete} disabled />
            </div>
          </Popover>
        ) : (
          <Menu.Item icon="trash" text={getString('common.remove')} onClick={handleDelete} />
        )}
      </Menu>
    </Popover>
  )
}

interface UserGroupTableProps {
  user: UserAggregate
  scopeFilters: ScopeSelector[]
}

const UserGroupTable: React.FC<UserGroupTableProps> = ({ user, scopeFilters }) => {
  const { accountId, orgIdentifier, projectIdentifier, userIdentifier } =
    useParams<PipelineType<ProjectPathProps & UserPathProps>>()
  const { getString } = useStrings()
  const { getRBACErrorMessage } = useRBACError()
  const { showSuccess, showError } = useToaster()
  const history = useHistory()
  const [page, setPage] = useState(0)
  const {
    data: userGroupData,
    loading,
    error,
    refetch
  } = useMutateAsGet(useGetUserGroupAggregateListByUser, {
    userId: userIdentifier,
    body: {
      scopeFilter: scopeFilters
    },
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      pageIndex: page,
      pageSize: 10
    }
  })

  const { mutate: addUserToGroups, loading: sending } = useAddUsers({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: orgIdentifier,
      projectIdentifier: projectIdentifier
    }
  })

  const getUserGroupScopeAndID = (
    groups: ResponsePageUserGroupAggregateDTO | null
  ): ScopeAndIdentifier[] | undefined => {
    return groups?.data?.content?.map(value => ({
      identifier: value.userGroupDTO.identifier,
      scope: getScopeFromDTO(value.userGroupDTO)
    }))
  }

  const addUserToUserGroups = async (userGroups: string[]): Promise<void> => {
    const dataToSubmit: AddUsers = {
      emails: [user.user.email],
      roleBindings: user.roleAssignmentMetadata,
      userGroups: userGroups.concat(
        defaultTo(
          userGroupData?.data?.content?.map(value => value.userGroupDTO.identifier),
          []
        )
      )
    }
    try {
      await addUserToGroups(dataToSubmit)
      showSuccess(
        getString('rbac.userDetails.userGroup.addSuccessMessage', {
          Groups: userGroupData?.data?.content?.map(value => value.userGroupDTO.name).join(', ')
        })
      )
      refetch()
    } catch (e) {
      showError(getRBACErrorMessage(e))
      openSelectUserGroupsModal(getUserGroupScopeAndID(userGroupData))
    }
  }

  const { openSelectUserGroupsModal } = useSelectUserGroupsModal({
    onSuccess: data => {
      const userGroups = data.map(value => value.identifier)
      addUserToUserGroups(userGroups)
    },
    onlyCurrentScope: true,
    disablePreSelectedItems: true
  })

  const getNewUserGroupBtn = (variation: ButtonVariation, size: ButtonSize): React.ReactElement => (
    <ManagePrincipalButton
      data-testid={'add-UserGroup'}
      text={
        sending
          ? getString('rbac.userDetails.userGroup.addingToGroups')
          : getString('common.plusNumber', { number: getString('rbac.userDetails.userGroup.addToGroup') })
      }
      disabled={sending}
      variation={variation}
      size={size}
      onClick={() => {
        openSelectUserGroupsModal(getUserGroupScopeAndID(userGroupData))
      }}
      resourceIdentifier={userIdentifier}
      resourceType={ResourceType.USER}
      className={css.addToGroup}
    />
  )
  const columns: Column<UserGroupAggregateDTO>[] = useMemo(
    () => [
      {
        Header: getString('common.userGroup'),
        id: 'userGroup',
        accessor: row => row.userGroupDTO.name,
        width: '40%',
        Cell: RenderColumnUserGroup
      },
      {
        Header: getString('members'),
        id: 'members',
        accessor: row => row.users,
        width: '45%',
        Cell: RenderColumnMembers
      },
      {
        Header: getNewUserGroupBtn(ButtonVariation.SECONDARY, ButtonSize.SMALL),
        accessor: row => row.lastModifiedAt,
        width: '15%',
        id: 'action',
        Cell: ResourceGroupColumnMenu,
        disableSortBy: true,
        reload: refetch,
        userIdentifier
      }
    ],
    []
  )

  return (
    <Page.Body
      loading={loading}
      error={error ? getRBACErrorMessage(error) : ''}
      retryOnError={/* istanbul ignore next */ () => refetch()}
      noData={{
        when: () => !userGroupData?.data?.content?.length,
        message: getString('rbac.userDetails.noUserGroups'),
        button: getNewUserGroupBtn(ButtonVariation.PRIMARY, ButtonSize.LARGE),
        image: UserGroupEmptyState,
        imageClassName: css.userGroupsEmptyState
      }}
    >
      <Container padding="large">
        <TableV2<UserGroupAggregateDTO>
          data={defaultTo(userGroupData?.data?.content, [])}
          columns={columns}
          onRowClick={
            /* istanbul ignore next */ userGroup => {
              history.push({
                pathname: routes.toUserGroupDetails({
                  accountId: defaultTo(userGroup.userGroupDTO.accountIdentifier, ''),
                  orgIdentifier: userGroup.userGroupDTO.orgIdentifier,
                  projectIdentifier: userGroup.userGroupDTO.projectIdentifier,
                  userGroupIdentifier: userGroup.userGroupDTO.identifier
                }),
                search: `?parentScope=${getPrincipalScopeFromDTO(userGroup.userGroupDTO)}`
              })
            }
          }
          className={css.userGroupTable}
          pagination={{
            itemCount: userGroupData?.data?.totalItems || 0,
            pageSize: userGroupData?.data?.pageSize || 10,
            pageCount: userGroupData?.data?.totalPages || 0,
            pageIndex: userGroupData?.data?.pageIndex || 0,
            gotoPage: index => setPage(index)
          }}
        />
      </Container>
    </Page.Body>
  )
}

export default UserGroupTable
