import { HealthSourceTypes } from '@cv/pages/health-source/types'
import type { MonitoredServiceInputSetInterface } from '../MonitoredServiceInputSetsTemplate.types'
import { getPopulateSource, healthSourceTypeMapping } from '../MonitoredServiceInputSetsTemplate.utils'
import { expectedOutput, payloadParameter } from './MonitoredServiceInputSetsTemplate.mock'

describe('MonitoredServiceInputSetsTemplate Utils', () => {
  test('getPopulateSource should give correct result', () => {
    const result = getPopulateSource(payloadParameter as MonitoredServiceInputSetInterface)

    expect(result).toEqual(expectedOutput)
  })
  test('healthSourceTypeMapping should give correct result', () => {
    const result = healthSourceTypeMapping(HealthSourceTypes.CloudWatchMetrics)

    expect(result).toEqual('Aws')
  })
})
