import type { SelectOption } from '@harness/uicore'
import type { CloudWatchMetricDefinition, CloudWatchMetricsHealthSourceSpec } from 'services/cv'

// export interface CloudWatchFormCustomMetricType {
//   metricName: string
//   identifier: string
//   groupName?: SelectOption
//   expression?: string
//   sli?: Slidto
//   analysis?: AnalysisDTO
// }

export type CloudWatchFormCustomMetricType = CloudWatchMetricDefinition & {
  groupName?: SelectOption
}

export interface CloudWatchFormType {
  region: string
  customMetrics: CloudWatchFormCustomMetricType[]
  selectedCustomMetricIndex: number
}

export interface HealthSourceListData {
  identifier: string
  name: string
  spec: CloudWatchMetricsHealthSourceSpec
  type: string
}

export interface CloudWatchSetupSource {
  isEdit: boolean
  healthSourceIdentifier: string
  healthSourceName: string
  product: SelectOption
  connectorRef?: string
  healthSourceList: HealthSourceListData[]
}

export interface CreatePayloadUtilParams {
  setupSourceData: CloudWatchSetupSource
  formikValues: CloudWatchFormType
}
