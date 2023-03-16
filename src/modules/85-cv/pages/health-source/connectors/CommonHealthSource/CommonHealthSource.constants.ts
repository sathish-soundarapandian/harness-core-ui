import type { QueryRecordsRequest } from 'services/cv'
import { ElkProduct } from '../../HealthSourceDrawer/component/defineHealthSource/DefineHealthSource.constant'
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
export const ProviderTypes: Record<string, QueryRecordsRequest['providerType']> = {
  SUMOLOGIC_LOG: 'SUMOLOGIC_LOG'
}
