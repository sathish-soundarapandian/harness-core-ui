/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useFormikContext } from 'formik'
import { Color } from '@harness/design-system'
import cx from 'classnames'
import { CollapseList, CollapseListPanel, Container, Icon, Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import MetricMenu from './components/MetricMenu'
import type { GroupedMetric } from './GroupedSideNav.types'
import { showWarningIcon } from './GroupedSideNav.utils'
import css from '../../CommonSelectedAppsSideNav.module.scss'

interface GroupedSideNavInterface {
  onSelect?: (selectedMetric: string, index: number) => void
  selectedItem?: string
  onRemoveItem?: (removedItem: string, index: number) => void
  groupedSelectedAppsList: [string, GroupedMetric[]][]
  openEditMetricModal: () => void
  hideDeleteIcon?: boolean
}
export default function GroupedSideNav({
  groupedSelectedAppsList,
  selectedItem,
  onRemoveItem,
  onSelect,
  openEditMetricModal,
  hideDeleteIcon
}: GroupedSideNavInterface): JSX.Element {
  const { getString } = useStrings()
  const { touched, isValid } = useFormikContext()

  return (
    <>
      {groupedSelectedAppsList.map(groupItem => {
        const [label, items] = groupItem
        if (!groupItem || !label) {
          return <></>
        }

        return (
          <CollapseList key={`${label}-${items.length}`} defaultOpenIndex={0}>
            <CollapseListPanel
              collapseHeaderProps={{
                heading: (
                  <Container className={css.groupContainer}>
                    <Text className={css.groupName}>{label || getString('cv.addGroupName')}</Text>
                  </Container>
                ),
                collapsedIcon: 'main-chevron-right',
                expandedIcon: 'main-chevron-down'
              }}
              key={label}
              className={css.collapsePanel}
            >
              {items?.map(selectedApp => {
                return (
                  <Container
                    key={selectedApp.metricName}
                    className={cx(
                      css.selectedAppContainer,
                      selectedItem && selectedApp.metricName === selectedItem ? css.isSelected : false
                    )}
                    onClick={() => {
                      onSelect?.(selectedApp?.metricName || '', selectedApp.index as number)
                    }}
                    data-testid={`sideNav-${selectedApp.metricName}`}
                  >
                    <Text className={css.metricName} lineClamp={1}>
                      {selectedApp.metricName}
                    </Text>
                    <Container>
                      {showWarningIcon({ touched, isValid, selectedApp, selectedItem }) ? (
                        <Icon name="warning-icon" size={18} color={Color.ORANGE_700} />
                      ) : null}
                      <MetricMenu
                        onEdit={openEditMetricModal}
                        onDelete={onRemoveItem}
                        titleText={getString('common.delete', { name: selectedApp?.metricName })}
                        contentText={getString('cv.monitoringSources.commonHealthSource.confirmDeleteMetric', {
                          name: selectedApp?.metricName
                        })}
                        confirmButtonText={getString('yes')}
                        deleteLabel={getString('rbac.permissionLabels.delete')}
                        editLabel={getString('rbac.permissionLabels.edit')}
                        itemName={selectedApp.metricName as string}
                        index={selectedApp.index as number}
                        metricThresholdTitleText={getString('common.warning')}
                        metricThresholdWarningContentText={getString(
                          'cv.metricThresholds.customMetricsDeletePromptContent'
                        )}
                        hideDeleteIcon={hideDeleteIcon}
                      />
                    </Container>
                  </Container>
                )
              })}
            </CollapseListPanel>
          </CollapseList>
        )
      })}
    </>
  )
}
