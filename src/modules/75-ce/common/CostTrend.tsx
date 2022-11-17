/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { IconName, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'

interface TrendProps {
  value: number
  downIcon?: string
  upIcon?: string
  iconSize?: number
  flipColors?: boolean
  defaultIcon?: string
}

const CostTrend = (props: TrendProps) => {
  const {
    iconSize = 16,
    value = 0,
    downIcon = 'caret-down',
    upIcon = 'caret-up',
    flipColors,
    defaultIcon = 'caret-up'
  } = props

  const v = +value
  let icon: Record<string, string | undefined> = { name: undefined, color: undefined } // when v = 0

  if (v < 0) {
    icon = { name: downIcon, color: flipColors ? Color.RED_500 : Color.GREEN_500 }
  } else if (v > 0) {
    icon = { name: upIcon, color: flipColors ? Color.GREEN_500 : Color.RED_500 }
  }

  return (
    <Text
      font={{ variation: FontVariation.SMALL_SEMI }}
      color={v ? Color.GREY_700 : Color.GREY_400}
      inline
      icon={(icon.name || defaultIcon) as IconName}
      iconProps={{ size: iconSize, color: icon.color || Color.GREEN_500 }}
    >
      {v ? `${Math.abs(v)}%` : 'NA%'}
    </Text>
  )
}

export default CostTrend
