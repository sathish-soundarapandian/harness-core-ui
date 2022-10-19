import type { CloudWatchFormType, CloudWatchSetupSource } from '../CloudWatch.types'
import { getFormikInitialValue, getSampleDataHightchartPoints, validateForm } from '../CloudWatch.utils'
import {
  assignErrorMock,
  chartSeriesValue,
  defaultFormikValue,
  formValuesMock,
  formValuesMockInvalidMetricIdentifier,
  formValuesMockNoAssign,
  formValuesMockNoServiceInstance,
  identifierInvalidValidationError,
  initialValueMock,
  sampleDataForTest,
  serviceInstanceErrorMock
} from './CloudWatch.mock'

describe('CloudWatch utils', () => {
  test('getFormikInitialValue should return default values, if it is not edit', () => {
    const result = getFormikInitialValue(initialValueMock as unknown as CloudWatchSetupSource)

    expect(result).toEqual(defaultFormikValue)
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

  test('getSampleDataHightchartPoints should give correct chart data', () => {
    const result = getSampleDataHightchartPoints(sampleDataForTest.data)

    expect(result).toEqual(chartSeriesValue)
  })
})
