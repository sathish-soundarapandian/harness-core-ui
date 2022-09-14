export interface CloudWatchFormCustomMetricType {
  metricName: string
  identifier: string
  groupName: string
}

export interface CloudWatchFormType {
  region: string
  customMetrics: CloudWatchFormCustomMetricType[]
  selectedCustomMetric: string
}
