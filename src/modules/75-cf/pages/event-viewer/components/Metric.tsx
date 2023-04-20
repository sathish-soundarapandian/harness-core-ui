/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Card, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
export interface MetricCardProps {
  label: string 
  total: number
}

export const MetricCard: React.FC<MetricCardProps> = ({ label, total }) => {
  return (
    <Card
      interactive
      elevation={1}
      data-testid="filter-card"
      style={{minWidth: 200}}
    >
      <Text
        font={{ variation: FontVariation.SMALL }}
        lineClamp={1}
        data-testid="filter-label"
      >
        {label}
      </Text>
      <Text
        font={{ variation: FontVariation.H2, weight: 'light' }}
        color={total === 0 ? Color.RED_700 : Color.GREY_700}
        data-testid="filter-total"
      >
        {total}
      </Text>
    </Card>
  )
}
