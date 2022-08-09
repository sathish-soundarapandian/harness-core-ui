/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { GroupedCreatedMetrics } from '@cv/pages/health-source/common/CustomMetric/CustomMetric.types'
import { getCustomMetricGroupNames } from '@cv/pages/health-source/common/MetricThresholds/MetricThresholds.utils'
import type { MetricPackDTO } from 'services/cv'
import type { SelectItem } from '../../../AppDMetricThreshold.types'
import { CustomMetricDropdownOption, MetricTypeValues } from '../../../AppDMetricThresholdConstants'

export function getMetricTypeItems(
  metricPacks: MetricPackDTO[],
  metricData: Record<string, boolean>,
  groupedCreatedMetrics: GroupedCreatedMetrics
): SelectItem[] {
  if (!metricPacks || !metricPacks.length) return []

  const options: SelectItem[] = []

  metricPacks.forEach(metricPack => {
    // Adding only the Metric type options which are checked in metric packs
    if (metricData[metricPack.identifier as string]) {
      options.push({
        label: metricPack.identifier as string,
        value: metricPack.identifier as string
      })
    }
  })

  // Adding Custom metric option only if there are any custom metric is present
  const isCustomMetricPresent = Boolean(getCustomMetricGroupNames(groupedCreatedMetrics).length)

  if (isCustomMetricPresent) {
    options.push(CustomMetricDropdownOption)
  }

  return options
}

function getMetricsNameOptionsFromGroupName(
  selectedGroup: string,
  groupedCreatedMetrics: GroupedCreatedMetrics
): SelectItem[] {
  const selectedGroupDetails = groupedCreatedMetrics[selectedGroup]

  if (!selectedGroupDetails) {
    return []
  }

  return selectedGroupDetails.map(selectedGroupDetail => {
    return {
      label: selectedGroupDetail.metricName as string,
      value: selectedGroupDetail.metricName as string
    }
  })
}

export function getMetricItems(
  metricPacks: MetricPackDTO[],
  selectedMetricType?: string,
  selectedGroup?: string,
  groupedCreatedMetrics?: GroupedCreatedMetrics
): SelectItem[] {
  if (selectedMetricType === MetricTypeValues.Custom) {
    if (!selectedGroup || !groupedCreatedMetrics) {
      return []
    }

    return getMetricsNameOptionsFromGroupName(selectedGroup, groupedCreatedMetrics)
  }

  const selectedMetricPackDetails = metricPacks.find(metricPack => metricPack.identifier === selectedMetricType)

  return (
    selectedMetricPackDetails?.metrics?.map(metric => {
      return { label: metric.name as string, value: metric.name as string }
    }) || []
  )
}

export function getDefaultMetricTypeValue(
  metricData: Record<string, boolean>,
  metricPacks?: MetricPackDTO[]
): string | undefined {
  if (!metricData || !metricPacks || !metricPacks.length) {
    return undefined
  }
  if (metricData[MetricTypeValues.Performance]) {
    return MetricTypeValues.Performance
  } else if (metricData[MetricTypeValues.Errors]) {
    return MetricTypeValues.Errors
  }

  return undefined
}
