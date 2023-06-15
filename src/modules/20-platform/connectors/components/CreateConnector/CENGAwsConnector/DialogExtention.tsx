/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { createContext, ReactElement, useState } from 'react'
import { Icon } from '@harness/uicore'
import CostUsageReportExtention from './steps/CostUsageReportExtenstion'
import CrossAccountRoleExtension from './steps/CrossAccountRoleExtension'
import css from './DialogExtension.module.scss'

export type ExtentionWindow = 'CrossAccountEx' | 'CostUsageEx'
interface ChildrenProps {
  triggerExtension: (exWindow: ExtentionWindow) => void
  closeExtension: () => void
}

interface ExtensionProps {
  dialogStyles?: { width?: number; height?: number }
  renderExtension?: ReactElement | React.FC
}

export const DialogExtensionContext = createContext<ChildrenProps>({
  triggerExtension: () => undefined,
  closeExtension: () => undefined
})

interface SelectExtentionProps {
  exWindow: ExtentionWindow
}

const SelectExtention: React.FC<SelectExtentionProps> = props => {
  const { exWindow } = props
  switch (exWindow) {
    case 'CrossAccountEx':
      return <CrossAccountRoleExtension />
    case 'CostUsageEx':
      return <CostUsageReportExtention />
  }
}

const DialogExtension: React.FC<ExtensionProps> = props => {
  const [showExtension, setShowExtension] = useState<boolean>(false)
  const [exWindow, setExWindow] = useState<ExtentionWindow>('CostUsageEx')
  const triggerExtension = (data: ExtentionWindow) => {
    setExWindow(data)
    setShowExtension(true)
  }
  const closeExtension = () => setShowExtension(false)
  return (
    <div style={{ display: 'flex', maxHeight: 700 }}>
      <div style={{ width: props.dialogStyles?.width || 1050, position: 'relative' }}>
        <DialogExtensionContext.Provider value={{ triggerExtension, closeExtension }}>
          {props.children}
        </DialogExtensionContext.Provider>
      </div>
      {showExtension && (
        <div className={css.extension}>
          <div>
            <SelectExtention exWindow={exWindow} />
          </div>
          <Icon name={'chevron-left'} size={24} onClick={() => setShowExtension(false)} className={css.closeBtn} />
        </div>
      )}
    </div>
  )
}

export default DialogExtension
