/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { MetricThresholdType, ThresholdsPropertyNames } from './common/MetricThresholds/MetricThresholds.types'

export enum HealthSourceTypes {
  AppDynamics = 'AppDynamics',
  NewRelic = 'NewRelic',
  StackdriverLog = 'StackdriverLog',
  Prometheus = 'Prometheus',
  StackdriverMetrics = 'Stackdriver',
  GoogleCloudOperations = 'Google Cloud Operations',
  Splunk = 'Splunk',
  SplunkMetric = 'SplunkMetric',
  DatadogMetrics = 'DatadogMetrics',
  DatadogLog = 'DatadogLog',
  Datadog = 'Datadog',
  CustomHealth = 'CustomHealth',
  ErrorTracking = 'ErrorTracking',
  Dynatrace = 'Dynatrace',
  Elk = 'ELKLog'
}

export type CommonNonCustomMetricFieldsType = {
  metricData: Record<string, boolean>
} & Record<ThresholdsPropertyNames, MetricThresholdType[]>
