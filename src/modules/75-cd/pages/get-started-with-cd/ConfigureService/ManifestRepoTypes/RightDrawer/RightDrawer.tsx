/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { SyntheticEvent } from 'react'
import { Drawer, Position } from '@blueprintjs/core'
import { Button } from '@harness/uicore'
import css from './RightDrawer.module.scss'

interface RightDrawerProps {
  isOpen: boolean
  setIsOpen: (val: boolean) => void
}

export const RightDrawer: React.FC<RightDrawerProps> = ({ isOpen, setIsOpen, children }): JSX.Element => {
  const closeDrawer = React.useCallback(
    (e?: SyntheticEvent<HTMLElement, Event> | undefined): void => {
      e?.persist()
      setIsOpen(false)
    },
    [setIsOpen]
  )

  const onCloseDrawer = React.useCallback(() => {
    closeDrawer()
  }, [closeDrawer])

  return (
    <Drawer
      onClose={closeDrawer}
      usePortal={true}
      autoFocus={true}
      canEscapeKeyClose={true}
      canOutsideClickClose={true}
      enforceFocus={false}
      hasBackdrop={true}
      size={700}
      isOpen={isOpen}
      position={Position.RIGHT}
      data-type={'file-view'}
      className={css.previewDrawer}
      isCloseButtonShown={false}
    >
      <Button minimal className={css.closeButton} icon="cross" withoutBoxShadow onClick={onCloseDrawer} />
      {children}
    </Drawer>
  )
}
