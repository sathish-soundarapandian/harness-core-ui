import type { SelectOption } from '@harness/uicore'
import type {
  CloudWatchMetricDefinition,
  CloudWatchMetricsHealthSourceSpec,
  ResponseMap,
  TimeSeriesMetricPackDTO
} from 'services/cv'
import type { GroupedCreatedMetrics } from '../../common/CustomMetricV2/CustomMetric.types'
import type { AvailableThresholdTypes, MetricThresholdType } from '../../common/MetricThresholds/MetricThresholds.types'
import type { UpdatedHealthSource } from '../../HealthSourceDrawer/HealthSourceDrawerContent.types'

export type FormikRiskProfileType = {
  riskCategory?: string
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
  ignoreThresholds: MetricThresholdType[]
  failFastThresholds: MetricThresholdType[]
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
  connectorRef?: string | { value: string }
  healthSourceList: HealthSourceListData[]
}

export interface CreatePayloadUtilParams {
  setupSourceData: CloudWatchSetupSource
  formikValues: CloudWatchFormType
  isMetricThresholdEnabled?: boolean
}

export interface CloudWatchProps {
  data: CloudWatchSetupSource
  onSubmit: (data: CloudWatchSetupSource, healthSourceList: UpdatedHealthSource) => Promise<void>
  isTemplate?: boolean
  expressions?: string[]
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

export interface IsMultiRecordDataErrorParameters {
  expression?: string
  isQueryExectuted?: boolean
  loading: boolean
  isDataPressent: boolean
  isMultipleSampleData: boolean
  isUpdatedExpression: boolean
}

export interface MetricThresholdCommonProps {
  formikValues: CloudWatchFormType
  groupedCreatedMetrics: GroupedCreatedMetrics
}

export interface MetricThresholdsForFormParams {
  metricThresholds?: TimeSeriesMetricPackDTO[]
  thresholdType?: AvailableThresholdTypes
  isMetricThresholdEnabled?: boolean
}
