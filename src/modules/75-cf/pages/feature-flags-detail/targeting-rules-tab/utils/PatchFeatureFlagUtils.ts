/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import isEqual from 'lodash-es/isEqual'
import type { FeatureState } from 'services/cf'
import patch from '@cf/utils/instructions'
import {
  FormVariationMap,
  VariationTargetGroup,
  TargetingRuleItemType,
  TargetingRulesFormValues,
  VariationPercentageRollout
} from '../types'

// Utils class to help encapsulate the complexity around patch instruction creation and hide this from the components.
interface PatchFeatureFlagUtilsReturn {
  hasFlagStateChanged: () => boolean
  hasDefaultOnVariationChanged: () => boolean
  hasDefaultOffVariationChanged: () => boolean
  addedTargetGroups: (variationIdentifier: string) => VariationTargetGroup[]
  removedTargetGroups: (variationIdentifier: string) => VariationTargetGroup[]
  addedTargets: (variationIdentifier: string) => string[]
  removedTargets: (variationIdentifier: string) => string[]
  updatedPercentageRollouts: () => VariationPercentageRollout[]
  createUpdateFlagStateInstruction: () => void
  createDefaultServeOnInstruction: () => void
  createDefaultServeOffInstruction: () => void
  createAddTargetGroupInstructions: (
    variationIdentifier: string,
    targetGroups: VariationTargetGroup[],
    position: number
  ) => void
  createRemoveTargetGroupsInstructions: (targetGroups: VariationTargetGroup[]) => void
  createAddTargetsInstructions: (variationIdentifier: string, targetIds: string[]) => void
  createRemoveTargetsInstructions: (variationIdentifier: string, targetIds: string[]) => void
  createAddPercentageRolloutInstructions: (percentageRollout: VariationPercentageRollout, index: number) => void
  createUpdatePercentageRolloutInstructions: (percentageRollouts: VariationPercentageRollout[]) => void
  createRemovePercentageRolloutInstruction: (percentageRollout: VariationPercentageRollout) => void
}

