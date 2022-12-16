export const BasePathKeyPrefix = 'basePathDropdown_'
export const BasePathInitValue = { basePathDropdown_0: { value: '', path: '' } }

export const MetricPathKeyPrefix = 'metricPathDropdown_'
export const MetricPathInitValue = { metricPathDropdown_0: { value: '', path: '', isMetric: false } }

export const SumoLogicProducts = {
  METRICS: 'SumoLogic Cloud Metrics',
  LOGS: 'SumoLogic Cloud Logs'
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

export const CommonHealthSourceFieldNames = {
  METRIC_NAME: 'metricName',
  METRIC_IDENTIFIER: 'identifier',
  GROUP_NAME: 'groupName',

  QUERY: 'query',

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

export enum FIELD_ENUM {
  JSON_SELECTOR = 'JsonSelector',
  TEXT_INPUT = 'TextInput',
  DROPDOWN = 'Dropdown'
}

export enum CHART_VISIBILITY_ENUM {
  AUTO = 'auto',
  DEFAULT = 'default'
}
