/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { FontVariation, Color } from '@harness/design-system'
import { Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import css from '../../ExecutionList.module.scss'
interface TargetGroupItemProps {
  getVariationColorByName: (variationName: string) => string
  targetSegments: string[]
  variation: string
}

const TargetGroupItem: React.FC<TargetGroupItemProps> = ({ targetSegments, getVariationColorByName, variation }) => {
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
        data-testid="target-group-variation"
      >
        {variation}
      </Text>

      <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_900}>
        {getString('cf.featureFlags.flagPipeline.to')}
      </Text>
      <Text font={{ variation: FontVariation.SMALL_BOLD }} color={Color.GREY_900} data-testid={`target-group`}>
        {targetSegments.map(targetSegment => targetSegment).join(', ')}
      </Text>
    </span>
  )
}

export default TargetGroupItem
