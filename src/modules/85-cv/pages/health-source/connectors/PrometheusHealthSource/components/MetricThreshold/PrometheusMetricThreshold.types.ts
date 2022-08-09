import type { SelectOption, SelectProps } from '@harness/uicore'
import type { GroupedCreatedMetrics } from '@cv/pages/health-source/common/CustomMetric/CustomMetric.types'
import type { MapPrometheusQueryToService } from '../../PrometheusHealthSource.constants'
import type { MetricThresholdsState } from '../../PrometheusHealthSource.types'

export interface SelectItem {
  label: string
  value: string
}

export interface PrometheusMetricThresholdPropsType {
  formikValues: MapPrometheusQueryToService
  groupedCreatedMetrics: GroupedCreatedMetrics
  setMetricThresholds: React.Dispatch<React.SetStateAction<MetricThresholdsState>>
}

export type ThresholdSelectProps = {
  name: string
  items: SelectItem[]
  onChange?: (value: SelectOption) => void
  key?: string
  disabled?: boolean
  className?: string
} & SelectProps

export interface ThresholdCriteriaPropsType {
  criteriaType: string | null
  index: number
  thresholdTypeName: string
  replaceFn: (value: any) => void
  criteriaPercentageType?: string
}

export type PrometheusMetricThresholdContextType = PrometheusMetricThresholdPropsType
