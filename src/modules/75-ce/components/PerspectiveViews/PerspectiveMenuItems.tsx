import React from 'react'
import { Menu, PopoverInteractionKind } from '@blueprintjs/core'
import { Popover } from '@harness/uicore'
import css from './PerspectiveGridView.module.scss'

const PopoverMenuItem = ({ ...props }) => {
  if (!props.disabled) {
    return <Menu.Item {...props} />
  }

  return (
    <Popover
      openOnTargetFocus={false}
      fill
      usePortal
      hoverCloseDelay={50}
      interactionKind={PopoverInteractionKind.HOVER}
      content={props.tooltip}
      className={css.popover}
      inheritDarkTheme={false}
    >
      <div
        onClick={(event: React.MouseEvent<HTMLElement, MouseEvent>) => {
          event.stopPropagation()
        }}
        data-testid="menuItem"
      >
        <Menu.Item {...props} />
      </div>
    </Popover>
  )
}

export default PopoverMenuItem
