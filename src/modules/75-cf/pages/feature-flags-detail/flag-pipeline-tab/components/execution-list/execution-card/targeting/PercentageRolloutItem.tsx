/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Color, FontVariation } from '@harness/design-system'
import { Container, Text } from '@harness/uicore'
import React from 'react'
import useFlagVariation from '@cf/pages/feature-flags-detail/flag-pipeline-tab/hooks/useFlagVariation'
import type { Distribution, ServingRule, Variation } from 'services/cf'
import { useStrings } from 'framework/strings'
import css from '../../ExecutionList.module.scss'

interface PercentageRolloutItemProps {
  percentageRollout: ServingRule
  flagVariations: Variation[]
}

const PercentageRolloutItem: React.FC<PercentageRolloutItemProps> = ({ percentageRollout, flagVariations }) => {
  const { getString } = useStrings()

  const { getVariationNameById, getVariationColorById } = useFlagVariation({
    flagVariations
  })

  return (
    <>
      <span className={css.targetingItem}>
        <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_900} inline>
          {getString('cf.pipeline.flagConfiguration.serve')}
        </Text>
        <Text font={{ variation: FontVariation.SMALL_BOLD }} color={Color.GREY_900} inline>
          {getString('cf.featureFlags.percentageRollout')}
        </Text>
        <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_900} inline>
          {getString('cf.featureFlags.flagPipeline.to')}
        </Text>
        <Text
          font={{ variation: FontVariation.SMALL_BOLD }}
          color={Color.GREY_900}
          inline
          data-testid="percentage-rollout-group"
        >
          {percentageRollout.clauses[0].values[0]}
        </Text>
      </span>

      <Container className={css.percentageRolloutVariations}>
        <>
          {(percentageRollout.serve.distribution as Distribution).variations.map(percentageRolloutVariation => (
            <Text
              key={percentageRolloutVariation.variation}
              font={{ variation: FontVariation.SMALL }}
              color={Color.GREY_500}
              inline
              data-testid="percentage-rollout-variation-weight"
              icon="full-circle"
              iconProps={{
                size: 10,
                style: {
                  color: getVariationColorById(percentageRolloutVariation.variation)
                }
              }}
            >
              {getVariationNameById(percentageRolloutVariation.variation)} ({percentageRolloutVariation.weight}%)
            </Text>
          ))}
        </>
      </Container>
    </>
  )
}

export default PercentageRolloutItem
