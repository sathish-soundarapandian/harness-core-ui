/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Icon, Text, PageError, PageErrorProps } from '@harness/uicore'
import { Classes } from '@blueprintjs/core'
import cx from 'classnames'
import { TableFilter, TableFilterProps } from '@cv/components/TableFilter/TableFilter'
import GroupedSideNav from './components/GroupedSideNav/GroupedSideNav'
import type { GroupedCreatedMetrics } from './components/GroupedSideNav/GroupedSideNav.types'
import { LoadingCells } from './CommonSelectedAppsSideNav.constants'
import css from './CommonSelectedAppsSideNav.module.scss'

export interface CommonSelectedAppsSideNavProps {
  selectedMetrics?: string[]
  loading?: boolean
  error?: PageErrorProps
  filterProps?: TableFilterProps
  headerText?: string
  selectedItem?: string
  onRemoveItem?: (removedItem: string, index: number) => void
  onSelect?: (selectedMetric: string, index: number) => void
  groupedSelectedApps?: GroupedCreatedMetrics
  isMetricThresholdEnabled?: boolean
  openEditMetricModal: () => void
  isValidInput?: boolean
}

export function CommonSelectedAppsSideNav(props: CommonSelectedAppsSideNavProps): JSX.Element {
  const {
    selectedMetrics,
    groupedSelectedApps,
    loading,
    filterProps,
    error,
    headerText,
    onSelect,
    selectedItem,
    onRemoveItem,
    isMetricThresholdEnabled,
    openEditMetricModal,
    isValidInput
  } = props
  let content = null

  if (error?.message) {
    content = <PageError {...error} />
  } else if (loading) {
    content = LoadingCells.map(loadingCell => (
      <Container key={loadingCell} className={css.seletedAppContainer}>
        <Container className={cx(Classes.SKELETON, css.selectedApp)} height={16} width="100%" />
      </Container>
    ))
  } else {
    content = selectedMetrics?.map((selectedApp, index) => {
      return (
        <Container key={selectedApp} className={css.seletedAppContainer} onClick={() => onSelect?.(selectedApp, index)}>
          <Text
            className={cx(css.selectedApp, selectedItem && selectedApp === selectedItem ? css.isSelected : false)}
            lineClamp={1}
          >
            {selectedApp}
          </Text>

          {onRemoveItem && (
            <Icon
              name="main-delete"
              onClick={e => {
                e.stopPropagation()
                onRemoveItem(selectedApp, index)
              }}
            />
          )}
        </Container>
      )
    })
  }

  const groupedSelectedAppsList = Object.entries(groupedSelectedApps || {})

  return (
    <Container className={css.main}>
      {headerText && <Text className={css.navHeader}>{headerText}</Text>}
      {filterProps && <TableFilter {...filterProps} />}
      {groupedSelectedAppsList.length ? (
        <GroupedSideNav
          onSelect={onSelect}
          selectedItem={selectedItem}
          onRemoveItem={onRemoveItem}
          groupedSelectedAppsList={groupedSelectedAppsList}
          isMetricThresholdEnabled={isMetricThresholdEnabled}
          openEditMetricModal={openEditMetricModal}
          isValidInput={isValidInput}
        />
      ) : (
        content
      )}
    </Container>
  )
}
