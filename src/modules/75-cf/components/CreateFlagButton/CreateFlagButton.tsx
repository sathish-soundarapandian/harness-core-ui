/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactElement } from 'react'
import { ButtonVariation } from '@harness/uicore'
import RbacButton from '@rbac/components/Button/Button'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import usePlanEnforcement from '@cf/hooks/usePlanEnforcement'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import { useStrings } from 'framework/strings'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { Category, FeatureActions } from '@common/constants/TrackingConstants'
import useActiveEnvironment from '@cf/hooks/useActiveEnvironment'

export interface CreateFlagButtonProps {
  disabled?: boolean
  showModal: () => void
  isLinkVariation?: boolean
}

const CreateFlagButton = (props: CreateFlagButtonProps): ReactElement => {
  const { disabled, showModal, isLinkVariation } = props
  const { activeEnvironment } = useActiveEnvironment()

  const { getString } = useStrings()
  const { isPlanEnforcementEnabled } = usePlanEnforcement()
  const { trackEvent } = useTelemetry()

  const planEnforcementProps = isPlanEnforcementEnabled
    ? {
        featuresProps: {
          featuresRequest: {
            featureNames: [FeatureIdentifier.MAUS]
          }
        }
      }
    : undefined
  return (
    <RbacButton
      data-testid="create-flag-button"
      disabled={disabled}
      text={getString('cf.featureFlags.newFlag')}
      icon="plus"
      intent="primary"
      variation={isLinkVariation ? ButtonVariation.LINK : ButtonVariation.PRIMARY}
      onClick={() => {
        trackEvent(FeatureActions.AddNewFeatureFlag, {
          category: Category.FEATUREFLAG
        })
        showModal()
      }}
      margin={isLinkVariation ? { top: 'xlarge' } : {}}
      permission={{
        permission: PermissionIdentifier.EDIT_FF_FEATUREFLAG,
        resource: activeEnvironment
          ? { resourceType: ResourceType.ENVIRONMENT, resourceIdentifier: activeEnvironment }
          : { resourceType: ResourceType.FEATUREFLAG }
      }}
      {...planEnforcementProps}
    />
  )
}

export default CreateFlagButton
