import { getFeatureNameDisplay } from '../HealthSourceInputsetTable.utils'

describe('getFeatureNameDisplay', () => {
  test('getFeatureNameDisplay should return featureName if featureName is present', () => {
    const result = getFeatureNameDisplay({
      getString: a => a,
      featureName: 'test'
    })

    expect(result).toBe('test')
  })
  test('getFeatureNameDisplay should return correct feature name if featureName is not present', () => {
    const result = getFeatureNameDisplay({
      getString: a => a,
      type: 'CustomHealthMetric'
    })

    expect(result).toBe('cv.customHealthSource.customHealthMetric')
  })
})
