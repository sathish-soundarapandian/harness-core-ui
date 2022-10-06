import React, { useCallback } from 'react'
import { Checkbox, Intent, useConfirmationDialog } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type { CheckboxWithPromptProps } from './CheckboxWithPrompt.types'

export default function CheckboxWithPrompt(props: CheckboxWithPromptProps): JSX.Element {
  const { getString } = useStrings()

  const {
    popupTitleText,
    checkBoxKey,
    checked,
    checkboxName,
    contentText,
    confirmButtonText,
    cancelButtonText,
    checkboxLabel,
    showPromptOnUnCheck,
    onChange
  } = props

  const handleOnClose = useCallback(
    didConfirm => {
      if (didConfirm) {
        onChange(!checked, checkboxName)
      }
    },
    [checkboxName, checked, onChange]
  )

  const { openDialog } = useConfirmationDialog({
    contentText: contentText ?? getString('common.confirmText'),
    titleText: popupTitleText ?? getString('common.confirmAction'),
    confirmButtonText: confirmButtonText ?? getString('confirm'),
    cancelButtonText: cancelButtonText ?? getString('cancel'),
    intent: Intent.WARNING,
    onCloseDialog: handleOnClose
  })

  const handleCheckboxChange = useCallback(() => {
    if (checked && showPromptOnUnCheck) {
      openDialog()
    } else {
      onChange(!checked, checkboxName)
    }
  }, [checkboxName, checked, onChange, openDialog, showPromptOnUnCheck])

  return (
    <Checkbox
      name={checkboxName}
      checked={checked}
      key={checkBoxKey}
      label={checkboxLabel}
      onChange={handleCheckboxChange}
    />
  )
}

// export default React.memo(CheckboxWithPrompt)
