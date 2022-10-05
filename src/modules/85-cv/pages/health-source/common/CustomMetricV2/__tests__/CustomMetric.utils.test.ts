import type { AnalysisDTO, MetricPackDTO } from 'services/cv'
import type { CommonCustomMetricsType, GroupedCreatedMetrics } from '../CustomMetric.types'
import {
  canShowRiskProfile,
  canShowServiceInstance,
  getAnalysisForFormik,
  getCurrentSelectedMetricName,
  getCustomMetricGroupOptions,
  getGroupOption,
  getIsCustomMetricPresent,
  getIsGivenMetricPresent,
  getNewMetricIdentifier,
  getNewMetricName,
  getRiskCategoryOptions,
  getUpdatedSelectedMetricIndex,
  isAssignSectionValid,
  isDuplicateMetricIdentifier,
  isDuplicateMetricName,
  isRiskProfileAndCategoryPresent,
  isRiskProfileAndCategoryPresentForFormik,
  updateFormikValuesForPayload,
  updateResponseForFormik
} from '../CustomMetric.utils'
import {
  analysisFormikMock,
  analysisMock,
  customMetricFormikUpdatedExpected,
  customMetricMock,
  customMetricMock2,
  customMetricMockForPayload,
  customMetricMockWithoutSLI,
  invalidCustomMetricMock,
  invalidCustomMetricMock2,
  metricPack,
  metricPackResponse,
  payloadMock,
  payloadMock2
} from './CustomMetric.utils.mock'

