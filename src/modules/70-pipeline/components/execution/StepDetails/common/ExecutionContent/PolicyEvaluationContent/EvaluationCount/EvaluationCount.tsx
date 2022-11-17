/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { IconName, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import type { EvaluationStatus } from '../EvaluationStatusLabel/EvaluationStatusLabel'

interface IconValues {
  name: IconName
  color: Color
}

export const iconMap: Record<EvaluationStatus, IconValues> = {
  error: { name: 'warning-sign', color: Color.RED_800 },
  warning: { name: 'warning-sign', color: Color.ORANGE_800 },
  pass: { name: 'tick-circle', color: Color.GREEN_800 }
}

export function EvaluationCount({ status, count }: { status: EvaluationStatus; count: number }) {
  return count > 0 ? (
    <Text
      margin={{ right: 'small' }}
      icon={iconMap[status].name}
      iconProps={{
        color: iconMap[status].color
      }}
    >
      {count}
    </Text>
  ) : null
}
