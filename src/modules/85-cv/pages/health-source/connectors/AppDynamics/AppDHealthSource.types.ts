/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SelectOption } from '@harness/uicore'
import type { StringKeys } from 'framework/strings'
import type {
  FailMetricThresholdSpec,
  MetricPackDTO,
  MetricThreshold,
  MetricThresholdSpec,
  TimeSeriesMetricPackDTO
} from 'services/cv'
import type { CustomMappedMetric, CustomSelectedAndMappedMetrics } from '../../common/CustomMetric/CustomMetric.types'
import type { HealthSourceTypes } from '../../types'
import type { BasePathData } from './Components/BasePath/BasePath.types'
import type { MetricPathData } from './Components/MetricPath/MetricPath.types'

export type MapAppDynamicsMetric = {
  metricName: string
  appdApplication: string
  appDTier: string
  metricPacks?: MetricPackDTO[]
  metricData: { [key: string]: boolean }
  riskCategory?: string
  serviceInstance?: string
  lowerBaselineDeviation?: boolean
  higherBaselineDeviation?: boolean
  groupName?: SelectOption
  sli?: boolean
  continuousVerification?: boolean
  healthScore?: boolean
  basePath: BasePathData
  metricPath: MetricPathData
  serviceInstanceMetricPath?: string
  metricIdentifier?: string
  fullPath?: string
  pathType?: string
  completeMetricPath?: string
  ignoreThresholds: MetricThresholdType[]
  failFastThresholds: MetricThresholdType[]
}

export interface AppDynamicsData {
  name: string
  identifier: string
  connectorRef: { connector: { identifier: string }; value: string }
  isEdit: boolean
  product: string
  type: HealthSourceTypes
  applicationName: string
  tierName: string
  metricPacks?: TimeSeriesMetricPackDTO[]
  showCustomMetric?: boolean
  mappedServicesAndEnvs: Map<string, MapAppDynamicsMetric>
}

export type MetricThresholdType = MetricThreshold & {
  metricType?: string
  spec?: MetricThresholdSpec & FailMetricThresholdSpec
}

export interface AppDynamicsFomikFormInterface {
  name: string
  identifier: string
  connectorRef: { connector: { identifier: string } }
  isEdit: boolean
  product: string
  type: HealthSourceTypes
  mappedServicesAndEnvs: Map<string, MapAppDynamicsMetric>
  metricName: string
  showCustomMetric?: boolean
  appdApplication: string
  appDTier: string
  metricPacks?: MetricPackDTO[]
  metricData: { [key: string]: boolean }
  riskCategory?: string
  serviceInstance?: string
  lowerBaselineDeviation?: boolean
  higherBaselineDeviation?: boolean
  groupName?: SelectOption
  sli?: boolean
  continuousVerification?: boolean
  healthScore?: boolean
  basePath: BasePathData
  metricPath: MetricPathData
  serviceInstanceMetricPath?: string
  metricIdentifier?: string
  fullPath?: string
  pathType?: string
  completeMetricPath?: string
  ignoreThresholds: MetricThresholdType[]
  failFastThresholds: MetricThresholdType[]
}

export interface InitAppDCustomFormInterface {
  sli: boolean
  groupName: {
    label: string
    value: string
  }
  healthScore: boolean
  basePath: BasePathData
  metricPath: MetricPathData
  continuousVerification: boolean
  serviceInstanceMetricPath: string
}
export interface ValidateMappingInterface {
  values: AppDynamicsFomikFormInterface
  createdMetrics: string[]
  selectedMetricIndex: number
  getString: (key: StringKeys) => string
  mappedMetrics?: Map<string, CustomMappedMetric>
  isMetricThresholdEnabled: boolean
}

export interface NonCustomFeildsInterface {
  appdApplication: string
  appDTier: string
  metricPacks?: TimeSeriesMetricPackDTO[]
  metricData: {
    [key: string]: boolean
  }
  ignoreThresholds: MetricThresholdType[]
  failFastThresholds: MetricThresholdType[]
}

export interface NonCustomFieldsInterface {
  appdApplication: string
  appDTier: string
  metricPacks: MetricPackDTO[] | undefined
  metricData: {
    [key: string]: boolean
  }
}
export interface PersistCustomMetricInterface {
  mappedMetrics: Map<string, CustomMappedMetric>
  selectedMetric: string
  nonCustomFeilds: NonCustomFeildsInterface
  formikValues: AppDynamicsFomikFormInterface
  setMappedMetrics: React.Dispatch<React.SetStateAction<CustomSelectedAndMappedMetrics>>
  isTemplate?: boolean
}
