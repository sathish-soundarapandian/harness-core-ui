import type { SelectOption } from '@harness/uicore'
import type { AnalysisDTO, Slidto, useGetMetricPacks } from 'services/cv'

export interface CommonCustomMetricsType {
  metricName: string
  identifier: string
  groupName?: SelectOption
  sli?: Slidto
  analysis?: AnalysisDTO
}

export interface CommonCustomMetricPropertyType {
  customMetrics: CommonCustomMetricsType[]
  selectedCustomMetricIndex: number
}

export interface GroupedMetric {
  groupName?: SelectOption
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
