/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { AppDynamicsFomikFormInterface } from './AppDHealthSource.types'
import { BasePathInitValue } from './Components/BasePath/BasePath.constants'
import { MetricPathInitValue } from './Components/MetricPath/MetricPath.constants'

export const AppDynamicsMonitoringSourceFieldNames: Record<string, keyof AppDynamicsFomikFormInterface | string> = {
  METRIC_NAME: 'metricName',
  METRIC_IDENTIFIER: 'metricIdentifier',
  APPDYNAMICS_APPLICATION: 'appdApplication',
  APPDYNAMICS_TIER: 'appDTier',
  METRIC_DATA: 'metricData',
  RISK_CATEGORY: 'riskCategory',
  HIGHER_BASELINE_DEVIATION: 'higherBaselineDeviation',
  LOWER_BASELINE_DEVIATION: 'lowerBaselineDeviation',
  SERVICE_INSTANCE: 'serviceInstance',
  GROUP_NAME: 'groupName',
  CONTINUOUS_VERIFICATION: 'continuousVerification',
  HEALTH_SCORE: 'healthScore',
  SLI: 'sli',
  BASE_PATH: 'basePath',
  METRIC_PATH: 'metricPath',
  SERVICE_INSTANCE_METRIC_PATH: 'serviceInstanceMetricPath',
  PATH_TYPE: 'pathType',
  IGNORETHRESHOLDS: 'ignoreThresholds',
  FAILFASTTHRESHOLDS: 'failFastThresholds',
  METRIC_THRESHOLD_METRIC_TYPE: 'metricType',
  METRIC_THRESHOLD_METRIC_NAME: 'metricName',
  METRIC_THRESHOLD_GROUP_NAME: 'groupName',
  METRIC_THRESHOLD_CRITERIA: 'criteria',
  METRIC_THRESHOLD_CRITERIA_PERCENTAGE_TYPE: 'criteriaPercentageType',
  METRIC_THRESHOLD_LESS_THAN: 'lessThan',
  METRIC_THRESHOLD_GREATER_THAN: 'greaterThan',
  METRIC_THRESHOLD_ACTION: 'action',
  METRIC_THRESHOLD_COUNT: 'count'
}

export const ThresholdTypes: Record<string, 'IgnoreThreshold' | 'FailImmediately'> = {
  IgnoreThreshold: 'IgnoreThreshold',
  FailImmediately: 'FailImmediately'
}

export const initCustomForm = {
  sli: false,
  healthScore: false,
  continuousVerification: false,
  serviceInstanceMetricPath: '',
  basePath: BasePathInitValue,
  metricPath: MetricPathInitValue
}
