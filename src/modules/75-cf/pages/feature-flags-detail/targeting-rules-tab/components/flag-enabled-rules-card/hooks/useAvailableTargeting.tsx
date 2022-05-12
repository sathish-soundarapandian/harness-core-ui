/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { Segment, Target, Variation } from 'services/cf'
import {
  FormVariationMap,
  TargetingRuleItemStatus,
  TargetingRuleItemType,
  VariationPercentageRollout,
  VariationTarget,
  VariationTargetGroup
} from '../../../types'

// Currently 1 target/target group can be added per targeting rule
// This hook returns the available target groups/targets that has not been added to a rule,
// and returns the availble variations used in the "Add Targeting" button/dropdown
interface UseAvailableTargetingProps {
  featureFlagVariations: Variation[]
  targetingRuleItems: (FormVariationMap | VariationPercentageRollout)[]
  segments: Segment[]
  targets: Target[]
}

interface UseAvailableTargetingReturn {
  targetingDropdownVariations: Variation[]
  availableSegments: Segment[]
  availableTargets: Target[]
}

const useAvailableTargeting = ({
  featureFlagVariations,
  targetingRuleItems,
  segments,
  targets
}: UseAvailableTargetingProps): UseAvailableTargetingReturn => {
  const targetingDropdownVariations = featureFlagVariations.filter(
    variation =>
      !targetingRuleItems
        .filter(x => x.status !== TargetingRuleItemStatus.DELETED)
        .map(targetingRuleItem => (targetingRuleItem as FormVariationMap).variationIdentifier)
        .includes(variation.identifier)
  )

  const usedSegments: VariationTargetGroup[] = []
  targetingRuleItems
    .filter(x => x.status !== TargetingRuleItemStatus.DELETED)
    .forEach(targetingRuleItem => {
      if (targetingRuleItem.type === TargetingRuleItemType.VARIATION) {
        const item = targetingRuleItem as FormVariationMap
        usedSegments.push(...item.targetGroups)
      } else {
        const item = targetingRuleItem as VariationPercentageRollout
        usedSegments.push({
          priority: item.priority,
          label: segments.find(segment => segment.identifier === item.clauses[0].values[0])?.name as string,
          value: item.clauses[0].values[0],
          ruleId: item.ruleId || ''
        })
      }
    })

  const availableSegments = segments.filter(
    segment =>
      !usedSegments.some(usedSegment => segment.identifier === usedSegment.value || segment.name === usedSegment.label)
  )

  const usedTargets: VariationTarget[] = []
  targetingRuleItems
    .filter(x => x.status !== TargetingRuleItemStatus.DELETED)
    .forEach(targetingRuleItem => {
      if (targetingRuleItem.type === TargetingRuleItemType.VARIATION) {
        const item = targetingRuleItem as FormVariationMap
        usedTargets.push(...item.targets)
      }
    })

  const availableTargets = targets.filter(
    target =>
      !usedTargets.some(usedTarget => target.identifier === usedTarget.value || target.name === usedTarget.label)
  )
  return {
    targetingDropdownVariations,
    availableSegments,
    availableTargets
  }
}

export default useAvailableTargeting
