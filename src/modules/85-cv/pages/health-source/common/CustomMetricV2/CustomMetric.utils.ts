import type { CommonCustomMetricsType } from './CustomMetric.types'

export function getNewMetricIdentifier(
  customMetrics: CommonCustomMetricsType[],
  newMetricDefaultNameString: string
): string {
  if (!newMetricDefaultNameString || !Array.isArray(customMetrics)) {
    return ''
  }

  return `${newMetricDefaultNameString} ${customMetrics.length + 1}`
}
