/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Card, Container, FontVariation, Heading, Layout, SelectOption } from '@harness/uicore'
import React, { ReactElement } from 'react'

import { useStrings } from 'framework/strings'
import type { Segment, Target, Variation } from 'services/cf'
import DefaultRules from '../default-rules/DefaultRules'
import SpecificTargetingItem from '../specific-targeting-item/SpecificTargetingItem'
import {
  FormVariationMap,
  VariationPercentageRollout,
  TargetingRuleItemType,
  VariationColorMap,
  TargetingRuleItemStatus
} from '../../types'
import PercentageRolloutItem from '../percentage-rollout-item/PercentageRolloutItem'
import AddTargetingButton from '../add-targeting-button/AddTargetingButton'
import useAvailableTargeting from './hooks/useAvailableTargeting'

export interface FlagEnabledRulesCardProps {
  targets: Target[]
  segments: Segment[]
  targetingRuleItems: (VariationPercentageRollout | FormVariationMap)[]
  featureFlagVariations: Variation[]
  variationColorMap: VariationColorMap
  disabled: boolean
  refetchSegments: (searchTerm: string) => void
  refetchTargets: (searchTerm: string) => void
  addVariation: (newVariation: Variation) => void
  removeVariation: (removedVariationIndex: number) => void
  addPercentageRollout: () => void
  removePercentageRollout: (index: number) => void
}

const FlagEnabledRulesCard = (props: FlagEnabledRulesCardProps): ReactElement => {
  const {
    targets,
    segments,
    targetingRuleItems,
    featureFlagVariations,
    variationColorMap,
    refetchSegments,
    refetchTargets,
    addVariation,
    removeVariation,
    addPercentageRollout,
    removePercentageRollout,
    disabled
  } = props

  const { getString } = useStrings()

  const { availableSegments, availableTargets, targetingDropdownVariations } = useAvailableTargeting({
    featureFlagVariations,
    segments,
    targetingRuleItems,
    targets
  })

  return (
    <Card data-testid="flag-enabled-rules-card">
      <Container border={{ bottom: true }} padding={{ bottom: 'medium' }} margin={{ bottom: 'medium' }}>
        <DefaultRules
          featureFlagVariations={featureFlagVariations}
          inputName="onVariation"
          titleStringId="cf.featureFlags.rules.whenFlagEnabled"
          disabled={disabled}
        />
      </Container>
      <Layout.Vertical spacing="medium" id="rules-container">
        <Heading level={4} font={{ variation: FontVariation.BODY2 }}>
          {getString('cf.featureFlags.rules.specificTargeting')}
        </Heading>
        {targetingRuleItems.map((targetingRuleItem, index) => {
          if (
            targetingRuleItem.type === TargetingRuleItemType.VARIATION &&
            targetingRuleItem.status !== TargetingRuleItemStatus.DELETED
          ) {
            const item = targetingRuleItem as FormVariationMap
            return (
              <SpecificTargetingItem
                key={`${item.variationIdentifier}_${index}`}
                index={index}
                variationColorMap={variationColorMap}
                disabled={disabled}
                targets={availableTargets}
                segments={availableSegments}
                removeVariation={removeVariation}
                refetchSegments={refetchSegments}
                refetchTargets={refetchTargets}
                formVariationMapItem={item}
              />
            )
          } else if (
            targetingRuleItem.type === TargetingRuleItemType.PERCENTAGE_ROLLOUT &&
            targetingRuleItem.status !== TargetingRuleItemStatus.DELETED
          ) {
            const item = targetingRuleItem as VariationPercentageRollout
            const initialOption: SelectOption = {
              value: item.clauses[0].values[0],
              label:
                segments.find(segment => segment.identifier === item.clauses[0].values[0])?.name ||
                item.clauses[0].values[0]
            }
            return (
              <PercentageRolloutItem
                key={item.ruleId}
                disabled={disabled}
                index={index}
                initialOption={initialOption}
                featureFlagVariations={featureFlagVariations}
                removePercentageRollout={removePercentageRollout}
                segments={availableSegments}
                variationPercentageRollout={item}
              />
            )
          }
        })}

        <AddTargetingButton
          addPercentageRollout={addPercentageRollout}
          targetingDropdownVariations={targetingDropdownVariations}
          addVariation={addVariation}
          variationColorMap={variationColorMap}
          disabled={disabled}
        />
      </Layout.Vertical>
    </Card>
  )
}

export default FlagEnabledRulesCard
