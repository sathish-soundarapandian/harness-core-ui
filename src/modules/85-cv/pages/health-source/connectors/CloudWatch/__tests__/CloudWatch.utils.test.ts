import type { CloudWatchFormType, CloudWatchSetupSource } from '../CloudWatch.types'
import { getFormikInitialValue, getSampleDataHightchartPoints, validateForm } from '../CloudWatch.utils'
import {
  assignErrorMock,
  chartSeriesValue,
  defaultFormikValue,
  expectedInitialValueWithMetricThresholds,
  formValuesMock,
  formValuesMockInvalidMetricIdentifier,
  formValuesMockInvalidRiskCategory,
  formValuesMockNoAssign,
  formValuesMockNoServiceInstance,
  healthSourceWithMetricThresholds,
  identifierInvalidValidationError,
  initialValueMock,
  riskCategoryErrorMock,
  sampleDataForTest,
  serviceInstanceErrorMock
} from './CloudWatch.mock'

describe('CloudWatch utils', () => {
  test('getFormikInitialValue should return default values, if it is not edit', () => {
    const result = getFormikInitialValue(initialValueMock as unknown as CloudWatchSetupSource, false)

    expect(result).toEqual(defaultFormikValue)
  })

  test('getFormikInitialValue should return default values, if it is not edit and contains metric thresholds', () => {
    const result = getFormikInitialValue(healthSourceWithMetricThresholds as unknown as CloudWatchSetupSource, true)

    expect(result).toEqual(expectedInitialValueWithMetricThresholds)
  })

  test('validateForm should give correct validation for region', () => {
    const result = validateForm(formValuesMock as CloudWatchFormType, key => key)

    expect(result).toEqual({ region: 'cd.cloudFormation.errors.region' })
  })

  test('validateForm should give correct validation for custom metrics', () => {
    const result = validateForm({ ...formValuesMock, region: 'new' } as CloudWatchFormType, key => key)

    expect(result).toEqual({
      CustomMetricsNotPresent: 'cv.healthSource.connectors.CloudWatch.validationMessage.customMetrics'
    })
  })

  test('validateForm should give correct validation for assign', () => {
    const result = validateForm(formValuesMockNoAssign as unknown as CloudWatchFormType, key => key)

    expect(result).toEqual(assignErrorMock)
  })

  test('validateForm should give correct validation for serviceInstanceJsonPath', () => {
    const result = validateForm(formValuesMockNoServiceInstance as unknown as CloudWatchFormType, key => key)

    expect(result).toEqual(serviceInstanceErrorMock)
  })

  test('validateForm should give correct validation, if metric identifier is invalid', () => {
    const result = validateForm(formValuesMockInvalidMetricIdentifier as unknown as CloudWatchFormType, key => key)

    expect(result).toEqual(identifierInvalidValidationError)
  })

  test('validateForm should give correct validation, if risk category is invalid', () => {
    const result = validateForm(formValuesMockInvalidRiskCategory as unknown as CloudWatchFormType, key => key)

    expect(result).toEqual(riskCategoryErrorMock)
  })

  test('getSampleDataHightchartPoints should give correct chart data', () => {
    const result = getSampleDataHightchartPoints(sampleDataForTest.data)

    expect(result).toEqual(chartSeriesValue)
  })
})
