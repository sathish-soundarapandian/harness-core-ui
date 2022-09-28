import React, { MouseEventHandler, useCallback } from 'react'
import { Icon } from '@harness/icons'
import { Intent, useConfirmationDialog } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type { DeleteWithPromptProps } from './DeleteWithPrompt.types'

export default function DeleteWithPrompt(props: DeleteWithPromptProps): JSX.Element {
  const {
    iconName,
    onClick,
    itemName,
    index,
    contentText,
    popupTitleText,
    confirmButtonText,
    cancelButtonText,
    showPromptOnDelete
  } = props

  const { getString } = useStrings()

  const handleOnClose = useCallback(
    didConfirm => {
      if (didConfirm) {
        onClick(itemName, index)
      }
    },
    [index, itemName, onClick]
  )

  const { openDialog } = useConfirmationDialog({
    contentText: contentText ?? getString('common.confirmText'),
    titleText: popupTitleText ?? getString('common.confirmAction'),
    confirmButtonText: confirmButtonText ?? getString('confirm'),
    cancelButtonText: cancelButtonText ?? getString('cancel'),
    intent: Intent.WARNING,
    onCloseDialog: handleOnClose
  })

  const handleClick: MouseEventHandler = useCallback(
    e => {
      e.stopPropagation()

      if (showPromptOnDelete) {
        openDialog()
      } else {
        onClick(itemName, index)
      }
    },
    [index, itemName, onClick, openDialog, showPromptOnDelete]
  )

  return <Icon name={iconName ?? 'main-delete'} key={itemName} onClick={handleClick} />
}
