import React from 'react'
import { isEmpty } from 'lodash-es'
import { MenuItem } from '@blueprintjs/core'
import css from './LogAnalysisRowContextMenu.module.scss'

interface LogAnalysisRowContextMenuItemType {
  displayText: string
  onClick: () => void
}

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
        className={css.logAnalysisMenuItem}
        text={menuItem.displayText}
      />
    )
  })

  return <>{content}</>
}
