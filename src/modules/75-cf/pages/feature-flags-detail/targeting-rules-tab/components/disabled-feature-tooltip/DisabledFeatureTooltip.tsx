/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC } from 'react'
import { Text } from '@harness/uicore'
import { FeatureWarningTooltip } from '@common/components/FeatureWarning/FeatureWarningWithTooltip'
import RBACTooltip from '@rbac/components/RBACTooltip/RBACTooltip'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import useFeatureEnabled from '../../hooks/useFeatureEnabled'

export interface DisabledFeatureTooltipContentProps {
  permission?: PermissionIdentifier.TOGGLE_FF_FEATUREFLAG | PermissionIdentifier.EDIT_FF_FEATUREFLAG
}
/* 
  Use this if you're passing the tooltip as a prop on an existing component to render 
  an RBAC/Plan Enforced tooltip
*/
export const DisabledFeatureTooltipContent: FC<DisabledFeatureTooltipContentProps> = ({
  permission = PermissionIdentifier.EDIT_FF_FEATUREFLAG
}) => {
  const { canEdit, canToggle } = useFeatureEnabled()

  if (
    (permission === PermissionIdentifier.TOGGLE_FF_FEATUREFLAG && !canToggle) ||
    (permission === PermissionIdentifier.EDIT_FF_FEATUREFLAG && !canEdit)
  ) {
    return <RBACTooltip permission={permission} resourceType={ResourceType.ENVIRONMENT} />
  }

  // if not a permission related, must be plan enforced related
  return <FeatureWarningTooltip featureName={FeatureIdentifier.MAUS} />
}

export interface DisabledFeatureTooltipProps {
  fullWidth?: boolean
  permission?: PermissionIdentifier.TOGGLE_FF_FEATUREFLAG | PermissionIdentifier.EDIT_FF_FEATUREFLAG
}

export const DisabledFeatureTooltip: FC<DisabledFeatureTooltipProps> = ({
  children,
  fullWidth = false,
  permission = PermissionIdentifier.EDIT_FF_FEATUREFLAG
}) => {
  const { canEdit, canToggle, enabledByPlanEnforcement } = useFeatureEnabled()

  if (
    enabledByPlanEnforcement &&
    ((permission === PermissionIdentifier.TOGGLE_FF_FEATUREFLAG && canToggle) ||
      (permission === PermissionIdentifier.EDIT_FF_FEATUREFLAG && canEdit))
  ) {
    return <>{children}</>
  }

  return (
    <Text
      data-testid="disabled-feature-tooltip"
      width="100%"
      inline
      tooltip={<DisabledFeatureTooltipContent permission={permission} />}
      tooltipProps={{
        targetProps: {
          style: { width: fullWidth ? '100%' : 'max-content' }
        }
      }}
    >
      {children}
    </Text>
  )
}

export default DisabledFeatureTooltip
