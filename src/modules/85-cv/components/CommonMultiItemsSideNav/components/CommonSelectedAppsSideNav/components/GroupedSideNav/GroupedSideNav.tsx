/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback } from 'react'
import { useFormikContext } from 'formik'
import { Color } from '@harness/design-system'
import cx from 'classnames'
import { CollapseList, CollapseListPanel, Container, Icon, Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { isGivenMetricNameContainsThresholds } from '@cv/pages/health-source/common/MetricThresholds/MetricThresholds.utils'
import type {
  MetricThresholdType,
  ThresholdsPropertyNames
} from '@cv/pages/health-source/common/MetricThresholds/MetricThresholds.types'
import MetricMenu from './components/MetricMenu'
import type { GroupedMetric } from './GroupedSideNav.types'
import css from '../../CommonSelectedAppsSideNav.module.scss'

interface GroupedSideNavInterface {
  onSelect?: (selectedMetric: string, index: number) => void
  selectedItem?: string
  onRemoveItem?: (removedItem: string, index: number) => void
  groupedSelectedAppsList: [string, GroupedMetric[]][]
  isMetricThresholdEnabled?: boolean
  openEditMetricModal: () => void
  isValidInput?: boolean
}
export default function GroupedSideNav({
  groupedSelectedAppsList,
  selectedItem,
  onRemoveItem,
  onSelect,
  isMetricThresholdEnabled,
  openEditMetricModal,
  isValidInput
}: GroupedSideNavInterface): JSX.Element {
  const { getString } = useStrings()
  const { values: formValues } = useFormikContext()

  const getShowPromptOnDelete = (metricName?: string): boolean => {
    return Boolean(
      metricName &&
        isMetricThresholdEnabled &&
        isGivenMetricNameContainsThresholds(
          formValues as Record<ThresholdsPropertyNames, MetricThresholdType[]>,
          metricName
        )
    )
  }

  const handleOnDelete = useCallback(
    (selectedMetric, index) => {
      if (selectedMetric && onRemoveItem) {
        onRemoveItem(selectedMetric, index as number)
      }
    },
    [onRemoveItem]
  )

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
                  <Text
                    className={cx(css.selectedApp, css.collapseHeading)}
                    color={Color.GREY_900}
                    font={{ weight: 'semi-bold', size: 'normal' }}
                  >
                    {label || getString('cv.addGroupName')}
                  </Text>
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
                    className={css.seletedAppContainer}
                    onClick={() => {
                      onSelect?.(selectedApp?.metricName || '', selectedApp.index as number)
                    }}
                    data-testid={`sideNav-${selectedApp.metricName}`}
                  >
                    <Text
                      className={cx(
                        css.selectedApp,
                        selectedItem && selectedApp.metricName === selectedItem ? css.isSelected : false
                      )}
                      lineClamp={1}
                    >
                      {selectedApp.metricName}
                    </Text>
                    <Container>
                      {!isValidInput ? <Icon name="warning-icon" size={18} color={Color.ORANGE_700} /> : null}
                      <MetricMenu
                        onEdit={openEditMetricModal}
                        onDelete={handleOnDelete}
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
                        showPromptOnDelete={getShowPromptOnDelete(selectedApp.metricName)}
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
