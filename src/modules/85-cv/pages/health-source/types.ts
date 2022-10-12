/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type {
  HealthSource,
  AppDynamicsHealthSourceSpec,
  PrometheusHealthSourceSpec,
  NewRelicHealthSourceSpec,
  StackdriverMetricHealthSourceSpec,
  DatadogMetricHealthSourceSpec,
  CustomHealthSourceMetricSpec,
  CustomHealthSourceLogSpec,
  ErrorTrackingHealthSourceSpec,
  DynatraceHealthSourceSpec
} from 'services/cv'
import type { MetricThresholdType, ThresholdsPropertyNames } from './common/MetricThresholds/MetricThresholds.types'
import type { DatadogLogsHealthSpec } from './connectors/DatadogLogsHealthSource/DatadogLogsHealthSource.type'
import type { GCOLogsHealthSourceSpec } from './connectors/GCOLogsMonitoringSource/components/MapQueriesToHarnessService/types'
import type { SplunkHealthSourceSpec } from './connectors/SplunkHealthSource/components/MapQueriesToHarnessService/types'

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
  CloudWatch = 'CloudWatch',
  CloudWatchMetrics = 'CloudWatchMetrics',
  Elk = 'ELKLog'
}

export type CommonNonCustomMetricFieldsType = {
  metricData: Record<string, boolean>
} & Record<ThresholdsPropertyNames, MetricThresholdType[]>

export interface UpdatedHealthSourceWithAllSpecs extends Omit<HealthSource, 'spec'> {
  spec: AppDynamicsHealthSourceSpec &
    GCOLogsHealthSourceSpec &
    PrometheusHealthSourceSpec &
    NewRelicHealthSourceSpec &
    StackdriverMetricHealthSourceSpec &
    SplunkHealthSourceSpec &
    DatadogMetricHealthSourceSpec &
    DatadogLogsHealthSpec &
    CustomHealthSourceMetricSpec &
    CustomHealthSourceLogSpec &
    ErrorTrackingHealthSourceSpec &
    DynatraceHealthSourceSpec
}
