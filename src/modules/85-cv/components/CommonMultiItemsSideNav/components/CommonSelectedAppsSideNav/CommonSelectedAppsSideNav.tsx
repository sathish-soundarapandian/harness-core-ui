/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Text } from '@harness/uicore'
import { TableFilter, TableFilterProps } from '@cv/components/TableFilter/TableFilter'
import GroupedSideNav from './components/GroupedSideNav/GroupedSideNav'
import type { GroupedCreatedMetrics } from './components/GroupedSideNav/GroupedSideNav.types'
import css from './CommonSelectedAppsSideNav.module.scss'

export interface CommonSelectedAppsSideNavProps {
  filterProps?: TableFilterProps
  headerText?: string
  selectedItem?: string
  onRemoveItem?: (removedItem: string, index: number) => void
  onSelect?: (selectedMetric: string, index: number) => void
  groupedSelectedApps?: GroupedCreatedMetrics
  openEditMetricModal: () => void
  hideDeleteIcon?: boolean
}

export function CommonSelectedAppsSideNav(props: CommonSelectedAppsSideNavProps): JSX.Element {
  const {
    onSelect,
    filterProps,
    headerText,
    selectedItem,
    onRemoveItem,
    openEditMetricModal,
    groupedSelectedApps,
    hideDeleteIcon
  } = props

  const groupedSelectedAppsList = Object.entries(groupedSelectedApps || {})

  return (
    <Container className={css.main}>
      {headerText && <Text className={css.navHeader}>{headerText}</Text>}
      {filterProps && <TableFilter {...filterProps} />}
      <Container padding={{ top: 'medium' }}>
        <GroupedSideNav
          onSelect={onSelect}
          selectedItem={selectedItem}
          onRemoveItem={onRemoveItem}
          groupedSelectedAppsList={groupedSelectedAppsList}
          openEditMetricModal={openEditMetricModal}
          hideDeleteIcon={hideDeleteIcon}
        />
      </Container>
    </Container>
  )
}
