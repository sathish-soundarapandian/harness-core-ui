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
    height: 90
  },
  plotOptions: {
    bar: {
      pointWidth: 15
    }
  }
}

export const SCORE_FILTER_OPTIONS = [
  { label: '0-3', value: '0_3' },
  { label: '4-7', value: '4_7' },
  { label: '8-10', value: '8_10' },
  { label: 'All', value: 'all' }
]
