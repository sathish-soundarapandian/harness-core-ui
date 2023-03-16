import type { MonitoredServiceInputSetInterface } from '../MonitoredServiceInputSetsTemplate.types'
import { getPopulateSource } from '../MonitoredServiceInputSetsTemplate.utils'
import { expectedOutput, payloadParameter } from './MonitoredServiceInputSetsTemplate.mock'

describe('MonitoredServiceInputSetsTemplate Utils', () => {
  test('getPopulateSource should give correct result', () => {
    const result = getPopulateSource(payloadParameter as MonitoredServiceInputSetInterface)

    expect(result).toEqual(expectedOutput)
  })
})
