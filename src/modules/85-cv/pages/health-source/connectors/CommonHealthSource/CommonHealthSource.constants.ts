/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import {
  ElkProduct,
  GrafanaLoki,
  SignalFX
} from '../../HealthSourceDrawer/component/defineHealthSource/DefineHealthSource.constant'
import { HealthSourceTypes } from '../../types'
import type { CommonCustomMetricFormikInterface, HealthSourceProductsType } from './CommonHealthSource.types'

export const HealthSourceProducts: HealthSourceProductsType = {
  [HealthSourceTypes.SumologicMetrics]: {
    label: 'SumoLogic Cloud Metrics',
    value: HealthSourceTypes.SumologicMetrics
  },
  [HealthSourceTypes.SumologicLogs]: {
    label: 'SumoLogic Cloud Logs',
    value: HealthSourceTypes.SumologicLogs
  },
  [HealthSourceTypes.Elk]: {
    value: ElkProduct.ELK_LOGS,
    label: ElkProduct.ELK_LOGS
  },
  [HealthSourceTypes.SignalFX]: {
    label: SignalFX.SIGNALFX_METRICS_DISPLAY_NAME,
    value: HealthSourceTypes.SplunkSignalFXMetrics
  },
  [HealthSourceTypes.GrafanaLoki]: {
    label: GrafanaLoki.GRAFANA_LOKI_DISPLAY_NAME,
    value: GrafanaLoki.GRAFANA_LOKI_LOGS
  }
}

export const DEFAULT_HEALTH_SOURCE_QUERY = 'Health Source Query'
export const METRICS = 'METRICS'

export const initConfigurationsForm = {
  queryMetricsMap: new Map(),
  selectedMetric: '',
  ignoreThresholds: [],
  failFastThresholds: []
}

export const initCustomForm = {
  sli: false,
  healthScore: false,
  continuousVerification: false,
  serviceInstanceMetricPath: ''
}

export const ThresholdTypes: Record<string, 'IgnoreThreshold' | 'FailImmediately'> = {
  IgnoreThreshold: 'IgnoreThreshold',
  FailImmediately: 'FailImmediately'
}

export const CustomMetricFormFieldNames: { [x: string]: keyof CommonCustomMetricFormikInterface } = {
  METRIC_NAME: 'metricName',
  METRIC_IDENTIFIER: 'identifier',
  GROUP_NAME: 'groupName',

  QUERY: 'query',
  RECORD_COUNT: 'recordCount',
  INDEX: 'index',

  TIMESTAMP_IDENTIFIER: 'timeStampIdentifier',
  TIMESTAMP_FORMAT: 'timeStampFormat',
  SERVICE_INSTANCE: 'serviceInstanceField',
  MESSAGE_IDENTIFIER: 'messageIdentifier',

  SLI: 'sli',
  HEALTH_SCORE: 'healthScore',
  CONTINUOUS_VERIFICATION: 'continuousVerification',

  RISK_CATEGORY: 'riskCategory',
  HIGHER_BASELINE_DEVIATION: 'higherBaselineDeviation',
  LOWER_BASELINE_DEVIATION: 'lowerBaselineDeviation'
}

export const CommonConfigurationsFormFieldNames = {
  QUERY_METRICS_MAP: 'queryMetricsMap',
  SELECTED_METRIC: 'selectedMetric',
  IGNORE_THRESHOLDS: 'ignoreThresholds',
  FAILFAST_THRESHOLDS: 'failFastThresholds'
}

export enum FIELD_ENUM {
  JSON_SELECTOR = 'JsonSelector',
  TEXT_INPUT = 'TextInput',
  DROPDOWN = 'Dropdown'
}

export enum CHART_VISIBILITY_ENUM {
  AUTO = 'auto',
  DEFAULT = 'default'
}

// Logs table constants
export enum FieldMappingInputTypes {
  JsonSelector = 'JsonSelector'
}
export const logsTableDefaultConfigs = {
  size: '40%'
}

export const PRODUCT_MAP: { [key: string]: HealthSourceTypes } = {
  [HealthSourceTypes.Elk]: HealthSourceTypes.ElasticSearch_Logs
}
