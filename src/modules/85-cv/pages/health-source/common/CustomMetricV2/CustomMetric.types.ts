import type { SelectOption } from '@harness/uicore'
import type { CloudWatchMetricDefinition, DynatraceMetricDefinition, useGetMetricPacks } from 'services/cv'

// For all Health sources, their custom metric types will be added here like "CloudWatchMetricDefinition | AppDMetricDefinition |..."
type CombinedMetricDefinitionsOfHealthSources = CloudWatchMetricDefinition | DynatraceMetricDefinition

export type FormikRiskProfileType = {
  category?: string
}

export type FormikAnalysisType = {
  riskProfile?: FormikRiskProfileType
  higherBaselineDeviation?: boolean
  lowerBaselineDeviation?: boolean
}

export type CommonCustomMetricsType = CombinedMetricDefinitionsOfHealthSources & {
  groupName?: SelectOption | string
  analysis?: FormikAnalysisType
}

export interface CommonCustomMetricPropertyType {
  customMetrics: CommonCustomMetricsType[]
  selectedCustomMetricIndex: number
}

export interface GroupedMetric {
  groupName?: SelectOption | string
  metricName?: string
  index?: number
  continuousVerification?: boolean
}

export interface GroupedCreatedMetrics {
  [Key: string]: GroupedMetric[]
}

export interface CustomMetricsV2HelperContextType {
  groupedCreatedMetrics: GroupedCreatedMetrics
  metricPacksResponse: ReturnType<typeof useGetMetricPacks>
}
