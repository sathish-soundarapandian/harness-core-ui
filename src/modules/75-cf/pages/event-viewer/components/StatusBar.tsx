/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Text, FontVariation, ExpandingSearchInput, Icon } from '@harness/uicore'
export interface StatusBarProps {
  totalResults: number
  totalVisibleResults: number
  onFilter: (keywords: string) => void
}
import css from '../FeatureFlagsEventViewer.module.scss'

export const StatusBar: React.FC<StatusBarProps> = ({ totalResults, totalVisibleResults, onFilter }) => {
  return (
    <div className={css.statusBar}>
      <Text
        font={{ variation: FontVariation.SMALL }}
        lineClamp={1}
        data-testid="total-events-label"
      >
        {totalResults} Total Events
        {totalResults != totalVisibleResults ? ` | ${totalVisibleResults} Total Filtered Events` : ''}
        {' '}| <span className={css.pill}>Stream Connected <Icon name="tick"/></span>
      </Text>
      <ExpandingSearchInput
        alwaysExpanded
        name="filterResults"
        placeholder="Filter results"
        onChange={onFilter}
        defaultValue=""
      />
    </div>
  )
} 