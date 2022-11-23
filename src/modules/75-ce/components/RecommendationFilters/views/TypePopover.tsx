/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container } from '@harness/uicore'
import { Menu } from '@blueprintjs/core'
import type { FilterStatsDto, Maybe } from 'services/ce/services'
import { useStrings } from 'framework/strings'

import MenuItemWithDivider from '@ce/common/MenuItemWithDivider/MenuItemWithDivider'
import { COST_FILTER_KEYS, getFiltersLabelName, getLabelMappingForFilters } from '../constants'

import css from '../RecommendationFilters.module.scss'

interface FilterTypePopoverProps {
  filterData: Maybe<FilterStatsDto>[]
  setSelectedType: React.Dispatch<React.SetStateAction<string | undefined>>
}

const FilterTypePopover: React.FC<FilterTypePopoverProps> = ({ filterData, setSelectedType }) => {
  const { getString } = useStrings()
  const keyToLabelMapping = getLabelMappingForFilters(getString)
  const costFiltersLabels = getFiltersLabelName(getString)
  return (
    <Container className={css.popoverContainer}>
      <Menu>
        <MenuItemWithDivider text={getString('common.resourceTypeLabel')} />
        {filterData.map(filter => {
          return filter?.key ? (
            <Menu.Item
              key={filter.key}
              className={css.menuItem}
              onClick={() => setSelectedType(`${filter.key}s`)}
              shouldDismissPopover={false}
              text={keyToLabelMapping[filter.key]}
            />
          ) : null
        })}
        <Menu.Divider />

        {COST_FILTER_KEYS.map(filter => {
          return (
            <Menu.Item
              key={filter}
              className={css.menuItem}
              onClick={() => setSelectedType(filter)}
              shouldDismissPopover={false}
              text={costFiltersLabels[filter]}
            />
          )
        })}
      </Menu>
    </Container>
  )
}

export default FilterTypePopover
