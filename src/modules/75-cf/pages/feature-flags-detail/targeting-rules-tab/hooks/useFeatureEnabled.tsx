/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import useActiveEnvironment from '@cf/hooks/useActiveEnvironment'
import { useFeature } from '@common/hooks/useFeatures'
import { usePermission } from '@rbac/hooks/usePermission'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'

interface UseFeatureEnabledReturn {
  enabledByPermission: boolean
  enabledByPlanEnforcement: boolean
  featureEnabled: boolean
  canEdit: boolean
  canToggle: boolean
}

const useFeatureEnabled = (): UseFeatureEnabledReturn => {
  const { activeEnvironment } = useActiveEnvironment()

  const { enabled: enabledByPlanEnforcement } = useFeature({
    featureRequest: {
      featureName: FeatureIdentifier.MAUS
    }
  })

  const [canEdit, canToggle] = usePermission(
    {
      resource: {
        resourceType: ResourceType.ENVIRONMENT,
        resourceIdentifier: activeEnvironment
      },
      permissions: [PermissionIdentifier.EDIT_FF_FEATUREFLAG, PermissionIdentifier.TOGGLE_FF_FEATUREFLAG]
    },
    [activeEnvironment]
  )

  const hasPermission = canEdit || canToggle

  return {
    enabledByPermission: hasPermission,
    enabledByPlanEnforcement,
    featureEnabled: hasPermission && enabledByPlanEnforcement,
    canEdit,
    canToggle
  }
}

export default useFeatureEnabled
