/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SelectOption } from '@harness/uicore'
import type { StringKeys } from 'framework/strings'
import type {
  FailMetricThresholdSpec,
  MetricThreshold,
  MetricThresholdSpec,
  NextGenHealthSourceSpec,
  RiskCategoryDTO,
  TimeSeriesMetricPackDTO
} from 'services/cv'
import type { CriteriaPercentageType, MetricThresholdType } from '../../common/MetricThresholds/MetricThresholds.types'
import type { HealthSourceTypes } from '../../types'
import type { CHART_VISIBILITY_ENUM, FIELD_ENUM } from './CommonHealthSource.constants'

export interface HealthSourcesConfig {
  [x: string]: HealthSourceConfig
}

export interface FieldMapping {
  type: FIELD_ENUM
  label: string
  identifier: keyof CommonCustomMetricFormikInterface
  defaultValue: string
}

export interface HealthSourceConfig {
  addQuery: {
    enableDefaultGroupName?: boolean
    label: string
  }
  customMetrics?: {
    enabled: boolean
    queryAndRecords: {
      enabled: boolean
      titleStringKey: StringKeys
    }
    fieldMappings?: FieldMapping[]
    metricsChart?: {
      enabled: boolean
      chartVisibilityMode: CHART_VISIBILITY_ENUM
    }
    logsTable?: {
      enabled: boolean
    }
    assign?: {
      enabled: boolean
      defaultServiceInstance: string
      hideCV?: boolean
      hideServiceIdentifier?: boolean
      hideSLIAndHealthScore?: boolean
    }
  }
  metricPacks?: {
    enabled: boolean
  }
  sideNav?: {
    shouldBeAbleToDeleteLastMetric: boolean
  }
  metricThresholds?: {
    enabled: boolean
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
  queryMetricsMap: Map<string, CommonCustomMetricFormikInterface>
  selectedMetric: string

  // metrics threshold section
  ignoreThresholds: HealthSourceMetricThresholdType[]
  failFastThresholds: HealthSourceMetricThresholdType[]
}

export interface HealthSourceProductsType {
  [key: string]: SelectOption
}

export interface HealthSourcePayload {
  name: string
  type: HealthSourceTypes
  identifier: string
  spec: NextGenHealthSourceSpec
}

export interface CommonHealthSourceConfigurations {
  // Custom Metric section
  queryMetricsMap: Map<string, CommonCustomMetricFormikInterface>
  selectedMetric: string

  // metric thresholds
  ignoreThresholds: MetricThresholdType[]
  failFastThresholds: MetricThresholdType[]
}

export interface CommonCustomMetricFormikInterface {
  identifier: string
  metricName: string
  groupName: string | SelectOption

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
  riskCategory?: RiskCategoryDTO['identifier']

  // Deviation compare to baseline
  lowerBaselineDeviation?: boolean
  higherBaselineDeviation?: boolean

  //TODO - figure out how this can be controlled by config to
  // show dropdown/input/Json path selector
  serviceInstance?: string | SelectOption
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

export interface GroupedMetric {
  groupName?: SelectOption | string
  metricName?: string
  index?: number
  continuousVerification?: boolean
}

export interface GroupedCreatedMetrics {
  [Key: string]: GroupedMetric[]
}

export interface CommonMetricThresholdProviderProps {
  formikValues: CommonHealthSourceConfigurations
  groupedCreatedMetrics: GroupedCreatedMetrics
  metricPacks: TimeSeriesMetricPackDTO[]
  isOnlyCustomMetricHealthSource?: boolean
}