describe('CustomMetric.utils', () => {
  test('isAssignSectionValid should return false, if no custom metric passed', () => {
    // testing negative scenario
    const result = isAssignSectionValid(null as unknown as CommonCustomMetricsType)

    expect(result).toBe(false)
  })

  test('isAssignSectionValid should return false, if none of the options are not selected', () => {
    const result = isAssignSectionValid(customMetricMock)

    expect(result).toBe(false)
  })

  test('isAssignSectionValid should return false, if empty custom metric is passed', () => {
    const result = isAssignSectionValid({} as CommonCustomMetricsType)

    expect(result).toBe(false)
  })

  test('getNewMetricIdentifier should return empty string if not valid values are passed', () => {
    // testing negative scenario
    const result = getNewMetricIdentifier([customMetricMock], null as unknown as string)

    expect(result).toBe('')

    const result2 = getNewMetricIdentifier(null as unknown as CommonCustomMetricsType[], 'test')

    expect(result2).toBe('')
  })

  test('getIsCustomMetricPresent should return false, if invalid value is passed', () => {
    const result = getIsCustomMetricPresent(null as unknown as CommonCustomMetricsType[])

    expect(result).toBe(false)

    const result2 = getIsCustomMetricPresent([])

    expect(result2).toBe(false)
  })

  test('getIsGivenMetricPresent should return true if the given metric is present', () => {
    const result = getIsGivenMetricPresent([customMetricMock], 'cw-metric-4')

    expect(result).toBe(true)
  })

  test('getIsGivenMetricPresent should return false if the given metric is not present', () => {
    const result = getIsGivenMetricPresent([customMetricMock], 'cw-metric')

    expect(result).toBe(false)
  })

  test('getIsGivenMetricPresent should return false if the given metric is not present', () => {
    const result = getIsGivenMetricPresent(null as unknown as CommonCustomMetricsType[], 'cw-metric')

    expect(result).toBe(false)

    const result2 = getIsGivenMetricPresent([], null as unknown as string)

    expect(result2).toBe(false)
  })

  test('getCurrentSelectedMetricName should return correct metricName', () => {
    const result = getCurrentSelectedMetricName([customMetricMock], 0)

    expect(result).toBe('cw-metric-4')
  })

  test('getCurrentSelectedMetricName should return empty string if metric is not found', () => {
    const result = getCurrentSelectedMetricName([customMetricMock], 2)

    expect(result).toBe('')
  })

  test('getCurrentSelectedMetricName should return empty string if invalid values are sent', () => {
    const result = getCurrentSelectedMetricName(null as unknown as CommonCustomMetricsType[], 2)

    expect(result).toBe('')

    const result2 = getCurrentSelectedMetricName([customMetricMock], null as unknown as number)

    expect(result2).toBe('')
  })

  test('getUpdatedSelectedMetricIndex should return one value less than given value, if it is valid', () => {
    const result = getUpdatedSelectedMetricIndex(5)

    expect(result).toBe(4)

    const result2 = getUpdatedSelectedMetricIndex(0)

    expect(result2).toBe(0)
  })

  test('canShowRiskProfile should return false, if metric is not present', () => {
    const result = canShowRiskProfile([customMetricMock], 2)

    expect(result).toBe(false)
  })

  test('canShowRiskProfile should return false, if analysis is not present', () => {
    const result = canShowRiskProfile([invalidCustomMetricMock], 0)

    expect(result).toBe(false)
  })

  test('canShowRiskProfile should return false, if deploymentVerification or liveMonitoring is not enabled', () => {
    const result = canShowRiskProfile([invalidCustomMetricMock2], 0)

    expect(result).toBe(false)
  })

  test('canShowServiceInstance should return false if invalid values are sent', () => {
    const result = canShowServiceInstance([customMetricMock], null as unknown as number)

    expect(result).toBe(false)

    const result2 = canShowServiceInstance(null as unknown as CommonCustomMetricsType[], 2)

    expect(result2).toBe(false)
  })

  test('getRiskCategoryOptions should return empty [], if invalid values are sent', () => {
    const result = getRiskCategoryOptions(null as unknown as MetricPackDTO[])

    expect(result).toEqual([])
  })

  test('isDuplicateMetricName should return false, if the name is not duplicate', () => {
    const result = isDuplicateMetricName([customMetricMock, customMetricMock2], '2 new', 1)

    expect(result).toBe(false)
  })

  test('isDuplicateMetricName should return true, if the name is duplicate', () => {
    const result = isDuplicateMetricName([customMetricMock, customMetricMock2], '2 new', 0)

    expect(result).toBe(true)
  })

  test('isDuplicateMetricName should return false, if invalid values are sent', () => {
    const result = isDuplicateMetricName(null as unknown as CommonCustomMetricsType[], '2 new', 0)

    expect(result).toBe(false)
  })

  test('isDuplicateMetricIdentifier should return false, if the name is not duplicate', () => {
    const result = isDuplicateMetricIdentifier([customMetricMock, customMetricMock2], '2_new', 1)

    expect(result).toBe(false)
  })

  test('isDuplicateMetricIdentifier should return true, if the name is duplicate', () => {
    const result = isDuplicateMetricIdentifier([customMetricMock, customMetricMock2], '2_new', 0)

    expect(result).toBe(true)
  })

  test('isDuplicateMetricIdentifier should return false, if invalid values are sent', () => {
    const result = isDuplicateMetricIdentifier(null as unknown as CommonCustomMetricsType[], '2_new', 0)

    expect(result).toBe(false)
  })

  test('updateResponseForFormik should return [], if invalid values are passed', () => {
    const result = updateResponseForFormik(null as unknown as CommonCustomMetricsType[])

    expect(result).toEqual([])
  })

  test('updateResponseForFormik should return analysis as {}, if analysis value is not passed', () => {
    const result = updateResponseForFormik([invalidCustomMetricMock])

    expect(result).toEqual(customMetricFormikUpdatedExpected)
  })

  test('getNewMetricName should return empty string, if correct params are not passed', () => {
    const result = getNewMetricName([], null as unknown as string)

    expect(result).toBe('')
  })

  test('getCustomMetricGroupOptions should return empty array, if correct params are not passed', () => {
    const result = getCustomMetricGroupOptions(null as unknown as GroupedCreatedMetrics)

    expect(result).toEqual([])
  })

  test('getRiskCategoryOptions should return correct result', () => {
    const result = getRiskCategoryOptions(metricPack.resource as unknown as MetricPackDTO[])

    expect(result).toEqual(metricPackResponse)
  })

  test('isRiskProfileAndCategoryPresent should return false, if analysis is not passed', () => {
    const result = isRiskProfileAndCategoryPresent(null as unknown as AnalysisDTO)

    expect(result).toEqual(false)
  })

  test('isRiskProfileAndCategoryPresentForFormik should return false, if risk profile metricType is not present', () => {
    const result = isRiskProfileAndCategoryPresentForFormik(analysisMock as unknown as AnalysisDTO)

    expect(result).toBe(false)
  })

  test('getGroupOption should return undefined, if value is not passed', () => {
    const result = getGroupOption()

    expect(result).toBe(undefined)
  })

  test('getAnalysisForFormik should return correct, if values are passed not empty', () => {
    const result = getAnalysisForFormik({ a: 1 } as unknown as AnalysisDTO)

    expect(result).toEqual(analysisFormikMock)
  })

  test('updateFormikValuesForPayload should return correct result, if values are passed not empty', () => {
    const result = updateFormikValuesForPayload([customMetricMockForPayload as CommonCustomMetricsType])

    expect(result).toEqual(payloadMock)
  })

  test('updateFormikValuesForPayload should send SLI, even if it not selected', () => {
    const result = updateFormikValuesForPayload([customMetricMockWithoutSLI as CommonCustomMetricsType])

    expect(result).toEqual(payloadMock2)
  })
})
