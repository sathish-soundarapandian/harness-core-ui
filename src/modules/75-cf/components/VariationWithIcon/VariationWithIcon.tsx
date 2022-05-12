/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Text } from '@harness/uicore'
import type { FontSize } from '@harness/design-system'
import React from 'react'
import type { Variation } from 'services/cf'
import { CFVariationColors } from '@cf/constants'
interface VariationWithIconProps {
  variation?: Variation
  index: number
  iconStyle?: React.CSSProperties
  textElement?: React.ReactElement | string
  textStyle?: React.CSSProperties
  color?: string
  fontSize?: FontSize
}

export const VariationWithIcon: React.FC<VariationWithIconProps> = ({
  variation = {},
  index = 0,
  iconStyle,
  textElement,
  textStyle,
  color,
  fontSize = 'normal'
}) => {
  const { name, value } = variation

  return (
    <>
      <span
        style={{
          borderRadius: '50%',
          width: 12,
          height: 12,
          backgroundColor: CFVariationColors[index % CFVariationColors.length],
          display: 'inline-block',
          ...iconStyle
        }}
      ></span>
      <Text
        inline
        margin={{ bottom: 'xsmall' }}
        color={color}
        font={{ size: fontSize }}
        style={{ ...textStyle }} // will override font.size if fontSize set here
      >
        {textElement || name || value}
      </Text>
    </>
  )
}
