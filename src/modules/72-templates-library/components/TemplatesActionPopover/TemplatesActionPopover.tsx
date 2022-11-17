/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Menu, Position } from '@blueprintjs/core'
import { Popover, Icon, IconName, Text } from '@harness/uicore'
import type { PopoverProps } from '@harness/uicore/dist/components/Popover/Popover'
import cx from 'classnames'
import css from './TemplatesActionPopover.module.scss'

export interface TemplateMenuItem {
  icon?: IconName
  label: string
  disabled?: boolean
  onClick: () => void
}

export interface TemplatesActionPopoverProps extends PopoverProps {
  open?: boolean
  items: TemplateMenuItem[]
  setMenuOpen: (flag: boolean) => void
  className?: string
}
export const TemplatesActionPopover = (props: React.PropsWithChildren<TemplatesActionPopoverProps>) => {
  const { items, open, children, setMenuOpen, className, portalClassName, ...popoverProps } = props

  return (
    <Popover
      isOpen={open}
      onInteraction={nextOpenState => {
        setMenuOpen(nextOpenState)
      }}
      position={Position.BOTTOM_RIGHT}
      className={cx(css.main, className)}
      portalClassName={cx(css.popover, portalClassName)}
      {...popoverProps}
    >
      {children}
      <Menu>
        {items.map(item => {
          return (
            <li
              key={item.label}
              className={cx(css.menuItem, { [css.disabled]: item.disabled })}
              onClick={e => {
                e.stopPropagation()
                item.onClick()
                setMenuOpen(false)
              }}
            >
              {item.icon && <Icon name={item.icon} size={12} />}
              <Text lineClamp={1}>{item.label}</Text>
            </li>
          )
        })}
      </Menu>
    </Popover>
  )
}
