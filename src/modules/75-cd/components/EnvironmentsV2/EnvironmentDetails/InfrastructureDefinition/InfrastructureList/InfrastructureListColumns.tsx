/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import ReactTimeago from 'react-timeago'
import { defaultTo, isEmpty } from 'lodash-es'
import { Classes, Menu, Position } from '@blueprintjs/core'

import { Layout, TagsPopover, Text, useConfirmationDialog, Intent, Popover, Button } from '@harness/uicore'
import { Color } from '@harness/design-system'

import { useStrings } from 'framework/strings'
import type { InfrastructureResponse, InfrastructureResponseDTO } from 'services/cd-ng'

import RbacMenuItem from '@rbac/components/MenuItem/MenuItem'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'

import css from '../InfrastructureDefinition.module.scss'

interface InfrastructureRowColumn {
  row: { original: InfrastructureResponse }
  column: {
    actions: {
      onEdit: (identifier: string) => void
      onDelete: (identifier: string) => void
    }
  }
}

export function withInfrastructure(Component: any) {
  return (props: InfrastructureRowColumn) => {
    return <Component {...props.row.original} {...props.column.actions} />
  }
}

export function InfrastructureName({
  infrastructure
}: {
  infrastructure: InfrastructureResponseDTO
}): React.ReactElement {
  const { getString } = useStrings()

  const { name, tags, identifier } = infrastructure

  return (
    <Layout.Vertical>
      <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} spacing="small" margin={{ bottom: 'small' }}>
        <Text color={Color.BLACK}>{name}</Text>
        {!isEmpty(tags) && (
          <TagsPopover
            className={css.tagsPopover}
            iconProps={{ size: 14, color: Color.GREY_600 }}
            tags={defaultTo(tags, {})}
          />
        )}
      </Layout.Horizontal>

      <Text color={Color.GREY_500} font={{ size: 'small' }} lineClamp={1}>
        {getString('common.ID')}: {identifier}
      </Text>
    </Layout.Vertical>
  )
}

export function LastUpdatedBy({ lastModifiedAt }: InfrastructureResponse): React.ReactElement {
  return (
    <Layout.Vertical spacing={'small'}>
      <ReactTimeago date={defaultTo(lastModifiedAt, 0)} />
    </Layout.Vertical>
  )
}

export function InfrastructureMenu({
  infrastructure: { identifier, yaml },
  onEdit,
  onDelete
}: {
  infrastructure: InfrastructureResponseDTO
  onEdit: (identifier: string) => void
  onDelete: (identifier: string) => void
}): React.ReactElement {
  const [menuOpen, setMenuOpen] = React.useState(false)
  const { getString } = useStrings()

  const { openDialog } = useConfirmationDialog({
    titleText: getString('cd.infrastructure.delete'),
    contentText: getString('cd.infrastructure.deleteConfirmation'),
    confirmButtonText: getString('delete'),
    cancelButtonText: getString('cancel'),
    intent: Intent.DANGER,
    buttonIntent: Intent.DANGER,
    onCloseDialog: async (isConfirmed: boolean) => {
      /* istanbul ignore else */
      if (isConfirmed) {
        setMenuOpen(false)
        await onDelete(defaultTo(identifier, ''))
      }
    }
  })

  const handleEdit = (event: React.MouseEvent) => {
    event.stopPropagation()
    onEdit(defaultTo(yaml, ''))
    setMenuOpen(false)
  }

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation()
    openDialog()
  }

  return (
    <Layout.Horizontal style={{ justifyContent: 'flex-end' }}>
      <Popover isOpen={menuOpen} onInteraction={setMenuOpen} className={Classes.DARK} position={Position.LEFT}>
        <Button
          minimal
          style={{
            transform: 'rotate(90deg)'
          }}
          icon="more"
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
            permission={{
              resource: {
                resourceType: ResourceType.ENVIRONMENT
              },
              permission: PermissionIdentifier.EDIT_ENVIRONMENT
            }}
          />
          <RbacMenuItem
            icon="trash"
            text={getString('delete')}
            onClick={handleDelete}
            permission={{
              resource: {
                resourceType: ResourceType.ENVIRONMENT
              },
              permission: PermissionIdentifier.DELETE_ENVIRONMENT
            }}
          />
        </Menu>
      </Popover>
    </Layout.Horizontal>
  )
}
