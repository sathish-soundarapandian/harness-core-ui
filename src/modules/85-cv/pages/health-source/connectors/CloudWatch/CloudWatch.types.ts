import type { SelectOption } from '@harness/uicore'
import type { CloudWatchMetricDefinition, CloudWatchMetricsHealthSourceSpec, ResponseMap } from 'services/cv'
import type { UpdatedHealthSource } from '../../HealthSourceDrawer/HealthSourceDrawerContent.types'

export type FormikRiskProfileType = {
  category?: string
}

export type FormikAnalysisType = {
  riskProfile?: FormikRiskProfileType
  higherBaselineDeviation?: boolean
  lowerBaselineDeviation?: boolean
}

export type CloudWatchFormCustomMetricType = CloudWatchMetricDefinition & {
  groupName?: SelectOption
  analysis?: FormikAnalysisType
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

export interface CloudWatchProps {
  data: CloudWatchSetupSource
  onSubmit: (data: CloudWatchSetupSource, healthSourceList: UpdatedHealthSource) => Promise<void>
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
