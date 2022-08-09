import type { GroupedCreatedMetrics } from '@cv/pages/health-source/common/CustomMetric/CustomMetric.types'
import { getCustomMetricGroupNames } from '@cv/pages/health-source/common/MetricThresholds/MetricThresholds.utils'
import type { SelectItem } from '../../../PrometheusMetricThreshold.types'
import { CustomMetricDropdownOption } from '../../../PrometheusMetricThresholdConstants'

export function getMetricTypeItems(groupedCreatedMetrics: GroupedCreatedMetrics): SelectItem[] {
  // Adding Custom metric option only if there are any custom metric is present
  const isCustomMetricPresent = Boolean(getCustomMetricGroupNames(groupedCreatedMetrics).length)

  if (isCustomMetricPresent) {
    return [CustomMetricDropdownOption]
  }

  return []
}

function getAllMetricsNameOptions(groupedCreatedMetrics: GroupedCreatedMetrics): SelectItem[] {
  const groups = Object.keys(groupedCreatedMetrics)

  if (!groups.length) {
    return []
  }

  const options: SelectItem[] = []

  groups.forEach(group => {
    const groupDetails = groupedCreatedMetrics[group]
    const metricNameOptions = groupDetails.map(groupDetail => {
      return {
        label: groupDetail.metricName as string,
        value: groupDetail.metricName as string
      }
    })

    options.push(...metricNameOptions)
  })

  return options
}

export function getMetricItems(groupedCreatedMetrics: GroupedCreatedMetrics): SelectItem[] {
  return getAllMetricsNameOptions(groupedCreatedMetrics)
}
