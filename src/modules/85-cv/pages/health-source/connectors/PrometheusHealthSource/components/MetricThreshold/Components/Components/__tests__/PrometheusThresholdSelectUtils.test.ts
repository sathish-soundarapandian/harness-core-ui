import { getMetricItems, getMetricTypeItems } from '../Components/PrometheusThresholdSelectUtils'
import { groupedCreatedMetrics } from './PrometheusThresholdSelectUtils.mock'

describe('AppDIgnoreThresholdTabContent', () => {
  test('getMetricTypeItems returns Custom option', () => {
    const result = getMetricTypeItems(groupedCreatedMetrics)

    expect(result).toEqual([{ label: 'Custom', value: 'Custom' }])
  })

  test('getMetricTypeItems returns empty array if no group is created', () => {
    const result = getMetricTypeItems({})

    expect(result).toEqual([])
  })

  test('getMetricItems returns empty array if no group is created', () => {
    const result = getMetricItems({})

    expect(result).toEqual([])
  })
})