export const PatchFeatureFlagUtils = (
  submittedValues: TargetingRulesFormValues,
  initialValues: TargetingRulesFormValues
): PatchFeatureFlagUtilsReturn => {
  const initialPercentageRollouts = initialValues.targetingRuleItems.filter(
    targetingRule => targetingRule.type === TargetingRuleItemType.PERCENTAGE_ROLLOUT
  ) as VariationPercentageRollout[]

  const submittedPercentageRollouts = submittedValues.targetingRuleItems.filter(
    targetingRule => targetingRule.type === TargetingRuleItemType.PERCENTAGE_ROLLOUT
  ) as VariationPercentageRollout[]

  const initialVariations = initialValues.targetingRuleItems.filter(
    targetingRule => targetingRule.type === TargetingRuleItemType.VARIATION
  ) as FormVariationMap[]

  const submittedVariations = submittedValues.targetingRuleItems.filter(
    targetingRule => targetingRule.type === TargetingRuleItemType.VARIATION
  ) as FormVariationMap[]

  const hasFlagStateChanged = (): boolean => submittedValues.state !== initialValues.state

  const hasDefaultOnVariationChanged = (): boolean => submittedValues.onVariation !== initialValues.onVariation

  const hasDefaultOffVariationChanged = (): boolean => submittedValues.offVariation !== initialValues.offVariation

  const addedTargetGroups = (variationIdentifier: string): VariationTargetGroup[] => {
    const initialTargetGroups: VariationTargetGroup[] =
      initialVariations.find(x => x.variationIdentifier === variationIdentifier)?.targetGroups || []
    const submittedTargetGroups: VariationTargetGroup[] =
      submittedVariations.find(x => x.variationIdentifier === variationIdentifier)?.targetGroups || []

    return submittedTargetGroups.filter(
      submittedTargetGroup => !initialTargetGroups.map(({ label }) => label).includes(submittedTargetGroup.label)
    )
  }

  const removedTargetGroups = (variationIdentifier: string): VariationTargetGroup[] => {
    const initialTargetGroups: VariationTargetGroup[] =
      initialVariations.find(x => x.variationIdentifier === variationIdentifier)?.targetGroups || []
    const submittedTargetGroups: VariationTargetGroup[] =
      submittedVariations.find(x => x.variationIdentifier === variationIdentifier)?.targetGroups || []

    return initialTargetGroups.filter(
      targetGroup => !submittedTargetGroups.map(({ label }) => label).includes(targetGroup.label)
    )
  }

  const addedTargets = (variationIdentifier: string): string[] => {
    const initialTargetIds: string[] =
      initialVariations.find(x => x.variationIdentifier === variationIdentifier)?.targets.map(x => x.value) || []
    const submittedTargetIds: string[] =
      submittedVariations.find(x => x.variationIdentifier === variationIdentifier)?.targets.map(x => x.value) || []

    return submittedTargetIds.filter(id => !initialTargetIds.includes(id))
  }

  const removedTargets = (variationIdentifier: string): string[] => {
    const initialTargetIds: string[] =
      initialVariations.find(x => x.variationIdentifier === variationIdentifier)?.targets.map(x => x.value) || []
    const submittedTargetIds: string[] =
      submittedVariations.find(x => x.variationIdentifier === variationIdentifier)?.targets.map(x => x.value) || []

    return initialTargetIds.filter(id => !submittedTargetIds.includes(id))
  }

  const updatedPercentageRollouts = (): VariationPercentageRollout[] => {
    return submittedPercentageRollouts.length === initialPercentageRollouts.length
      ? submittedPercentageRollouts.filter(
          initial => !initialPercentageRollouts.some(submitted => isEqual(initial, submitted))
        )
      : []
  }

  // INSTRUCTIONS SECTION
  const createUpdateFlagStateInstruction = (): void =>
    patch.feature.addInstruction(patch.creators.setFeatureFlagState(submittedValues.state as FeatureState))

  const createDefaultServeOnInstruction = (): void =>
    patch.feature.addInstruction(patch.creators.updateDefaultServeByVariation(submittedValues.onVariation))

  const createDefaultServeOffInstruction = (): void =>
    patch.feature.addInstruction(patch.creators.updateOffVariation(submittedValues.offVariation))

  const createAddTargetGroupInstructions = (
    variationIdentifier: string,
    targetGroups: VariationTargetGroup[],
    priority: number
  ): void => {
    patch.feature.addAllInstructions(
      targetGroups.map((targetGroup, index) =>
        patch.creators.addRule({
          uuid: targetGroup.ruleId,
          priority: priority + index + 1,
          serve: {
            variation: variationIdentifier
          },
          clauses: [
            {
              op: 'segmentMatch',
              values: [targetGroup.value]
            }
          ]
        })
      )
    )
  }

  const createRemoveTargetGroupsInstructions = (targetGroups: VariationTargetGroup[]): void => {
    patch.feature.addAllInstructions(
      targetGroups.map(targetGroup => patch.creators.removeRule(targetGroup.ruleId as string))
    )
  }

  const createAddTargetsInstructions = (variationIdentifier: string, targets: string[]): void => {
    patch.feature.addInstruction(patch.creators.addTargetsToVariationTargetMap(variationIdentifier, targets))
  }

  const createRemoveTargetsInstructions = (variationIdentifier: string, removedTargetIds: string[]): void => {
    patch.feature.addInstruction(
      patch.creators.removeTargetsToVariationTargetMap(variationIdentifier, removedTargetIds)
    )
  }

  const createAddPercentageRolloutInstructions = (
    percentageRollout: VariationPercentageRollout,
    index: number
  ): void => {
    patch.feature.addInstruction(
      patch.creators.addRule({
        uuid: percentageRollout.ruleId,
        priority: index + 1,
        serve: {
          distribution: {
            bucketBy: percentageRollout.bucketBy,
            variations: percentageRollout.variations
          }
        },
        clauses: [
          {
            op: 'segmentMatch',
            values: percentageRollout.clauses[0].values
          }
        ]
      })
    )
  }

  const createUpdatePercentageRolloutInstructions = (percentageRollouts: VariationPercentageRollout[]): void => {
    percentageRollouts.forEach(percentageRollout => {
      const { bucketBy, variations } = percentageRollout

      patch.feature.addInstruction(
        patch.creators.updateRuleVariation(percentageRollout.ruleId as string, { bucketBy, variations })
      )
      const { attribute, negate, op, id, values } = percentageRollout.clauses[0]
      patch.feature.addInstruction(
        patch.creators.updateClause(percentageRollout.ruleId as string, id as string, {
          attribute,
          negate,
          op,
          values
        })
      )
    })
  }

  const createRemovePercentageRolloutInstruction = (percentageRollout: VariationPercentageRollout): void => {
    patch.feature.addInstruction(patch.creators.removeRule(percentageRollout.ruleId as string))
  }

  return {
    hasFlagStateChanged,
    hasDefaultOnVariationChanged,
    hasDefaultOffVariationChanged,
    createUpdateFlagStateInstruction,
    addedTargetGroups,
    removedTargetGroups,
    addedTargets,
    removedTargets,
    updatedPercentageRollouts,
    createDefaultServeOnInstruction,
    createDefaultServeOffInstruction,
    createAddTargetGroupInstructions,
    createRemoveTargetGroupsInstructions,
    createAddTargetsInstructions,
    createRemoveTargetsInstructions,
    createAddPercentageRolloutInstructions,
    createUpdatePercentageRolloutInstructions,
    createRemovePercentageRolloutInstruction
  }
}
