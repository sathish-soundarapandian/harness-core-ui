/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Classes, Menu, Position } from '@blueprintjs/core'
import { Button, Popover, useConfirmationDialog, useToaster } from '@wings-software/uicore'
import { Intent } from '@harness/design-system'
import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import type { Cell, CellValue, ColumnInstance, Renderer, Row, TableInstance } from 'react-table'
import { useStrings } from 'framework/strings'
import { ResourceGroupV2, ResourceGroupV2Response, useDeleteResourceGroupV2 } from 'services/resourcegroups'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import RbacMenuItem from '@rbac/components/MenuItem/MenuItem'
import css from './ResourceGroupList.module.scss'

export type CellPropsResourceGroupColumn<D extends Record<string, any>, V = any> = TableInstance<D> & {
  column: ColumnInstance<D> & {
    reload?: () => Promise<void>
    openResourceGroupModal?: (resourceGroup: ResourceGroupV2) => void
  }
  row: Row<D>
  cell: Cell<D, V>
  value: CellValue<V>
}

const ResourceGroupColumnMenu: Renderer<CellPropsResourceGroupColumn<ResourceGroupV2Response>> = ({ row, column }) => {
  const data = row.original
  const isHarnessManaged = data.harnessManaged
  const [menuOpen, setMenuOpen] = useState(false)
  const { showSuccess, showError } = useToaster()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const { mutate: deleteResourceGroup } = useDeleteResourceGroupV2({
    queryParams: { accountIdentifier: accountId, projectIdentifier, orgIdentifier }
  })
  const permissionRequest = {
    resourceScope: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    resource: {
      resourceType: ResourceType.RESOURCEGROUP,
      resourceIdentifier: data.resourceGroup.identifier
    }
  }

  const { openDialog } = useConfirmationDialog({
    contentText: `${getString('rbac.resourceGroup.confirmDelete', { name: data.resourceGroup?.name })}`,
    titleText: getString('rbac.resourceGroup.confirmDeleteTitle'),
    confirmButtonText: getString('delete'),
    cancelButtonText: getString('cancel'),
    intent: Intent.DANGER,
    buttonIntent: Intent.DANGER,
    onCloseDialog: async (isConfirmed: boolean) => {
      if (isConfirmed) {
        try {
          const deleted = await deleteResourceGroup(data.resourceGroup?.identifier || '', {
            headers: { 'content-type': 'application/json' }
          })
          if (deleted) showSuccess(getString('rbac.resourceGroup.deletedMessage', { name: data.resourceGroup?.name }))
          column.reload?.()
        } catch (err) {
          showError(err?.data?.message || err?.message)
        }
      }
    }
  })

  const handleDelete = (e: React.MouseEvent<HTMLElement, MouseEvent>): void => {
    e.stopPropagation()
    setMenuOpen(false)
    if (!data?.resourceGroup?.identifier) return
    openDialog()
  }

  const handleEdit = (e: React.MouseEvent<HTMLElement, MouseEvent>): void => {
    e.stopPropagation()
    setMenuOpen(false)
    if (!row.original?.resourceGroup?.identifier) {
      return
    }
    column.openResourceGroupModal?.(row.original.resourceGroup)
  }

  return !isHarnessManaged ? (
    <Popover
      isOpen={menuOpen}
      onInteraction={nextOpenState => {
        setMenuOpen(nextOpenState)
      }}
      className={Classes.DARK}
      position={Position.RIGHT_TOP}
    >
      <Button
        data-testid={`resourceGroupDetailsEditMenu${data.resourceGroup?.identifier}`}
        minimal
        icon="Options"
        onClick={e => {
          e.stopPropagation()
          setMenuOpen(true)
        }}
      />
      <Menu style={{ minWidth: 'unset' }}>
        <RbacMenuItem
          icon="edit"
          text={getString('edit')}
          onClick={handleEdit}
          permission={{ ...permissionRequest, permission: PermissionIdentifier.UPDATE_RESOURCEGROUP }}
        />
        <RbacMenuItem
          icon="trash"
          text={getString('delete')}
          onClick={handleDelete}
          permission={{ ...permissionRequest, permission: PermissionIdentifier.DELETE_RESOURCEGROUP }}
        />
      </Menu>
    </Popover>
  ) : (
    <div className={css.placeHolderDiv}></div>
  )
}
export default ResourceGroupColumnMenu
