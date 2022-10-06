import type { IconName } from '@harness/icons'

export interface DeleteWithPromptProps {
  iconName?: IconName
  index?: number
  itemName?: string
  onClick: (itemName?: string, index?: number) => void
  contentText?: string
  popupTitleText?: string
  confirmButtonText?: string
  cancelButtonText?: string
  showPromptOnDelete?: boolean
}
