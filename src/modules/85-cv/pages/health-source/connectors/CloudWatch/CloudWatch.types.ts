import type { SelectOption } from '@harness/uicore'
import type { AnalysisDTO, Slidto } from 'services/cv'

export interface CloudWatchFormCustomMetricType {
  metricName: string
  identifier: string
  groupName?: SelectOption
  expression?: string
  sli?: Slidto
  analysis?: AnalysisDTO
}

export interface CloudWatchFormType {
  region: string
  customMetrics: CloudWatchFormCustomMetricType[]
  selectedCustomMetricIndex: number
}

// 🚨 Add types from swagger
export interface HealthSourceSpec {
  region: string
  metricDefinitions: CloudWatchFormCustomMetricType[]
}

// 🚨 Add types from swagger
export interface HealthSourceListData {
  identifier: string
  name: string
  spec: HealthSourceSpec
  type: string
}

// 🚨 Add types from swagger
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
