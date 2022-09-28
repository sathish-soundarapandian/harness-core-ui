/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Popover, StyledProps, Toggle } from '@harness/uicore'
import type { ToggleProps } from '@harness/uicore/dist/components/Toggle/Toggle'
import { PopoverInteractionKind } from '@blueprintjs/core'
import { PermissionsRequest, usePermission } from '@rbac/hooks/usePermission'
import RBACTooltip from '@rbac/components/RBACTooltip/RBACTooltip'

interface RbacToggleProps {
  permissionRequest: PermissionsRequest
}

const RbacToggle: React.FC<RbacToggleProps & ToggleProps & StyledProps> = ({
  permissionRequest,
  disabled,
  ...props
}) => {
  const [canDoAction] = usePermission(permissionRequest, [permissionRequest])

  return (
    <Popover
      boundary="viewport"
      position="top"
      interactionKind={PopoverInteractionKind.HOVER}
      content={
        !canDoAction ? (
          <RBACTooltip
            permission={permissionRequest.permissions[0]}
            resourceType={permissionRequest.resource.resourceType}
            resourceScope={permissionRequest.resourceScope}
          />
        ) : undefined
      }
    >
      <Toggle {...props} disabled={canDoAction === false ? true : disabled} />
    </Popover>
  )
}

export default RbacToggle
