/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Card, CardBody, Icon, Layout, Text, useConfirmationDialog, useToaster } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useHistory, useParams } from 'react-router-dom'
import { Classes, Intent, Menu } from '@blueprintjs/core'
import { Role, RoleResponse, useDeleteRole } from 'services/rbac'
import routes from '@common/RouteDefinitions'
import { useStrings } from 'framework/strings'
import { getRoleIcon } from '@rbac/utils/utils'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import RbacMenuItem from '@rbac/components/MenuItem/MenuItem'
import css from './RoleCard.module.scss'

interface RoleCardProps {
  data: RoleResponse
  reloadRoles?: () => void
  editRoleModal?: (role: Role) => void
}

const RoleCard: React.FC<RoleCardProps> = ({ data, reloadRoles, editRoleModal }) => {
  const { role, harnessManaged } = data
  const { accountId, projectIdentifier, orgIdentifier, module } = useParams<ProjectPathProps & ModulePathParams>()
  const history = useHistory()
  const { showSuccess, showError } = useToaster()
  const { getString } = useStrings()
  const [menuOpen, setMenuOpen] = useState(false)
  const { mutate: deleteRole } = useDeleteRole({
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier }
  })

  const permissionRequest = {
    resourceScope: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    resource: {
      resourceType: ResourceType.ROLE,
      resourceIdentifier: role.identifier
    }
  }

  const { openDialog: openDeleteDialog } = useConfirmationDialog({
    contentText: getString('rbac.roleCard.confirmDelete', { name: role.name }),
    titleText: getString('rbac.roleCard.confirmDeleteTitle'),
    confirmButtonText: getString('delete'),
    cancelButtonText: getString('cancel'),
    intent: Intent.DANGER,
    buttonIntent: Intent.DANGER,
    onCloseDialog: async (isConfirmed: boolean) => {
      /* istanbul ignore else */ if (isConfirmed) {
        try {
          const deleted = await deleteRole(role.identifier, { headers: { 'content-type': 'application/json' } })
          /* istanbul ignore else */ if (deleted) {
            showSuccess(getString('rbac.roleCard.successMessage', { name: role.name }))
            reloadRoles?.()
          } else {
            showError(getString('deleteError'))
          }
        } catch (err) {
          /* istanbul ignore next */
          showError(err?.data?.message || err?.message)
        }
      }
    }
  })
  const handleEdit = (e: React.MouseEvent): void => {
    e.stopPropagation()
    setMenuOpen(false)
    editRoleModal?.(role)
  }

  const handleDelete = async (e: React.MouseEvent): Promise<void> => {
    e.stopPropagation()
    setMenuOpen(false)
    openDeleteDialog()
  }

  return (
    <Card
      className={css.card}
      data-testid={`role-card-${role.identifier}`}
      onClick={() => {
        history.push(
          routes.toRoleDetails({ roleIdentifier: role.identifier, accountId, orgIdentifier, projectIdentifier, module })
        )
      }}
      interactive
    >
      <CardBody.Menu
        menuContent={
          <Menu>
            <RbacMenuItem
              icon="edit"
              text={getString('edit')}
              onClick={handleEdit}
              disabled={harnessManaged}
              permission={{
                ...permissionRequest,
                permission: PermissionIdentifier.UPDATE_ROLE
              }}
            />
            <RbacMenuItem
              icon="trash"
              text={getString('delete')}
              onClick={handleDelete}
              disabled={harnessManaged}
              permission={{
                ...permissionRequest,
                permission: PermissionIdentifier.DELETE_ROLE
              }}
            />
          </Menu>
        }
        menuPopoverProps={{
          className: Classes.DARK,
          isOpen: menuOpen,
          onInteraction: nextOpenState => {
            setMenuOpen(nextOpenState)
          }
        }}
      />

      <Layout.Vertical flex={{ align: 'center-center' }} spacing="large" height="100%">
        <Icon name={getRoleIcon(role.identifier)} size={40} />
        <Text className={css.name} lineClamp={1} color={Color.BLACK} font={{ size: 'medium', weight: 'semi-bold' }}>
          {role.name}
        </Text>
      </Layout.Vertical>
    </Card>
  )
}

export default RoleCard
