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
  serviceInstanceMetricPath: '',
  basePath: BasePathInitValue,
  metricPath: MetricPathInitValue
}

export const ThresholdTypes: Record<string, 'IgnoreThreshold' | 'FailImmediately'> = {
  IgnoreThreshold: 'IgnoreThreshold',
  FailImmediately: 'FailImmediately'
}
