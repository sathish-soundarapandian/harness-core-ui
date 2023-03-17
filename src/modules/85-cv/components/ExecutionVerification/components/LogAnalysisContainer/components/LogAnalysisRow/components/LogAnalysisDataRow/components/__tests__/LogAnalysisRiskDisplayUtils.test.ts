import type { LogData } from 'services/cv'
import { getRiskDisplayText, getRiskIcon } from '../LogAnalysisRiskDisplayUtils'

describe('LogAnalysisRiskDisplayUtils', () => {
  test('should return correct display text for getRiskDisplayText function', () => {
    const result = getRiskDisplayText('OBSERVE', a => a)

    expect(result).toBe('cv.monitoredServices.serviceHealth.serviceDependencies.states.mediumHealthy')

    const result2 = getRiskDisplayText('ABC' as LogData['riskStatus'], a => a)

    expect(result2).toBe('cv.monitoredServices.serviceHealth.serviceDependencies.states.mediumHealthy')
  })

  test('should return correct display text for getRiskIcon function', () => {
    const result = getRiskIcon('OBSERVE')

    expect(result).toBe('test-file-stub')

    const result1 = getRiskIcon('HEALTHY')

    expect(result1).toBe('test-file-stub')

    const result2 = getRiskIcon('ABC' as LogData['riskStatus'])

    expect(result2).toBe('test-file-stub')
  })
})
