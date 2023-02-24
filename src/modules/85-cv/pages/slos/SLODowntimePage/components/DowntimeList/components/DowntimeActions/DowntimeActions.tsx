/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Icon, Layout, useConfirmationDialog, Text } from '@harness/uicore'
import { Color, Intent } from '@harness/design-system'
import { useStrings } from 'framework/strings'
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
      <Icon
        className={css.actionIcons}
        padding={'small'}
        name="Edit"
        onClick={e => {
          e.stopPropagation()
          onEdit(identifier)
        }}
      />
      <Icon
        className={css.actionIcons}
        padding={'small'}
        name="main-trash"
        onClick={e => {
          e.stopPropagation()
          openDialog()
        }}
      />
    </Layout.Horizontal>
  )
}
