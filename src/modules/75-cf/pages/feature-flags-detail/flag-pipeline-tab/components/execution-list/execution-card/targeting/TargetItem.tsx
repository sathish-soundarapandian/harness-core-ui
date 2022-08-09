/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { FontVariation, Color } from '@harness/design-system'
import { Text } from '@harness/uicore'
import React from 'react'
import { useStrings } from 'framework/strings'
import type { TargetMap } from 'services/cf'
import css from '../../ExecutionList.module.scss'

interface TargetItemProps {
  getVariationColorByName: (variationName: string) => string
  targets: TargetMap[]
  variation: string
}

const TargetItem: React.FC<TargetItemProps> = ({ targets, variation, getVariationColorByName }) => {
  const { getString } = useStrings()

  return (
    <span className={css.targetingItem}>
      <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_900}>
        {getString('cf.pipeline.flagConfiguration.serve')}
      </Text>
      <Text
        icon="full-circle"
        iconProps={{
          size: 12,
          style: {
            color: getVariationColorByName(variation)
          }
        }}
        font={{ variation: FontVariation.SMALL_BOLD }}
        color={Color.GREY_900}
        data-testid="target-variation"
      >
        {variation}
      </Text>

      <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_900}>
        {getString('cf.featureFlags.flagPipeline.to')}
      </Text>
      <Text font={{ variation: FontVariation.SMALL_BOLD }} color={Color.GREY_900} data-testid="target">
        {targets.map(target => target.name).join(', ')}
      </Text>
    </span>
  )
}

export default TargetItem
