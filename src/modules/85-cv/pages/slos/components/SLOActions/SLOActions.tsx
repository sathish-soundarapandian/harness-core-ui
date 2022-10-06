import React from 'react'
import { Color, Icon, Intent, Layout, useConfirmationDialog } from '@harness/uicore'
import { Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import css from './SLOActions.module.scss'
export interface SLOActionsProps {
  onDelete: (sloIdentifier: string, title: string) => Promise<void>
  onEdit: (sloIdentifier: string) => void
  sloIdentifier: string
  title: string
}

export default function SLOActions(props: SLOActionsProps) {
  const { onDelete, onEdit, sloIdentifier, title } = props
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
        onDelete(sloIdentifier, title)
      }
    }
  })

  return (
    <Layout.Horizontal className={css.actions}>
      <Icon
        padding={'small'}
        name="Edit"
        onClick={e => {
          e.stopPropagation()
          onEdit(sloIdentifier)
        }}
      />
      <Icon
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
