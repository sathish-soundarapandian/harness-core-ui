import type { MetricThresholdType } from '../MetricThresholds/MetricThresholds.types'

export interface CVPromptCheckboxProps {
  checkboxLabel?: string
  checked: boolean
  onChange?: (updatedValue: boolean, identifier?: string) => void
  checkboxName: string
  checkBoxKey?: React.Key | null
  confirmButtonText?: string
  cancelButtonText?: string
  contentText?: string
  showPromptOnUnCheck?: boolean
  filterRemovedMetricNameThresholds: (metricName: string) => void
}

export interface CommonHealthSourceProperties {
  ignoreThresholds: MetricThresholdType[]
  failFastThresholds: MetricThresholdType[]
  continuousVerification?: boolean
  metricName: string
}
