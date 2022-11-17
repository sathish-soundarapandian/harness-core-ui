/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Text } from '@harness/uicore'
import type { Color } from '@harness/design-system'
import { ColorData } from './StatusChip.constants'
import css from './StatusChip.module.scss'

export default function StatusChip({
  status,
  color,
  backgroundColor
}: {
  status: string
  color?: Color
  backgroundColor?: Color
}): JSX.Element {
  return (
    <Text
      className={css.statusButton}
      color={color}
      border={{ color: color || ColorData.color }}
      background={backgroundColor || ColorData.background}
    >
      {status}
    </Text>
  )
}
