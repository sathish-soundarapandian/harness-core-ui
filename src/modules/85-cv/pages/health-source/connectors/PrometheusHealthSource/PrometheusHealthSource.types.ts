/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { FailMetricThresholdSpec, MetricThreshold, MetricThresholdSpec } from 'services/cv'
import type { CustomMappedMetric, CustomSelectedAndMappedMetrics } from '../../common/CustomMetric/CustomMetric.types'
import type { CriteriaThresholdValues } from '../../common/MetricThresholds/MetricThresholds.types'
import type { MapPrometheusQueryToService } from './PrometheusHealthSource.constants'

interface CriteriaPercentageType {
  criteriaPercentageType?: CriteriaThresholdValues
}

export type PrometheusMetricThresholdType = Omit<MetricThreshold, 'groupName'> & {
  criteria: MetricThreshold['criteria'] & CriteriaPercentageType
  metricType?: string
  spec?: MetricThresholdSpec & FailMetricThresholdSpec
}

export interface MetricThresholdsState {
  ignoreThresholds: PrometheusMetricThresholdType[]
  failFastThresholds: PrometheusMetricThresholdType[]
}

export type PrometheusMetricPacksType = Array<{
  identifier: string
  metricThresholds: PrometheusMetricThresholdType[]
}>

export interface PersistMappedMetricsType {
  mappedMetrics: Map<string, CustomMappedMetric>
  selectedMetric: string
  metricThresholds: MetricThresholdsState
  formikValues: MapPrometheusQueryToService
  setMappedMetrics: React.Dispatch<React.SetStateAction<CustomSelectedAndMappedMetrics>>
}
