/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import ReactTimeago from 'react-timeago'
import { defaultTo, isEmpty } from 'lodash-es'
import { Classes, Menu, Position } from '@blueprintjs/core'

import { Layout, TagsPopover, Text, Checkbox, useConfirmationDialog, Intent, Popover, Button } from '@harness/uicore'
import { Color } from '@harness/design-system'

import type { EnvironmentResponse, EnvironmentResponseDTO } from 'services/cd-ng'
import { useStrings } from 'framework/strings'

import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import RbacMenuItem from '@rbac/components/MenuItem/MenuItem'

import { EnvironmentType } from '@common/constants/EnvironmentType'

import css from './EnvironmentsList.module.scss'

interface EnvironmentRowColumn {
  row: { original: EnvironmentResponse }
  column: {
    actions: {
      onEdit: (identifier: string) => void
      onDelete: (identifier: string) => void
    }
  }
}

export function withEnvironment(Component: any) {
  return (props: EnvironmentRowColumn) => {
    return <Component {...props.row.original} {...props.column.actions} />
  }
}

export function EnvironmentName({ environment: { name, tags, identifier } }: { environment: EnvironmentResponseDTO }) {
  const { getString } = useStrings()
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

export function EnvironmentTypes({ environment: { type } }: { environment: EnvironmentResponseDTO }) {
  const { getString } = useStrings()
  return (
    <Text
      className={cx(css.environmentType, {
        [css.production]: type === EnvironmentType.PRODUCTION
      })}
      font={{ size: 'small' }}
    >
      {getString(type === EnvironmentType.PRODUCTION ? 'cd.serviceDashboard.prod' : 'cd.preProductionType')}
    </Text>
  )
}

export function LastUpdatedBy({ lastModifiedAt }: EnvironmentResponse): React.ReactElement {
  return (
    <Layout.Vertical spacing={'small'}>
      <ReactTimeago date={lastModifiedAt as number} />
    </Layout.Vertical>
  )
}

export function EnvironmentMenu({
  environment: { identifier },
  onEdit,
  onDelete
}: {
  environment: EnvironmentResponseDTO
  onEdit: (identifier: string) => void
  onDelete: (identifier: string) => void
}) {
  const [menuOpen, setMenuOpen] = React.useState(false)
  const { getString } = useStrings()

  const { openDialog } = useConfirmationDialog({
    titleText: getString('cd.environment.delete'),
    contentText: getString('cd.environment.deleteConfirmation'),
    confirmButtonText: getString('delete'),
    cancelButtonText: getString('cancel'),
    intent: Intent.DANGER,
    buttonIntent: Intent.DANGER,
    onCloseDialog: async (isConfirmed: boolean) => {
      /* istanbul ignore else */
      if (isConfirmed) {
        await onDelete(defaultTo(identifier, ''))
      }
      setMenuOpen(false)
    }
  })

  const handleEdit = (event: React.MouseEvent) => {
    event.stopPropagation()
    onEdit(defaultTo(identifier, ''))
    setMenuOpen(false)
  }

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation()
    openDialog()
    setMenuOpen(false)
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

export function DeleteCheckbox({ row, column }: any) {
  return (
    <Checkbox
      onClick={event => column.onCheckboxSelect(event, row?.original)}
      checked={column.environmentsToRemove.some(
        (selectedEnv: EnvironmentResponse) =>
          (selectedEnv as any).environment.identifier === row?.original?.environment.identifier
      )}
    />
  )
}
