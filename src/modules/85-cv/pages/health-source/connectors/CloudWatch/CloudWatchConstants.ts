import type { CloudWatchFormType } from './CloudWatch.types'

export const CloudWatchProductNames = {
  METRICS: 'Cloud watch metrics'
}

export const CloudWatchProperties = {
  region: 'region',
  customMetrics: 'customMetrics'
}

export const cloudWatchInitialValues: CloudWatchFormType = {
  region: '',
  customMetrics: [],
  selectedCustomMetric: ''
}
