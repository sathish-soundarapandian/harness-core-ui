import type { QueryRecordsRequest } from 'services/cv'
import { HealthSourceTypes } from '../../types'
import type { HealthSourceProductsType } from './CommonHealthSource.types'

export const HealthSourceProducts: HealthSourceProductsType = {
  [HealthSourceTypes.SumologicMetrics]: {
    label: 'SumoLogic Cloud Metrics',
    value: HealthSourceTypes.SumologicMetrics
  },
  [HealthSourceTypes.SumologicLogs]: {
    label: 'SumoLogic Cloud Logs',
    value: HealthSourceTypes.SumologicLogs
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

export const CustomMetricFormFieldNames = {
  METRIC_NAME: 'metricName',
  METRIC_IDENTIFIER: 'identifier',
  GROUP_NAME: 'groupName',

  QUERY: 'query',
  RECORD_COUNT: 'recordCount',

  METRIC_VALUE: 'metricValue',
  TIMESTAMP_LOCATOR: 'timestamp',
  TIMESTAMP_FORMAT: 'timestampFormat',
  SERVICE_INSTANCE: 'serviceInstance',

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
export const ProviderTypes: Record<string, QueryRecordsRequest['providerType']> = {
  SUMOLOGIC_LOG: 'SUMOLOGIC_LOG'
}
