/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, useConfirmationDialog, Text, ButtonVariation } from '@harness/uicore'
import { Color, Intent } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import css from '@cv/pages/slos/components/SLOActions/SLOActions.module.scss'

export interface DowntimeActionsProps {
  onDelete: (identifier: string, title: string) => Promise<void>
  onEdit: (identifier: string) => void
  identifier: string
  title: string
}

export default function DowntimeActions(props: DowntimeActionsProps): JSX.Element {
  const { onDelete, onEdit, identifier, title } = props
  const { getString } = useStrings()

  const { openDialog } = useConfirmationDialog({
    titleText: getString('common.delete', { name: title }),
    contentText: (
      <Text color={Color.GREY_800}>{getString('cv.sloDowntime.confirmDeleteDowntime', { name: title })}</Text>
    ),
    confirmButtonText: getString('delete'),
    cancelButtonText: getString('cancel'),
    intent: Intent.DANGER,
    buttonIntent: Intent.DANGER,
    onCloseDialog: (isConfirmed: boolean) => {
      if (isConfirmed) {
        onDelete(identifier, title)
      }
    }
  })

  return (
    <Layout.Horizontal className={css.actions}>
      <RbacButton
        className={css.actionIcons}
        padding={'small'}
        rightIcon="Edit"
        withoutCurrentColor
        iconProps={{ color: Color.GREY_500 }}
        onClick={e => {
          e.stopPropagation()
          onEdit(identifier)
        }}
        variation={ButtonVariation.LINK}
        permission={{
          permission: PermissionIdentifier.EDIT_DOWNTIME,
          resource: {
            resourceType: ResourceType.DOWNTIME,
            resourceIdentifier: identifier
          }
        }}
      />
      <RbacButton
        className={css.actionIcons}
        padding={'small'}
        rightIcon="main-trash"
        withoutCurrentColor
        iconProps={{ color: Color.GREY_500 }}
        onClick={e => {
          e.stopPropagation()
          openDialog()
        }}
        variation={ButtonVariation.LINK}
        permission={{
          permission: PermissionIdentifier.DELETE_DOWNTIME,
          resource: {
            resourceType: ResourceType.DOWNTIME,
            resourceIdentifier: identifier
          }
        }}
      />
    </Layout.Horizontal>
  )
}
