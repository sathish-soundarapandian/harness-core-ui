/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { CFVariationColors } from '@cf/constants'
import type { Feature, Segment } from 'services/cf'
import {
  FormVariationMap,
  TargetingRuleItemStatus,
  TargetingRuleItemType,
  TargetingRulesFormValues,
  VariationColorMap,
  VariationPercentageRollout,
  VariationTarget,
  VariationTargetGroup
} from '../types'

interface UseTargetingRulesFormData {
  featureFlagData: Feature
  segments: Segment[]
}

interface UseTargetingRulesFormDataReturn {
  initialValues: TargetingRulesFormValues
  getNextPriority: (targetingRules: (FormVariationMap | VariationPercentageRollout)[]) => number
  variationColorMap: VariationColorMap
}

// convert variations/targets/target groups into a more UI friendly structure
// Individual rules (variations/percentage rollouts) don't have a priority - only target groups do
// So we order the rules based on the target group with the highest priority
// This is to maintain the ordering
const useTargetingRulesFormData = ({
  featureFlagData,
  segments
}: UseTargetingRulesFormData): UseTargetingRulesFormDataReturn => {
  const formVariationMap: FormVariationMap[] = []
  const variationColorMap: VariationColorMap = {}
  featureFlagData.variations.forEach((variation, variationIndex) => {
    variationColorMap[variation.identifier] = CFVariationColors[variationIndex]
    const variationTargets: VariationTarget[] =
      featureFlagData.envProperties?.variationMap
        ?.find(variationMapItem => variation.identifier === variationMapItem.variation)
        ?.targets?.map(target => ({
          label: target.name,
          value: target.identifier
        })) || []

    const variationTargetGroups: VariationTargetGroup[] =
      featureFlagData.envProperties?.rules
        ?.filter(rule => rule.serve.variation === variation.identifier)
        .map(targetGroupRule => ({
          priority: targetGroupRule.priority,
          label: segments.find(segment => segment.identifier === targetGroupRule.clauses[0].values[0])?.name as string,
          ruleId: targetGroupRule.ruleId as string,
          value: targetGroupRule.clauses[0].values[0]
        })) || []

    // highest priority = lowest number
    const highestPriority =
      variationTargetGroups.reduce(
        (prev: VariationTargetGroup, current: VariationTargetGroup) =>
          Number(prev.priority) < Number(current.priority) ? prev : current,
        {} as VariationTargetGroup
      ).priority || 0

    // if this variation doesn't contain any targets/target groups we dont display it initially
    if (variationTargets.length || variationTargetGroups.length) {
      formVariationMap.push({
        status: TargetingRuleItemStatus.LOADED,
        priority: highestPriority,
        type: TargetingRuleItemType.VARIATION,
        variationIdentifier: variation.identifier,
        variationName: variation.name as string,
        targets: variationTargets,
        targetGroups: variationTargetGroups
      })
    }
  })

  const percentageRolloutRules = featureFlagData.envProperties?.rules?.filter(rule => rule.serve.distribution)
  const variationPercentageRollouts: VariationPercentageRollout[] = percentageRolloutRules
    ? percentageRolloutRules.map(percentageRollout => ({
        status: TargetingRuleItemStatus.LOADED,
        type: TargetingRuleItemType.PERCENTAGE_ROLLOUT,
        priority: percentageRollout.priority,
        variations: percentageRollout.serve.distribution?.variations || [],
        bucketBy: percentageRollout.serve.distribution?.bucketBy || 'identifier',
        clauses: percentageRollout.clauses,
        ruleId: percentageRollout.ruleId as string
      }))
    : []

  const targetingRuleItems = [...formVariationMap, ...variationPercentageRollouts].sort(
    (prev, next) => prev?.priority - next?.priority
  )

  const initialValues: TargetingRulesFormValues = {
    state: featureFlagData.envProperties?.state as string,
    onVariation: featureFlagData.envProperties?.defaultServe.variation
      ? featureFlagData.envProperties?.defaultServe.variation
      : featureFlagData.defaultOnVariation,
    offVariation: featureFlagData.envProperties?.offVariation as string,
    targetingRuleItems
  }

  const getNextPriority = (targetingRules: (FormVariationMap | VariationPercentageRollout)[]): number => {
    return Math.max(...targetingRules.map(x => x.priority)) + 1
  }
  return {
    initialValues,
    variationColorMap,
    getNextPriority
  }
}

export default useTargetingRulesFormData
