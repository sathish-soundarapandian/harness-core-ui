import type { SelectOption } from '@harness/uicore'
import type { CloudWatchMetricDefinition, CloudWatchMetricsHealthSourceSpec, ResponseMap } from 'services/cv'

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
  sourceType?: string
  healthSourceName: string
  product: SelectOption
  connectorRef?: string
  healthSourceList: HealthSourceListData[]
}

export interface CreatePayloadUtilParams {
  setupSourceData: CloudWatchSetupSource
  formikValues: CloudWatchFormType
}

export interface MetricSamplePointsResult {
  Id: string
  Label: string
  StatusCode: string
  Timestamps: number[]
  Values: number[]
}

export interface MetricSamplePointsData {
  Messages: string[]
  MetricDataResults: MetricSamplePointsResult[]
}

export type SampleDataType = MetricSamplePointsData & ResponseMap['data']

export interface MetricSamplePoints {
  data: MetricSamplePointsData
}
