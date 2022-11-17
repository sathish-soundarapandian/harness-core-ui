import type { SelectOption } from '@harness/uicore'
import type {
  CloudWatchMetricDefinition,
  DynatraceMetricDefinition,
  useGetRiskCategoryForCustomHealthMetric
} from 'services/cv'
import type { MetricThresholdType } from '../MetricThresholds/MetricThresholds.types'

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
  ignoreThresholds: MetricThresholdType[]
  failFastThresholds: MetricThresholdType[]
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
  riskProfileResponse: ReturnType<typeof useGetRiskCategoryForCustomHealthMetric>
  isTemplate?: boolean
  expressions?: string[]
  isConnectorRuntimeOrExpression?: boolean
}

export interface FilterMetricThresholdsParamsType {
  isMetricThresholdEnabled: boolean
  customMetricNameToRemove: string
  metricThresholdsToFilter: MetricThresholdType[]
}
