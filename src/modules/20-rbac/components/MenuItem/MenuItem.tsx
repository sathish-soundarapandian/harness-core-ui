/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { IMenuItemProps, Menu, MenuItem, PopoverInteractionKind, MaybeElement } from '@blueprintjs/core'
import { Icon, Popover, IconName } from '@harness/uicore'
import { usePermission, PermissionsRequest } from '@rbac/hooks/usePermission'
import { useGetFirstDisabledFeature } from '@common/hooks/useFeatures'
import type { FeaturesProps } from 'framework/featureStore/featureStoreUtil'
import type { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { getPermissionRequestFromProps, getTooltip } from '@rbac/utils/utils'
import css from './MenuItem.module.scss'

export interface RbacMenuItemProps extends Omit<IMenuItemProps, 'icon'> {
  permission?: Omit<PermissionsRequest, 'permissions'> & { permission: PermissionIdentifier }
  featuresProps?: FeaturesProps
  icon?: IconName | MaybeElement
}

const RbacMenuItem: React.FC<RbacMenuItemProps> = ({
  permission: permissionRequest,
  featuresProps,
  icon,
  ...restProps
}) => {
  const [canDoAction] = usePermission(getPermissionRequestFromProps(permissionRequest), [permissionRequest])

  const { featureEnabled, disabledFeatureName } = useGetFirstDisabledFeature(featuresProps?.featuresRequest)

  let disabledFeatureProps
  if (disabledFeatureName) {
    disabledFeatureProps = {
      isPermissionPrioritized: featuresProps?.isPermissionPrioritized,
      featureRequest: {
        featureName: disabledFeatureName
      }
    }
  }

  const tooltipProps = getTooltip({
    permissionRequest,
    featureProps: disabledFeatureProps,
    canDoAction,
    featureEnabled
  })
  const { tooltip } = tooltipProps

  const noRequest = !featuresProps?.featuresRequest && !permissionRequest
  const enabled = canDoAction && featureEnabled

  if (noRequest || enabled) {
    return <Menu.Item {...restProps} icon={icon ? <Icon className={css.icon} name={icon as IconName} /> : null} />
  }

  return (
    <Popover
      openOnTargetFocus={false}
      fill
      usePortal
      hoverCloseDelay={50}
      interactionKind={featureEnabled ? PopoverInteractionKind.HOVER_TARGET_ONLY : PopoverInteractionKind.HOVER}
      content={tooltip}
      className={css.popover}
      inheritDarkTheme={false}
    >
      <div
        onClick={(event: React.MouseEvent<HTMLElement, MouseEvent>) => {
          event.stopPropagation()
        }}
      >
        <MenuItem {...restProps} icon={icon ? <Icon className={css.icon} name={icon as IconName} /> : null} disabled />
      </div>
    </Popover>
  )
}

export default RbacMenuItem
