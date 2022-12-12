/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SelectOption } from '@harness/uicore'
import type { FailMetricThresholdSpec, MetricThreshold, MetricThresholdSpec } from 'services/cv'
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
  healthSourceIdentifier: string
  healthSourceName: string
  product: SelectOption
  connectorRef?: { value: string } | string
  region?: string
  dataSourceType?: string
  workspaceId?: string

  // Custom metrics section
  mappedServicesAndEnvs: Map<string, CommonCustomMetricFormikInterface>
  selectedMetric: string

  // metrics threshold section
  ignoreThresholds: HealthSourceMetricThresholdType[]
  failFastThresholds: HealthSourceMetricThresholdType[]
}

export interface HealthSourceInitialData {
  // Fields coming from define health source screen
  name: string
  identifier: string
  connectorRef: { connector: { identifier: string }; value: string }
  product: string
  type: HealthSourceTypes

  // Configurations Page
  // non custom metric section

  // Custom Metric section
  mappedServicesAndEnvs: Map<string, CommonCustomMetricFormikInterface>
  selectedMetric?: string

  // metric thresholds
  ignoreThresholds?: HealthSourceMetricThresholdType[]
  failFastThresholds?: HealthSourceMetricThresholdType[]
}

export interface CommonHealthSourceConfigurations {
  // non custom metric section

  // Custom Metric section
  mappedServicesAndEnvs: Map<string, CommonCustomMetricFormikInterface>
  selectedMetric: string

  // metric thresholds
  ignoreThresholds: HealthSourceMetricThresholdType[]
  failFastThresholds: HealthSourceMetricThresholdType[]
}

export interface CommonCustomMetricFormikInterface {
  identifier: string
  metricName: string
  groupName: SelectOption | string

  // Define Query
  query: string

  //Metric Chart Mapping & Log fields Mappings
  valueJsonPath?: string // for logs its log message and for metrics its metric path
  timestampJsonPath?: string
  timestampFormat?: string

  // Assign
  sli?: boolean
  continuousVerification?: boolean
  healthScore?: boolean

  // Risk
  // TODO - define RiskCategoryEnum
  riskCategory?: string

  // Deviation compare to baseline
  lowerBaselineDeviation?: boolean
  higherBaselineDeviation?: boolean

  //TODO - figure out how this can be controlled by config to
  // show dropdown/input/Json path selector
  serviceInstance?: string | SelectOption
}

export interface PersistMappedMetricsType {
  mappedMetrics: Map<string, CommonCustomMetricFormikInterface>
  selectedMetric: string
  metricThresholds: MetricThresholdsState
  formikValues: CommonCustomMetricFormikInterface
  setMappedMetrics: React.Dispatch<React.SetStateAction<CustomSelectedAndMappedMetrics>>
}

export const CommonHealthSourceFieldNames = {
  METRIC_NAME: 'metricName',
  METRIC_IDENTIFIER: 'identifier',
  GROUP_NAME: 'groupName',
  QUERY: 'query',

  METRIC_VALUE: 'metricValue',
  TIMESTAMP_LOCATOR: 'timestamp',
  TIMESTAMP_FORMAT: 'timestampFormat',
  SERVICE_INSTANCE: 'serviceInstanceIdentifier',

  SLI: 'sli',
  HEALTH_SCORE: 'healthScore',
  CONTINUOUS_VERIFICATION: 'continuousVerification',

  RISK_CATEGORY: 'riskCategory',
  HIGHER_BASELINE_DEVIATION: 'higherBaselineDeviation',
  LOWER_BASELINE_DEVIATION: 'lowerBaselineDeviation'
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
