/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { cloneDeep, isEmpty } from 'lodash-es'
import type { GroupedCreatedMetrics } from './components/SelectedAppsSideNav/components/GroupedSideNav/GroupedSideNav.types'
import type { MultiItemsSideNavProps } from './MultiItemsSideNav'

interface OnRemoveGroupAndItemInterface {
  removedItem: string
  index: number
  setCreatedMetrics: (value: React.SetStateAction<string[]>) => void
  groupedCreatedMetrics?: GroupedCreatedMetrics
  setSelectedMetric: (value: React.SetStateAction<string | undefined>) => void
  onRemoveMetric: MultiItemsSideNavProps['onRemoveMetric']
}

export const onRemoveGroupAndItem = ({
  removedItem,
  index,
  setCreatedMetrics,
  groupedCreatedMetrics,
  setSelectedMetric,
  onRemoveMetric
}: OnRemoveGroupAndItemInterface): any => {
  setCreatedMetrics(oldMetrics => {
    if (groupedCreatedMetrics) {
      const copyMetric = Object.values(groupedCreatedMetrics).map(item => item[0].metricName || '')

      copyMetric.splice(index, 1)
      const updateIndex = index === 0 ? 0 : index - 1
      const updatedMetric = copyMetric[updateIndex] || ''
      setSelectedMetric(updatedMetric)
      onRemoveMetric(removedItem, updatedMetric, [...copyMetric], updateIndex)
      return [...copyMetric]
    } else {
      oldMetrics?.splice(index, 1)
      const updateIndex = index === 0 ? 0 : index - 1
      const updatedMetric = oldMetrics[updateIndex]
      setSelectedMetric(updatedMetric)
      onRemoveMetric(removedItem, updatedMetric, [...oldMetrics], updateIndex)
      return [...oldMetrics]
    }
  })
}

export const getCreatedMetricLength = (
  createdMetrics: string[],
  groupedCreatedMetrics?: GroupedCreatedMetrics
): number => {
  return groupedCreatedMetrics && Object.keys(groupedCreatedMetrics).length > 1
    ? Object.keys(groupedCreatedMetrics || {}).length
    : createdMetrics.length
}

export const getSelectedMetricIndex = (
  createdMetrics: string[],
  selectedMetric?: string,
  renamedMetric?: string
): number => {
  let selectedMetricIndex = -1
  if (renamedMetric && renamedMetric === selectedMetric) {
    return selectedMetricIndex
  }

  for (let metricIndex = 0; metricIndex < createdMetrics.length; metricIndex++) {
    const metric = createdMetrics[metricIndex]
    if (metric === renamedMetric) {
      // duplicate metric found so skip updating
      return selectedMetricIndex
    }
    if (selectedMetric === metric) {
      selectedMetricIndex = metricIndex
    }
  }
  return selectedMetricIndex
}

export const getFilteredGroupedCreatedMetric = (
  filteredGroupMetric?: GroupedCreatedMetrics,
  filter?: string
): GroupedCreatedMetrics => {
  const cloneFilteredGroupMetric = cloneDeep(filteredGroupMetric || {})
  if (filter && !isEmpty(cloneFilteredGroupMetric)) {
    const entryFilteredGroupMetric = Object.entries(cloneFilteredGroupMetric)
    entryFilteredGroupMetric?.forEach(groupItem => {
      const [label, items] = groupItem
      const filteredMetric = items?.filter(metric =>
        metric?.metricName?.toLocaleLowerCase()?.includes(filter?.toLocaleLowerCase())
      )
      cloneFilteredGroupMetric[label] = filteredMetric
    })
  }
  return cloneFilteredGroupMetric
}
