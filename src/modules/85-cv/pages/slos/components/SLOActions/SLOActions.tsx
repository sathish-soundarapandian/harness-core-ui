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
import type { SLOHealthListView } from 'services/cv'
import css from './SLOActions.module.scss'

export interface SLOActionsProps {
  onDelete: (sloIdentifier: string, title: string, sloType?: SLOHealthListView['sloType']) => Promise<void>
  onEdit: (sloIdentifier: string) => void
  sloIdentifier: string
  title: string
  sloType?: SLOHealthListView['sloType']
}

export default function SLOActions(props: SLOActionsProps) {
  const { onDelete, onEdit, sloIdentifier, title, sloType } = props
  const { getString } = useStrings()

  const { openDialog } = useConfirmationDialog({
    titleText: getString('common.delete', { name: title }),
    contentText: <Text color={Color.GREY_800}>{getString('cv.slos.confirmDeleteSLO', { name: title })}</Text>,
    confirmButtonText: getString('delete'),
    cancelButtonText: getString('cancel'),
    intent: Intent.DANGER,
    buttonIntent: Intent.DANGER,
    onCloseDialog: (isConfirmed: boolean) => {
      if (isConfirmed) {
        onDelete(sloIdentifier, title, sloType)
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
          onEdit(sloIdentifier)
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
