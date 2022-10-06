/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { FontVariation } from '@harness/design-system'
import { Container, Text, Button, SelectOption } from '@harness/uicore'
import React, { ReactElement } from 'react'
import PercentageRollout from '@cf/components/PercentageRollout/PercentageRollout'
import type { Segment, Variation } from 'services/cf'
import { useStrings } from 'framework/strings'
import type { VariationPercentageRollout } from '../../types'
import { DisabledFeatureTooltip } from '../disabled-feature-tooltip/DisabledFeatureTooltip'

interface VariationPercentageRolloutProps {
  variationPercentageRollout: VariationPercentageRollout
  index: number
  initialOption: SelectOption
  disabled: boolean
  removePercentageRollout: (index: number) => void
  segments: Segment[]
  featureFlagVariations: Variation[]
}

const PercentageRolloutItem = ({
  variationPercentageRollout,
  index,
  disabled,
  removePercentageRollout,
  initialOption,
  segments,
  featureFlagVariations
}: VariationPercentageRolloutProps): ReactElement => {
  const { getString } = useStrings()

  return (
    <>
      <Container
        flex={{ justifyContent: 'space-between', alignItems: 'center' }}
        data-testid={`percentage_rollout_item_${index}`}
      >
        <Text inline font={{ variation: FontVariation.BODY }} icon="percentage">
          {getString('cf.featureFlags.percentageRollout')}
        </Text>
        <DisabledFeatureTooltip>
          <Button
            disabled={disabled}
            data-testid={`remove_percentage_rollout_${index}`}
            icon="trash"
            minimal
            withoutCurrentColor
            onClick={() => removePercentageRollout(index)}
          />
        </DisabledFeatureTooltip>
      </Container>

      <Container border={{ bottom: true }} padding={{ bottom: 'large' }}>
        <PercentageRollout
          targetGroups={segments}
          variations={featureFlagVariations}
          fieldValues={variationPercentageRollout}
          prefix={(fieldName: string) => `targetingRuleItems[${index}].${fieldName}`}
          value={initialOption}
          distributionWidth={340}
          addClearButton
          hideOverError
          hideTargetGroupDivider
          disabled={disabled}
        />
      </Container>
    </>
  )
}

export default PercentageRolloutItem
