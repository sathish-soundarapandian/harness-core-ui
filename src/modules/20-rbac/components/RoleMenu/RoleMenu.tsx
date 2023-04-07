import React from 'react'
import { useParams } from 'react-router-dom'
import { Menu } from '@blueprintjs/core'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { useStrings } from 'framework/strings'
import type { Role } from 'services/rbac'
import RbacMenuItem from '../MenuItem/MenuItem'
import OpenInNewTab from '../MenuItem/OpenInNewTab'

interface RoleMenuProps {
  harnessManaged?: boolean
  role: Role
  editRoleModal: (role: Role) => void
  openDeleteModal: () => void
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>
}

function RoleMenu(props: RoleMenuProps): JSX.Element {
  const { harnessManaged, role, openDeleteModal, editRoleModal, setMenuOpen } = props
  const { accountId, projectIdentifier, orgIdentifier, module } = useParams<ProjectPathProps & ModulePathParams>()
  const { getString } = useStrings()

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

  const handleEdit = (e: React.MouseEvent): void => {
    e.stopPropagation()
    setMenuOpen(false)
    editRoleModal(role)
  }

  const handleDelete = (e: React.MouseEvent): void => {
    e.stopPropagation()
    setMenuOpen(false)
    openDeleteModal()
  }

  const roleDetailsUrl = routes.toRoleDetails({
    roleIdentifier: role.identifier,
    accountId,
    orgIdentifier,
    projectIdentifier,
    module
  })

  return (
    <Menu>
      <li>
        <OpenInNewTab url={roleDetailsUrl} />
      </li>
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
  )
}

export default RoleMenu
