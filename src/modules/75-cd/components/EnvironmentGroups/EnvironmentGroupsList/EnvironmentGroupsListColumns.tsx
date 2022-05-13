/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import ReactTimeago from 'react-timeago'
import cx from 'classnames'
import { defaultTo, isEmpty } from 'lodash-es'
import { Classes, Intent, Menu, Position } from '@blueprintjs/core'

import { Button, Layout, Popover, TagsPopover, Text, useConfirmationDialog } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'

import RbacMenuItem from '@rbac/components/MenuItem/MenuItem'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'

import { EnvironmentType } from '@common/constants/EnvironmentType'

import css from '../EnvironmentGroups.module.scss'
import environmentCss from '../../EnvironmentsV2/EnvironmentsList/EnvironmentsList.module.scss'

function EnvironmentGroupName({
  name,
  identifier,
  tags
}: {
  name?: string
  identifier?: string
  tags?: {
    [key: string]: string
  }
}): React.ReactElement {
  const { getString } = useStrings()

  return (
    <>
      <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} spacing="small" margin={{ bottom: 'small' }}>
        <Text color={Color.BLACK} lineClamp={1}>
          {name}
        </Text>
        {!isEmpty(tags) && (
          <TagsPopover
            className={css.tagsPopover}
            iconProps={{ size: 14, color: Color.GREY_600 }}
            tags={defaultTo(tags, {})}
            popoverProps={{
              position: 'right'
            }}
          />
        )}
      </Layout.Horizontal>

      <Text color={Color.GREY_500} font={{ size: 'small' }} lineClamp={1}>
        {getString('common.ID')}: {identifier}
      </Text>
    </>
  )
}

function LastUpdatedBy({ lastModifiedAt }: { lastModifiedAt?: number }): React.ReactElement {
  return (
    <Layout.Vertical spacing={'small'}>
      <ReactTimeago date={lastModifiedAt as number} />
    </Layout.Vertical>
  )
}

function NoOfEnvironments({ length }: { length: number }) {
  return (
    <Text
      color={Color.BLACK}
      background={Color.GREY_100}
      padding={{ left: 'large', top: 'small', right: 'large', bottom: 'small' }}
      inline
    >
      {length} environment(s) included
    </Text>
  )
}

function EditOrDeleteCell({ identifier, onEdit, onDelete }: any): React.ReactElement {
  const [menuOpen, setMenuOpen] = React.useState(false)
  const { getString } = useStrings()

  const { openDialog } = useConfirmationDialog({
    titleText: getString('common.environmentGroup.delete'),
    contentText: getString('common.environmentGroup.deleteConfirmation'),
    confirmButtonText: getString('delete'),
    cancelButtonText: getString('cancel'),
    intent: Intent.DANGER,
    buttonIntent: Intent.DANGER,
    onCloseDialog: async (isConfirmed: boolean) => {
      /* istanbul ignore else */
      if (isConfirmed) {
        setMenuOpen(false)
        await onDelete(identifier)
      }
    }
  })

  const handleEdit = (event: React.MouseEvent) => {
    event.stopPropagation()
    onEdit(identifier)
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
                resourceType: ResourceType.ENVIRONMENT_GROUP
              },
              permission: PermissionIdentifier.EDIT_ENVIRONMENT_GROUP
            }}
          />
          <RbacMenuItem
            icon="trash"
            text={getString('delete')}
            onClick={handleDelete}
            permission={{
              resource: {
                resourceType: ResourceType.ENVIRONMENT_GROUP
              },
              permission: PermissionIdentifier.DELETE_ENVIRONMENT_GROUP
            }}
          />
        </Menu>
      </Popover>
    </Layout.Horizontal>
  )
}

function EnvironmentTypes({ type }: { type?: 'PreProduction' | 'Production' }) {
  const { getString } = useStrings()
  return (
    <Text
      className={cx(environmentCss.environmentType, {
        [environmentCss.production]: type === EnvironmentType.PRODUCTION
      })}
      font={{ size: 'small' }}
    >
      {getString(type === EnvironmentType.PRODUCTION ? 'cd.serviceDashboard.prod' : 'cd.preProductionType')}
    </Text>
  )
}

export { EnvironmentGroupName, LastUpdatedBy, NoOfEnvironments, EditOrDeleteCell, EnvironmentTypes }
