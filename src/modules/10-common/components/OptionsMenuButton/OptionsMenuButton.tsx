/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Classes, Menu } from '@blueprintjs/core'
import { Button, ButtonProps } from '@harness/uicore'

export const MenuDivider = '-' as const

export interface OptionsMenuButtonProps extends ButtonProps {
  items: Array<React.ComponentProps<typeof Menu.Item> | '-'>
}

export const OptionsMenuButton: React.FC<OptionsMenuButtonProps> = ({ items, ...props }) => {
  return (
    <Button
      minimal
      icon="Options"
      tooltipProps={{ isDark: true, interactionKind: 'click', hasBackdrop: true }}
      tooltip={
        <Menu style={{ minWidth: 'unset' }}>
          {items.map(
            (item, index) =>
              ((item as string) === MenuDivider && <Menu.Divider key={index} />) || (
                <Menu.Item
                  key={(item as React.ComponentProps<typeof Menu.Item>).text as string}
                  className={Classes.POPOVER_DISMISS}
                  {...item}
                />
              )
          )}
        </Menu>
      }
      {...props}
    />
  )
}
