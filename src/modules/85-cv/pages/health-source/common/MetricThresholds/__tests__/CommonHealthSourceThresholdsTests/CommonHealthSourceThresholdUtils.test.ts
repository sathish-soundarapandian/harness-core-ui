import type { TimeSeriesMetricPackDTO } from 'services/cv'
import type { AvailableThresholdTypes, MetricThresholdType } from '../../MetricThresholds.types'
import {
  getCanShowMetricThresholds,
  getFilteredMetricThresholdValuesV2,
  getMetricPacksForPayloadV2,
  getMetricThresholdsForCustomMetric
} from '../../MetricThresholds.utils'
import {
  expectedAllThresholdsMock,
  expectedThresholdsMock,
  expectedValueForCustomMetricThresholds,
  formDataMock,
  groupedCreatedMetricsForFailCVEnableTest,
  groupedCreatedMetricsForPassCVEnableTest
} from './commonHealthSourceThresholds.mock'

describe('CommonHealthSourceThresholdUtils', () => {
  describe('getMetricPacksForPayloadV2', () => {
    test('getMetricPacksForPayloadV2 should generate correct payload for metric packs', () => {
      const result = getMetricPacksForPayloadV2(formDataMock)

      expect(result).toEqual(expectedThresholdsMock)
    })
  })

  describe('getMetricThresholdsForCustomMetric', () => {
    test('getMetricThresholdsForCustomMetric should return metric thresholds which is configuired only for the given metric name', () => {
      const result = getMetricThresholdsForCustomMetric({
        metricName: 'stall_count',
        metricThresholds: [
          ...formDataMock.ignoreThresholds,
          ...formDataMock.failFastThresholds
        ] as MetricThresholdType[]
      })

      expect(result).toEqual(expectedValueForCustomMetricThresholds)
    })

    test('getMetricThresholdsForCustomMetric should return empty array if any of the required values are not passed', () => {
      const result = getMetricThresholdsForCustomMetric({
        metricName: 'abc',
        metricThresholds: [
          ...formDataMock.ignoreThresholds,
          ...formDataMock.failFastThresholds
        ] as MetricThresholdType[]
      })

      expect(result).toEqual([])

      const result2 = getMetricThresholdsForCustomMetric({
        metricName: '',
        metricThresholds: [
          ...formDataMock.ignoreThresholds,
          ...formDataMock.failFastThresholds
        ] as MetricThresholdType[]
      })

      expect(result2).toEqual([])

      const result3 = getMetricThresholdsForCustomMetric({
        metricName: 'abc',
        metricThresholds: []
      })

      expect(result3).toEqual([])

      const result4 = getMetricThresholdsForCustomMetric({
        metricName: 'abc',
        metricThresholds: [
          ...formDataMock.ignoreThresholds,
          ...formDataMock.failFastThresholds
        ] as MetricThresholdType[]
      })

      expect(result4).toEqual([])
    })
  })

  describe('getFilteredMetricThresholdValuesV2', () => {
    test('getFilteredMetricThresholdValuesV2 should return all metric thresholds combined in metric packs and query definitions for edit', () => {
      const result = getFilteredMetricThresholdValuesV2(
        'IgnoreThreshold',
        expectedThresholdsMock as TimeSeriesMetricPackDTO[],
        [
          {
            metricThresholds: [...formDataMock.ignoreThresholds] as MetricThresholdType[]
          },
          {
            metricThresholds: [...formDataMock.failFastThresholds] as MetricThresholdType[]
          }
        ]
      )
      expect(result).toEqual(expectedAllThresholdsMock)
    })

    test('getFilteredMetricThresholdValuesV2 should return empty array if requred values are not present', () => {
      const result = getFilteredMetricThresholdValuesV2('IgnoreThreshold', [], [])
      expect(result).toEqual([])

      const result2 = getFilteredMetricThresholdValuesV2(
        '' as AvailableThresholdTypes,
        expectedThresholdsMock as TimeSeriesMetricPackDTO[],
        [
          {
            metricThresholds: [...formDataMock.ignoreThresholds] as MetricThresholdType[]
          },
          {
            metricThresholds: [...formDataMock.failFastThresholds] as MetricThresholdType[]
          }
        ]
      )
      expect(result2).toEqual([])
    })
  })

  describe('getCanShowMetricThresholds', () => {
    test('getCanShowMetricThresholds should return true if user have atleast one custom metric with CV enabled', () => {
      const result = getCanShowMetricThresholds({
        isMetricPacksEnabled: false,
        isMetricThresholdConfigEnabled: true,
        groupedCreatedMetrics: groupedCreatedMetricsForPassCVEnableTest
      })

      expect(result).toBe(true)
    })

    test('getCanShowMetricThresholds should return true if user have atleast one custom metric with CV enabled and metric packs are enabled', () => {
      const result = getCanShowMetricThresholds({
        isMetricPacksEnabled: true,
        isMetricThresholdConfigEnabled: true,
        groupedCreatedMetrics: groupedCreatedMetricsForFailCVEnableTest,
        metricData: { Performance: true }
      })

      expect(result).toBe(true)
    })

    test('getCanShowMetricThresholds should return false if user have atleast one custom metric with CV disabled and metric packs are enabled with all false', () => {
      const result = getCanShowMetricThresholds({
        isMetricPacksEnabled: true,
        isMetricThresholdConfigEnabled: true,
        groupedCreatedMetrics: groupedCreatedMetricsForFailCVEnableTest,
        metricData: { Performance: false }
      })

      expect(result).toBe(false)
    })

    test('getCanShowMetricThresholds should return false if user have atleast one custom metric with CV disabled and metric packs are disabled', () => {
      const result = getCanShowMetricThresholds({
        isMetricPacksEnabled: false,
        isMetricThresholdConfigEnabled: true,
        groupedCreatedMetrics: groupedCreatedMetricsForFailCVEnableTest
      })

      expect(result).toBe(false)
    })

    test('getCanShowMetricThresholds should return false if config value for metric thresholds are disabled', () => {
      const result = getCanShowMetricThresholds({
        isMetricPacksEnabled: true,
        isMetricThresholdConfigEnabled: false,
        groupedCreatedMetrics: groupedCreatedMetricsForFailCVEnableTest,
        metricData: { Performance: true }
      })

      expect(result).toBe(false)
    })
  })
})
