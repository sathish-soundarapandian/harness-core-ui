/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Menu, PopoverInteractionKind } from '@blueprintjs/core'
import { Popover, Text } from '@harness/uicore'
import RBACTooltip from '@rbac/components/RBACTooltip/RBACTooltip'
import type { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import type { ResourceType } from '@rbac/interfaces/ResourceType'
import css from './PerspectiveGridView.module.scss'

export const getToolTip = (
  canDoAction: boolean,
  rbacToolTipPermission: PermissionIdentifier,
  rbacResourceType: ResourceType,
  isDefaultPerspective?: boolean,
  message?: string
): JSX.Element | undefined => {
  if (isDefaultPerspective && message) {
    return <Text padding="small">{message}</Text>
  }
  if (!canDoAction) {
    return <RBACTooltip permission={rbacToolTipPermission} resourceType={rbacResourceType} />
  }
}

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
