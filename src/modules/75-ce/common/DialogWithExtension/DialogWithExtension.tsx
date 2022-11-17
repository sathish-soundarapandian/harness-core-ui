/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { createContext, ReactElement, useState } from 'react'
import { Dialog, IDialogProps } from '@blueprintjs/core'
import { Icon } from '@harness/uicore'
import css from './DialogWithExtension.module.scss'

interface ChildrenProps {
  triggerExtension: () => void
  closeExtension: () => void
}

interface DialogWithExtensionProps {
  modalProps: IDialogProps
  dialogStyles?: { width?: number; height?: number }
  renderExtension?: ReactElement | React.FC
}

export const DialogWithExtensionContext = createContext<ChildrenProps>({
  triggerExtension: () => undefined,
  closeExtension: () => undefined
})

const DialogWithExtension: React.FC<DialogWithExtensionProps> = props => {
  const [showExtension, setShowExtension] = useState<boolean>(false)
  const triggerExtension = () => setShowExtension(true)
  const closeExtension = () => setShowExtension(false)
  return (
    <Dialog {...props.modalProps}>
      <div style={{ display: 'flex', height: props.dialogStyles?.height || 640 }}>
        <div style={{ width: props.dialogStyles?.width || 900, position: 'relative' }}>
          <DialogWithExtensionContext.Provider value={{ triggerExtension, closeExtension }}>
            {props.children}
          </DialogWithExtensionContext.Provider>
        </div>
        {showExtension && (
          <div className={css.extension}>
            {props.renderExtension}
            <span className={css.closeBtn} onClick={() => setShowExtension(false)}>
              <Icon name={'caret-left'} />
            </span>
          </div>
        )}
      </div>
    </Dialog>
  )
}

export default DialogWithExtension
