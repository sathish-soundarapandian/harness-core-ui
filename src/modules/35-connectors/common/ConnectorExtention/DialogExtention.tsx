/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { createContext, useCallback, useState } from 'react'
import { Icon } from '@harness/uicore'
import css from './DialogExtension.module.scss'

interface ChildrenProps {
  triggerExtension: (extension: JSX.Element) => void
  closeExtension: () => void
}

interface ExtensionProps {
  dialogStyles?: { width?: number; height?: number }
}

export const DialogExtensionContext = createContext<ChildrenProps>({
  triggerExtension: () => undefined,
  closeExtension: () => undefined
})

const DialogExtension: React.FC<ExtensionProps> = props => {
  const [showExtension, setShowExtension] = useState<boolean>(false)
  const [exWindow, setExWindow] = useState<JSX.Element | undefined>()
  const triggerExtension = useCallback((extension: JSX.Element): void => {
    setExWindow(extension)
    setShowExtension(true)
  }, [])
  const closeExtension = useCallback(() => setShowExtension(false), [])

  return (
    <div style={{ display: 'flex', maxHeight: 800 }}>
      <div style={{ width: props.dialogStyles?.width || 1175, position: 'relative' }}>
        <DialogExtensionContext.Provider value={{ triggerExtension, closeExtension }}>
          {props.children}
        </DialogExtensionContext.Provider>
      </div>
      {showExtension && (
        <div className={css.extension}>
          <div>{exWindow}</div>
          <Icon name={'chevron-left'} size={24} onClick={() => setShowExtension(false)} className={css.closeBtn} />
        </div>
      )}
    </div>
  )
}

export default DialogExtension
