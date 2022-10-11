/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SelectOption } from '@wings-software/uicore'
import type { FormikProps } from 'formik'
import type { CustomHealthRequestDefinition, CustomHealthMetricDefinition, TimestampInfo } from 'services/cv'
import type {
  CustomMappedMetric,
  CustomSelectedAndMappedMetrics,
  GroupedCreatedMetrics
} from '../../common/CustomMetric/CustomMetric.types'
import type { MetricThresholdsState, MetricThresholdType } from '../../common/MetricThresholds/MetricThresholds.types'
import type { UpdatedHealthSource } from '../../HealthSourceDrawer/HealthSourceDrawerContent.types'

export interface CustomHealthSourceSetupSource {
  isEdit: boolean
  mappedServicesAndEnvs: Map<string, MapCustomHealthToService> // metricName to MapCustomHealthToService
  healthSourceIdentifier: string
  healthSourceName: string
  connectorRef?: string
  ignoreThresholds: MetricThresholdType[]
  failFastThresholds: MetricThresholdType[]
}

export type MapCustomHealthToService = {
  metricName: string
  metricIdentifier: string
  groupName?: SelectOption

  baseURL: string
  pathURL: string
  queryType: CustomHealthMetricDefinition['queryType']
  query: string
  requestMethod: CustomHealthRequestDefinition['method']
  metricValue: string
  timestamp: string
  timestampFormat: string
  serviceInstancePath: string

  startTime: TimestampInfo
  endTime: TimestampInfo

  sli?: boolean
  continuousVerification?: boolean
  healthScore?: boolean
  riskCategory?: string
  lowerBaselineDeviation?: boolean
  higherBaselineDeviation?: boolean
  serviceInstanceIdentifier?: string
  ignoreThresholds: MetricThresholdType[]
  failFastThresholds: MetricThresholdType[]
}

export interface onSubmitCustomHealthSourceInterface {
  formikProps: FormikProps<MapCustomHealthToService>
  mappedMetrics: Map<string, CustomMappedMetric>
  selectedMetric: string
  onSubmit: (formdata: CustomHealthSourceSetupSource, UpdatedHealthSource: UpdatedHealthSource) => Promise<void>
  sourceData: any
  transformedSourceData: CustomHealthSourceSetupSource
  isMetricThresholdEnabled: boolean
  metricThresholds: MetricThresholdsState
}
export interface InitCustomHealthSourceInterface {
  sli: boolean
  healthScore: boolean
  continuousVerification: boolean
  serviceInstanceMetricPath: string
  baseURL: string
  pathURL: string
  metricValue: string
  requestMethod: string
  timestamp: string
  timestampFormat: string
  queryType: string
  query: string
  startTime: { timestampFormat: string }
  endTime: { timestampFormat: string }
}

export interface MetricThresholdCommonProps {
  formikValues: MapCustomHealthToService
  groupedCreatedMetrics: GroupedCreatedMetrics
  setThresholdState: React.Dispatch<React.SetStateAction<MetricThresholdsState>>
}

export type CustomHealthThresholdContextType = MetricThresholdCommonProps

export interface PersistMappedMetricsType {
  mappedMetrics: Map<string, CustomMappedMetric>
  selectedMetric: string
  metricThresholds: MetricThresholdsState
  formikValues: MapCustomHealthToService
  setMappedMetrics: React.Dispatch<React.SetStateAction<CustomSelectedAndMappedMetrics>>
}
