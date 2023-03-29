import { HealthSourceTypes } from '@cv/pages/health-source/types'
import type { CommonHealthSourceConfigurations, HealthSourceConfig } from '../CommonHealthSource.types'
import { metricThresholdsValidationMock } from './CommonHealthSource.mock'
import { getSelectedProductInfo, handleValidateHealthSourceConfigurationsForm } from '../CommonHealthSource.utils'

describe('CommonHealthSource utils tests', () => {
  test('handleValidateHealthSourceConfigurationsForm performs correct validation if metric thresholds are empty', () => {
    const formValues: CommonHealthSourceConfigurations = {
      ignoreThresholds: [],
      failFastThresholds: [],
      selectedMetric: '',
      queryMetricsMap: new Map()
    }
    const result = handleValidateHealthSourceConfigurationsForm({
      formValues,
      getString: c => c,
      healthSourceConfig: { metricPacks: { enabled: false } } as HealthSourceConfig
    })

    expect(result).toEqual({})
  })

  test('handleValidateHealthSourceConfigurationsForm performs correct validation if metric thresholds are invalid', () => {
    const formValues: CommonHealthSourceConfigurations = {
      ignoreThresholds: [
        {
          criteria: {},
          spec: {
            action: 'Ignore'
          }
        }
      ],
      failFastThresholds: [
        {
          criteria: {},
          spec: {
            action: 'FailAfterOccurrence'
          }
        }
      ],
      selectedMetric: '',
      queryMetricsMap: new Map()
    }
    const result = handleValidateHealthSourceConfigurationsForm({
      formValues,
      getString: c => c,
      healthSourceConfig: { metricPacks: { enabled: false } } as HealthSourceConfig
    })

    expect(result).toEqual(metricThresholdsValidationMock)
  })

  test('handleValidateHealthSourceConfigurationsForm should not return any metric thresholds related validation, if it is valid', () => {
    const formValues: CommonHealthSourceConfigurations = {
      ignoreThresholds: [
        {
          criteria: { spec: { greaterThan: 12 }, type: 'Absolute' },
          metricName: 'test',
          metricType: 'Performance',
          spec: { action: 'Ignore' },
          type: 'IgnoreThreshold'
        }
      ],
      failFastThresholds: [],
      selectedMetric: '',
      queryMetricsMap: new Map()
    }
    const result = handleValidateHealthSourceConfigurationsForm({
      formValues,
      getString: c => c,
      healthSourceConfig: { metricPacks: { enabled: false } } as HealthSourceConfig
    })

    expect(result).toEqual({})
  })

  test('Test getSelectedProductInfo when selected product is ElasticSearch', () => {
    const selectedProduct = HealthSourceTypes.Elk
    expect(getSelectedProductInfo(selectedProduct)).toEqual(HealthSourceTypes.ElasticSearch_Logs)
  })

  test('Test getSelectedProductInfo when selected product is HealthSourceTypes SumologicMetrics', () => {
    const selectedProduct = HealthSourceTypes.SumologicMetrics
    expect(getSelectedProductInfo(selectedProduct)).toEqual(HealthSourceTypes.SumologicMetrics)
  })
})
