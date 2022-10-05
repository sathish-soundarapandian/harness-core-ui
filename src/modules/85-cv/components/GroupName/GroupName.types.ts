import type { Dispatch, SetStateAction } from 'react'
import type { IDialogProps } from '@blueprintjs/core'
import type { SelectOption } from '@harness/uicore'
import type { StringKeys } from 'framework/strings'

export interface GroupNameProps {
  fieldName: string
  newGroupDialogTitle?: StringKeys
  groupNames?: SelectOption[]
  onChange: (name: string, value: SelectOption) => void
  item?: SelectOption
  setGroupNames: Dispatch<SetStateAction<SelectOption[]>>
  label?: string
  title?: string
  disabled?: boolean
}

export const DialogProps: IDialogProps = {
  isOpen: true,
  usePortal: true,
  autoFocus: true,
  canEscapeKeyClose: true,
  canOutsideClickClose: true,
  enforceFocus: false,
  style: { width: 600, borderLeft: 0, paddingBottom: 0, position: 'relative', overflow: 'hidden' }
}

export type CreateGroupName = {
  name: string
}
