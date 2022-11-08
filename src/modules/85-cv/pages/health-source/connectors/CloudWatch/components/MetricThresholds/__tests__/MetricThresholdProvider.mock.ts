import type { GroupedCreatedMetrics } from '@cv/pages/health-source/common/CustomMetricV2/CustomMetric.types'

const mockFormValues = {
  region: '',
  customMetrics: [],
  selectedCustomMetricIndex: 0,
  ignoreThresholds: [],
  failFastThresholds: []
}

export const MockContextValues = {
  formikValues: mockFormValues,
  groupedCreatedMetrics: {
    g1: [
      {
        groupName: {
          label: 'g1',
          value: 'g1'
        },
        metricName: 'customMetric 1',
        continuousVerification: true
      }
    ]
  } as GroupedCreatedMetrics
}
