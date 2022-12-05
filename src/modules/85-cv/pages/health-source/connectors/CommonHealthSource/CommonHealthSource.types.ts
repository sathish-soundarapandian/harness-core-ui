/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SelectOption } from '@harness/uicore'
import type {
  FailMetricThresholdSpec,
  MetricThreshold,
  MetricThresholdSpec,
  TimeSeriesMetricPackDTO
} from 'services/cv'
import type { CustomSelectedAndMappedMetrics } from '../../common/CommonCustomMetric/CommonCustomMetric.types'
import type { CriteriaPercentageType } from '../../common/MetricThresholds/MetricThresholds.types'
import type { HealthSourceTypes } from '../../types'

export interface HealthSourcesConfig {
  [x: string]: HealthSourceConfig
}

export interface HealthSourceConfig {
  customMetrics: {
    enabled: boolean
  }
  sideNav: {
    shouldBeAbleToDeleteLastMetric: boolean
    enableDefaultGroupName?: boolean
  }
}

export interface HealthSourceSetupSource {
  isEdit: boolean
  mappedServicesAndEnvs: Map<string, CommonHealthSourceFormikInterface>
  healthSourceIdentifier: string
  healthSourceName: string
  product: SelectOption
  connectorRef?: { value: string } | string
  ignoreThresholds: HealthSourceMetricThresholdType[]
  failFastThresholds: HealthSourceMetricThresholdType[]
  region?: string
  dataSourceType?: string
  workspaceId?: string
}

export interface HealthSourceInitialData {
  // Fields coming from define health source screen
  name: string
  identifier: string
  connectorRef: { connector: { identifier: string }; value: string }
  product: string
  type: HealthSourceTypes

  // Won't be passed in backend , will be used in UI layer
  isEdit: boolean

  // Configurations Page
  applicationName?: string
  tierName?: string
  region?: string
  index?: string
  metricPacks?: TimeSeriesMetricPackDTO[]

  // Won't be passed in backend , will be used in UI layer
  showCustomMetric?: boolean

  // Custom Metric section
  mappedServicesAndEnvs: Map<string, CommonHealthSourceFormikInterface>
}

export interface CommonHealthSourceFormikInterface {
  identifier: string
  metricName: string
  groupName: SelectOption | string

  // Define Query
  isManualQuery: boolean
  query: string
  logIndexes?: string

  // metric Chart Mapping
  metricJsonPath?: string
  timestampJsonPath?: string
  timestampFormat?: string

  //field Mappings
  serviceInstance?: string
  identifyMessage?: string

  // Assign
  sli?: boolean
  continuousVerification?: boolean
  healthScore?: boolean

  // Risk
  riskCategory?: string

  // Deviation compare to baseline
  lowerBaselineDeviation?: boolean
  higherBaselineDeviation?: boolean

  //Map service instance identifier
  serviceInstanceRisk?: string | SelectOption

  // metric thresholds
  ignoreThresholds: HealthSourceMetricThresholdType[]
  failFastThresholds: HealthSourceMetricThresholdType[]
}

export interface PersistMappedMetricsType {
  mappedMetrics: Map<string, CommonHealthSourceFormikInterface>
  selectedMetric: string
  metricThresholds: MetricThresholdsState
  formikValues: CommonHealthSourceFormikInterface
  setMappedMetrics: React.Dispatch<React.SetStateAction<CustomSelectedAndMappedMetrics>>
}

export const CommonHealthSourceFieldNames = {
  METRIC_NAME: 'metricName',
  METRIC_IDENTIFIER: 'identifier',
  GROUP_NAME: 'groupName',

  SLI: 'sli',
  HEALTH_SCORE: 'healthScore',
  CONTINUOUS_VERIFICATION: 'continuousVerification',

  RISK_CATEGORY: 'riskCategory',
  HIGHER_BASELINE_DEVIATION: 'higherBaselineDeviation',
  LOWER_BASELINE_DEVIATION: 'lowerBaselineDeviation',

  BASE_URL: 'baseURL',
  PATH: 'pathURL',

  QUERY: 'query',
  QUERY_TYPE: 'queryType',
  REQUEST_METHOD: 'requestMethod',

  METRIC_VALUE: 'metricValue',
  TIMESTAMP_LOCATOR: 'timestamp',
  TIMESTAMP_FORMAT: 'timestampFormat',
  SERVICE_INSTANCE: 'serviceInstanceIdentifier'
}

// Metric Thresholds
export interface MetricThresholdsState {
  ignoreThresholds: HealthSourceMetricThresholdType[]
  failFastThresholds: HealthSourceMetricThresholdType[]
}

export type HealthSourceMetricThresholdType = Omit<MetricThreshold, 'groupName'> & {
  criteria: MetricThreshold['criteria'] & CriteriaPercentageType
  metricType?: string
  spec?: MetricThresholdSpec & FailMetricThresholdSpec
}
