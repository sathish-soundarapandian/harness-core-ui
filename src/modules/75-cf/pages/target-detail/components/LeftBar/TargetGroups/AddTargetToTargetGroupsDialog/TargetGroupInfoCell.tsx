/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC } from 'react'
import { Text } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import type { Segment } from 'services/cf'

export interface TargetGroupInfoCellProps {
  row: { original: Segment }
}

const TargetGroupInfoCell: FC<TargetGroupInfoCellProps> = ({
  row: {
    original: { name }
  }
}) => (
  <Text lineClamp={1} font={{ variation: FontVariation.BODY2 }}>
    {name}
  </Text>
)

export default TargetGroupInfoCell
