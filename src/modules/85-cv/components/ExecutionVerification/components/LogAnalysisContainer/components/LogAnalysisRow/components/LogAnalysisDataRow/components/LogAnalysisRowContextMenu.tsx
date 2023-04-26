import React from 'react'
import { isEmpty } from 'lodash-es'
import { MenuItem } from '@blueprintjs/core'
import type { LogAnalysisRowContextMenuItemType } from './LogAnalysisDataRow.types'
import css from './LogAnalysisRowContextMenu.module.scss'

interface LogAnalysisRowContextMenuProps {
  menuItems: LogAnalysisRowContextMenuItemType[]
}

export default function LogAnalysisRowContextMenu({ menuItems }: LogAnalysisRowContextMenuProps): JSX.Element | null {
  if (isEmpty(menuItems)) return null

  const content = menuItems.map(menuItem => {
    return (
      <MenuItem
        key={menuItem.displayText}
        onClick={(e: React.MouseEvent<HTMLElement, MouseEvent>) => {
          e.preventDefault()
          e.stopPropagation()
          menuItem.onClick()
        }}
        disabled={menuItem.disabled}
        className={css.logAnalysisMenuItem}
        text={menuItem.displayText}
      />
    )
  })

  return <>{content}</>
}
