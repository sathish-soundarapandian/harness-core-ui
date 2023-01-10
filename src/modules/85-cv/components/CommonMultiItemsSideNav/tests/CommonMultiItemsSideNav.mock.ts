import type { CommonHealthSourceConfigurations } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.types'
import type { CommonHealthSourceContextType } from '@cv/pages/health-source/connectors/CommonHealthSource/components/CustomMetricForm/components/CommonHealthSourceContext/CommonHealthSourceContext'

export const groupedCreatedMetrics = {
  'Group 2': [{ groupName: { label: 'Group 2', value: 'Group 2' }, metricName: 'appdMetric 102' }],
  'Group 1': [{ groupName: { label: 'Group 1', value: 'Group 1' }, metricName: 'appdMetric 101' }]
}

export const commonHealthSourceProviderPropsMock: CommonHealthSourceContextType = {
  updateParentFormik: jest.fn(),
  updateHelperContext: jest.fn(),
  parentFormValues: { failFastThresholds: [], ignoreThresholds: [] } as unknown as CommonHealthSourceConfigurations
}
