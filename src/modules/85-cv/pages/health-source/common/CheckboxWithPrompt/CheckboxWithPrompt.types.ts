import type React from 'react'

export interface CheckboxWithPromptProps {
  popupTitleText: string
  checkboxLabel: string
  checked: boolean
  onChange: (updatedValue: boolean, identifier?: string) => void
  checkboxName?: string
  checkBoxKey?: React.Key | null
  confirmButtonText?: string
  cancelButtonText?: string
  contentText?: string
  showPromptOnUnCheck?: boolean
}
