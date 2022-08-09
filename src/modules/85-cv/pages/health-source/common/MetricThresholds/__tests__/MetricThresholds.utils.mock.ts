import { DefaultCustomMetricGroupName } from '../MetricThresholds.constants'

export const groupedCreatedMetrics = {
  'group 1': [
    {
      groupName: {
        label: 'group 1',
        value: 'group1'
      },
      index: 0,
      metricName: 'test metric'
    }
  ]
}

export const exceptionalGroupedCreatedMetrics = {
  '+ Add New': [
    {
      groupName: {
        label: 'group 1',
        value: 'group1'
      },
      index: 0,
      metricName: 'test metric'
    }
  ]
}

export const groupedCreatedMetricsDefault = {
  [DefaultCustomMetricGroupName]: [
    {
      groupName: {
        label: DefaultCustomMetricGroupName,
        value: DefaultCustomMetricGroupName
      },
      index: 0,
      metricName: 'test metric'
    }
  ]
}
