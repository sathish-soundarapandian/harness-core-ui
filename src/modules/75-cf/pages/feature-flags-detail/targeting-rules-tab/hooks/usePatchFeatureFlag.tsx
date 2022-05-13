/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useParams } from 'react-router-dom'
import { useToaster } from '@harness/uicore'
import patch from '@cf/utils/instructions'
import { PatchFeatureQueryParams, PatchOperation, usePatchFeature, Variation } from 'services/cf'
import useActiveEnvironment from '@cf/hooks/useActiveEnvironment'
import { showToaster } from '@cf/utils/CFUtils'
import { useStrings } from 'framework/strings'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import type { ErrorHandlerProps } from '@rbac/utils/utils'
import { AUTO_COMMIT_MESSAGES } from '@cf/constants/GitSyncConstants'
import { useFFGitSyncContext } from '@cf/contexts/ff-git-sync-context/FFGitSyncContext'
import {
  FormVariationMap,
  TargetingRuleItemStatus,
  TargetingRuleItemType,
  TargetingRulesFormValues,
  VariationPercentageRollout
} from '../types'
import { PatchFeatureFlagUtils } from '../utils/PatchFeatureFlagUtils'
export interface UsePatchFeatureFlagProps {
  featureFlagIdentifier: string
  featureFlagName: string
  initialValues: TargetingRulesFormValues
  variations: Variation[]
  refetchFlag: () => Promise<unknown>
}

interface UsePatchFeatureFlagReturn {
  saveChanges: (newValues: TargetingRulesFormValues) => void
  loading: boolean
}

const usePatchFeatureFlag = ({
  featureFlagIdentifier,
  featureFlagName,
  initialValues,
  refetchFlag
}: UsePatchFeatureFlagProps): UsePatchFeatureFlagReturn => {
  const { projectIdentifier, orgIdentifier, accountId: accountIdentifier } = useParams<Record<string, string>>()
  const { activeEnvironment: environmentIdentifier } = useActiveEnvironment()
  const { getRBACErrorMessage } = useRBACError()
  const { showError } = useToaster()
  const { getString } = useStrings()

  const { saveWithGit } = useFFGitSyncContext()

  const { mutate: patchFeature, loading } = usePatchFeature({
    identifier: featureFlagIdentifier as string,
    queryParams: {
      projectIdentifier,
      environmentIdentifier,
      accountIdentifier,
      orgIdentifier
    } as PatchFeatureQueryParams
  })

  const saveChanges = (submittedValues: TargetingRulesFormValues): void => {
    const patchFeatureUtils = PatchFeatureFlagUtils(submittedValues, initialValues)

    // flag state
    if (patchFeatureUtils.hasFlagStateChanged()) {
      patchFeatureUtils.createUpdateFlagStateInstruction()
    }

    // default ON serves
    if (patchFeatureUtils.hasDefaultOnVariationChanged()) {
      patchFeatureUtils.createDefaultServeOnInstruction()
    }

    // default OFF serves
    if (patchFeatureUtils.hasDefaultOffVariationChanged()) {
      patchFeatureUtils.createDefaultServeOffInstruction()
    }

    // API requires delete rule instructions first so handle those initially
    submittedValues.targetingRuleItems
      .filter(rule => rule.status === TargetingRuleItemStatus.DELETED)
      .forEach(rule => {
        if (rule.type === TargetingRuleItemType.VARIATION) {
          const item = rule as FormVariationMap
          patchFeatureUtils.createRemoveTargetGroupsInstructions(item.targetGroups)
          patchFeatureUtils.createRemoveTargetsInstructions(
            item.variationIdentifier,
            item.targets.map(target => target.value)
          )
        } else {
          const item = rule as VariationPercentageRollout
          patchFeatureUtils.createRemovePercentageRolloutInstruction(item)
        }
      })

    // Loop through the non-deleted rules and handle the added/updated ones
    submittedValues.targetingRuleItems
      .filter(targetingRule => targetingRule.status !== TargetingRuleItemStatus.DELETED)
      .forEach((targetingRule: FormVariationMap | VariationPercentageRollout) => {
        if (targetingRule.type === TargetingRuleItemType.VARIATION) {
          const item = targetingRule as FormVariationMap

          if (targetingRule.status === TargetingRuleItemStatus.ADDED) {
            patchFeatureUtils.createAddTargetGroupInstructions(
              item.variationIdentifier,
              item.targetGroups,
              item.priority
            )

            patchFeatureUtils.createAddTargetsInstructions(
              item.variationIdentifier,
              item.targets.map(x => x.value)
            )
          } else {
            const removedTargetGroups = patchFeatureUtils.removedTargetGroups(item.variationIdentifier)
            if (removedTargetGroups.length) {
              patchFeatureUtils.createRemoveTargetGroupsInstructions(removedTargetGroups)
            }

            const addedTargetGroups = patchFeatureUtils.addedTargetGroups(item.variationIdentifier)
            if (addedTargetGroups.length) {
              patchFeatureUtils.createAddTargetGroupInstructions(
                item.variationIdentifier,
                addedTargetGroups,
                item.priority
              )
            }

            const removedTargetIds = patchFeatureUtils.removedTargets(item.variationIdentifier)
            if (removedTargetIds.length) {
              patchFeatureUtils.createRemoveTargetsInstructions(item.variationIdentifier, removedTargetIds)
            }

            const addedTargetIds = patchFeatureUtils.addedTargets(item.variationIdentifier)
            if (addedTargetIds.length) {
              patchFeatureUtils.createAddTargetsInstructions(item.variationIdentifier, addedTargetIds)
            }
          }
        } else {
          const item = targetingRule as VariationPercentageRollout
          if (item.status === TargetingRuleItemStatus.ADDED) {
            patchFeatureUtils.createAddPercentageRolloutInstructions(item, item.priority)
          } else {
            const updatedPercentageRollouts = patchFeatureUtils.updatedPercentageRollouts()
            patchFeatureUtils.createUpdatePercentageRolloutInstructions(updatedPercentageRollouts)
          }
        }
      })

    const handleSave = async (data: PatchOperation): Promise<void> => {
      try {
        await patchFeature(data)
        patch.feature.reset()
        await refetchFlag()
        showToaster(getString('cf.messages.flagUpdated'))
      } catch (error: unknown) {
        patch.feature.reset()
        showError(getRBACErrorMessage(error as ErrorHandlerProps))
      }
    }

    // submit request
    patch.feature.onPatchAvailable(async formData => {
      saveWithGit(
        featureFlagName,
        featureFlagIdentifier,
        AUTO_COMMIT_MESSAGES.UPDATED_FLAG_TARGETING,
        formData,
        handleSave
      )
    })
  }
  return {
    saveChanges,
    loading
  }
}

export default usePatchFeatureFlag
