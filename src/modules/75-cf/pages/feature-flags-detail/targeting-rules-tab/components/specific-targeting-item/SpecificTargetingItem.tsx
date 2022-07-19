/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Button, Container, FontVariation, FormInput, Layout, Text } from '@harness/uicore'
import React, { ReactElement } from 'react'
import { v4 as uuid } from 'uuid'
import { useStrings } from 'framework/strings'
import type { Segment, Target } from 'services/cf'
import type { FormVariationMap, VariationColorMap, VariationTarget, VariationTargetGroup } from '../../types'
import DisabledFeatureTooltip from '../disabled-feature-tooltip/DisabledFeatureTooltip'

export interface SpecificTargetingItemProps {
  index: number
  disabled: boolean
  targets: Target[]
  segments: Segment[]
  formVariationMapItem: FormVariationMap
  variationColorMap: VariationColorMap
  removeVariation: (removedVariationIndex: number) => void
  refetchSegments: (searchTerm: string) => void
  refetchTargets: (searchTerm: string) => void
}

export interface TagInputItem {
  label: string
  value: string
}

const SpecificTargetingItem = (props: SpecificTargetingItemProps): ReactElement => {
  const {
    targets,
    segments,
    formVariationMapItem,
    variationColorMap,
    index,
    removeVariation,
    refetchSegments,
    refetchTargets,
    disabled
  } = props

  const { getString } = useStrings()
  return (
    <Layout.Vertical spacing="medium" border={{ bottom: true }}>
      <Container flex={{ justifyContent: 'space-between' }}>
        <Text
          inline
          font={{ variation: FontVariation.BODY }}
          icon="full-circle"
          iconProps={{ style: { color: variationColorMap[formVariationMapItem.variationIdentifier] } }}
        >
          {formVariationMapItem.variationName}
        </Text>
        <DisabledFeatureTooltip>
          <Button
            disabled={disabled}
            data-testid={`remove_variation_${formVariationMapItem.variationIdentifier}`}
            icon="trash"
            minimal
            withoutCurrentColor
            onClick={e => {
              e.preventDefault()
              removeVariation(index)
            }}
          />
        </DisabledFeatureTooltip>
      </Container>
      <Container padding={{ bottom: 'small' }}>
        <div data-testid={`${formVariationMapItem.variationIdentifier}_targets`}>
          <DisabledFeatureTooltip fullWidth>
            <FormInput.MultiSelect
              name={`targetingRuleItems[${index}].targets`}
              label={getString('cf.featureFlags.rules.toTargets')}
              items={targets.map<VariationTarget>(target => ({ label: target.name, value: target.identifier }))}
              multiSelectProps={{
                allowCreatingNewItems: false,
                placeholder: getString('cf.featureFlags.rules.searchTargets'),
                onQueryChange: query => refetchTargets(query)
              }}
              disabled={disabled}
            />
          </DisabledFeatureTooltip>
        </div>
        <div data-testid={`${formVariationMapItem.variationIdentifier}_target_groups`}>
          <DisabledFeatureTooltip fullWidth>
            <FormInput.MultiSelect
              name={`targetingRuleItems[${index}].targetGroups`}
              label={getString('cf.featureFlags.rules.toTargetGroups')}
              items={segments.map<VariationTargetGroup>(segment => ({
                label: segment.name,
                value: segment.identifier,
                ruleId: uuid(),
                priority: index + 1
              }))}
              multiSelectProps={{
                allowCreatingNewItems: false,
                placeholder: getString('cf.featureFlags.rules.searchTargetGroups'),
                onQueryChange: query => refetchSegments(query)
              }}
              disabled={disabled}
            />
          </DisabledFeatureTooltip>
        </div>
      </Container>
    </Layout.Vertical>
  )
}

export default SpecificTargetingItem
