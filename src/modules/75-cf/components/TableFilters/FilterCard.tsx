/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Card, FontVariation, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { FilterProps } from './TableFilters'
export interface FilterCardProps {
  filter: FilterProps
  selected: boolean
  filterTotalColor?: Color
  updateTableFilter: (filter: FilterProps | Record<string, any>) => void
}

export const FilterCard: React.FC<FilterCardProps> = ({ filter, selected, updateTableFilter }) => {
  const { getString } = useStrings()
  return (
    <Card
      interactive
      elevation={1}
      onClick={() => updateTableFilter(!selected ? filter : {})}
      selected={selected}
      data-testid="filter-card"
    >
      <Text
        font={{ variation: FontVariation.SMALL }}
        lineClamp={1}
        tooltipProps={{ dataTooltipId: filter.tooltipId }}
        data-testid="filter-label"
      >
        {getString(filter.label)}
      </Text>
      <Text
        font={{ variation: FontVariation.H2, weight: 'light' }}
        color={filter.filterTotalColor || Color.GREY_700}
        data-testid="filter-total"
      >
        {filter.total}
      </Text>
    </Card>
  )
}
