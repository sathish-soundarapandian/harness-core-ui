/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { AnchorHTMLAttributes, ReactElement} from 'react';
import React, { Fragment } from 'react'
import { Classes, Menu } from '@blueprintjs/core'
import type { ButtonProps, IconName } from '@harness/uicore';
import { Button, Icon } from '@harness/uicore'
import RbacMenuItem from '@rbac/components/MenuItem/MenuItem'
import type { RbacMenuItemProps } from '@rbac/components/MenuItem/MenuItem'

type Item = (RbacMenuItemProps & AnchorHTMLAttributes<HTMLAnchorElement>) | '-'

export interface RbacOptionsMenuButtonProps extends ButtonProps {
  items: Item[]
}

const RbacOptionsMenuButton = ({ items, ...props }: RbacOptionsMenuButtonProps): ReactElement => (
  <Button
    minimal
    icon="Options"
    tooltipProps={{ isDark: true, interactionKind: 'click', hasBackdrop: true }}
    tooltip={
      <Menu style={{ minWidth: 'unset' }}>
        {items.map((item: Item, key: number) => (
          <Fragment key={key}>
            {item === '-' ? (
              <Menu.Divider />
            ) : (item as RbacMenuItemProps)?.permission ? (
              <RbacMenuItem className={Classes.POPOVER_DISMISS} {...(item as RbacMenuItemProps)} />
            ) : (
              <Menu.Item
                className={Classes.POPOVER_DISMISS}
                {...item}
                icon={item.icon ? <Icon name={item.icon as IconName} /> : null}
              />
            )}
          </Fragment>
        ))}
      </Menu>
    }
    {...props}
  />
)

export default RbacOptionsMenuButton
