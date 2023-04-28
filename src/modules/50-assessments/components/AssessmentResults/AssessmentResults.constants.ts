import type { IDialogProps } from '@blueprintjs/core'

export const GRID_EFFICIENCY_SCORE = {
  CRICLE_SIZE: 150
}

export const DialogProps: IDialogProps = {
  isOpen: false,
  usePortal: true,
  autoFocus: true,
  canEscapeKeyClose: true,
  canOutsideClickClose: true,
  enforceFocus: false,
  style: { width: 800, height: 300, borderLeft: 0, paddingBottom: 0, position: 'relative', overflowY: 'scroll' }
}

export const InviteAssessmentModalDialogProps: IDialogProps = {
  ...DialogProps,
  style: { ...DialogProps.style, height: 250, width: 800 }
}
