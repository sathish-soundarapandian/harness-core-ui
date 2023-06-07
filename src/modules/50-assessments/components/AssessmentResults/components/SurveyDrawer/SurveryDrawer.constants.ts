import { IDrawerProps, Position } from '@blueprintjs/core'

export const DrawerProps: IDrawerProps = {
  autoFocus: true,
  canEscapeKeyClose: true,
  canOutsideClickClose: true,
  enforceFocus: true,
  isOpen: true,
  hasBackdrop: true,
  position: Position.RIGHT,
  usePortal: true,
  size: '40%',
  isCloseButtonShown: true
}

export enum LEVELS {
  LEVEL_3 = 'LEVEL_3',
  LEVEL_2 = 'LEVEL_2',
  LEVEL_1 = 'LEVEL_1'
}
