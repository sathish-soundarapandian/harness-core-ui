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

export const SURVEY_CHART_OPTIONS = {
  chart: {
    height: 120
  },
  plotOptions: {
    bar: {
      pointWidth: 16
    }
  }
}
