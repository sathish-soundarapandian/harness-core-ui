/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { IDrawerProps, IPopoverProps, PopoverInteractionKind, PopoverPosition, Position } from '@blueprintjs/core'
import { EVENT_TYPE } from '@cv/utils/CommonUtils'
import type { StringKeys } from 'framework/strings'

export const RiskOptions = [
  { label: 'P1', value: 'P1' },
  { label: 'P2', value: 'P2' },
  { label: 'P3', value: 'P3' },
  { label: 'P4', value: 'P4' },
  { label: 'P5', value: 'P5' }
]

export const DrawerProps: IDrawerProps = {
  autoFocus: true,
  canEscapeKeyClose: true,
  canOutsideClickClose: true,
  enforceFocus: true,
  isOpen: true,
  hasBackdrop: true,
  position: Position.RIGHT,
  usePortal: true,
  size: '80%',
  isCloseButtonShown: true
}

export enum LogEvents {
  KNOWN = 'KNOWN',
  UNKNOWN = 'UNKNOWN',
  UNEXPECTED = 'UNEXPECTED'
}

export const ShareContentPopoverProps: IPopoverProps = {
  canEscapeKeyClose: true,
  interactionKind: PopoverInteractionKind.CLICK,
  minimal: true,
  position: PopoverPosition.BOTTOM,
  usePortal: true
}

export const legendKeyMapping: Record<LogEvents, StringKeys> = {
  [EVENT_TYPE.UNKNOWN]: 'cv.unknownEvents',
  [EVENT_TYPE.KNOWN]: 'cv.knownEvents',
  [EVENT_TYPE.UNEXPECTED]: 'cv.unexpectedEvents'
}

export const legendKeyMappingSingular: Record<LogEvents, StringKeys> = {
  [EVENT_TYPE.UNKNOWN]: 'cv.unknownEvent',
  [EVENT_TYPE.KNOWN]: 'cv.knownEvent',
  [EVENT_TYPE.UNEXPECTED]: 'cv.unexpectedEvent'
}
