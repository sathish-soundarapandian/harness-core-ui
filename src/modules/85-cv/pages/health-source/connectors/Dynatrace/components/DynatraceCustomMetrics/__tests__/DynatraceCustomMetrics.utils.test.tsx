/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import {
  editQueryConfirmationDialogProps,
  getIsQueryExecuted,
  initializeCreatedMetrics,
  initializeSelectedMetricsMap,
  mapMetricSelectorsToMetricSelectorOptions,
  updateMappedMetricMap,
  updateSelectedMetricsMap
} from '@cv/pages/health-source/connectors/Dynatrace/components/DynatraceCustomMetrics/DynatraceCustomMetrics.utils'
import {
  CREATED_METRICS_WITH_DEFAULT_METRIC_MOCK,
  DEFAULT_METRIC_NAME,
  DYNATRACE_METRIC_OPTIONS_MOCK,
  DYNATRACE_METRIC_OPTIONS_WITH_NO_VALUES_MOCK,
  DYNATRACE_METRICS_SELECTORS_MOCK,
  DYNATRACE_METRICS_SELECTORS_WITH_NO_IDS_MOCK,
  MAPPED_METRICS_LIST_MOCK,
  SELECTED_AND_MAPPED_METRICS_WITH_DEFAULT_MOCK
} from '@cv/pages/health-source/connectors/Dynatrace/components/DynatraceCustomMetrics/__tests__/DynatraceCustomMetrics.mock'
import type { DynatraceMetricInfo } from '@cv/pages/health-source/connectors/Dynatrace/DynatraceHealthSource.types'
import { DynatraceHealthSourceFieldNames } from '@cv/pages/health-source/connectors/Dynatrace/DynatraceHealthSource.constants'

describe('Validate DynatraceCustomMetrics utils', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('It should initialize created metrics with provided default name when no metrics are passed', async () => {
    expect(initializeCreatedMetrics(DEFAULT_METRIC_NAME, '', new Map())).toEqual(
      CREATED_METRICS_WITH_DEFAULT_METRIC_MOCK
    )
  })

  test('It should return index of provided selected metric', async () => {
    expect(
      initializeCreatedMetrics(DEFAULT_METRIC_NAME, 'mapped_metric_2', MAPPED_METRICS_LIST_MOCK).selectedMetricIndex
    ).toEqual(1)
  })

  test('should create map with default metric when there are no metrics provided', async () => {
    expect(initializeSelectedMetricsMap(DEFAULT_METRIC_NAME, new Map())).toEqual(
      SELECTED_AND_MAPPED_METRICS_WITH_DEFAULT_MOCK
    )

    // with no map provided
    expect(initializeSelectedMetricsMap(DEFAULT_METRIC_NAME)).toEqual(SELECTED_AND_MAPPED_METRICS_WITH_DEFAULT_MOCK)
  })

  test('should select first metric', async () => {
    expect(initializeSelectedMetricsMap(DEFAULT_METRIC_NAME, MAPPED_METRICS_LIST_MOCK)).toEqual({
      selectedMetric: 'mapped_metric_1',
      mappedMetrics: MAPPED_METRICS_LIST_MOCK
    })
  })

  test('should map metric selectors to select options', async () => {
    expect(mapMetricSelectorsToMetricSelectorOptions(DYNATRACE_METRICS_SELECTORS_MOCK)).toEqual(
      DYNATRACE_METRIC_OPTIONS_MOCK
    )
    expect(mapMetricSelectorsToMetricSelectorOptions(DYNATRACE_METRICS_SELECTORS_WITH_NO_IDS_MOCK)).toEqual(
      DYNATRACE_METRIC_OPTIONS_WITH_NO_VALUES_MOCK
    )
  })

  test('should remove current metric from metric map', async () => {
    const metricInfoMock = MAPPED_METRICS_LIST_MOCK.get('mapped_metric_1')
    if (!metricInfoMock) {
      throw new Error('Cannot find mock metric info.')
    }
    const expectedMappedMetrics = new Map(MAPPED_METRICS_LIST_MOCK)
    expectedMappedMetrics.delete('mapped_metric_1')
    expect(
      updateMappedMetricMap(metricInfoMock, 'mapped_metric_1', 'mapped_metric_1', {
        selectedMetric: 'mapped_metric_1',
        mappedMetrics: MAPPED_METRICS_LIST_MOCK
      })
    ).toEqual({ selectedMetric: 'mapped_metric_1', mappedMetrics: expectedMappedMetrics })

    // removed metric is non existing metric
    expect(
      updateMappedMetricMap(metricInfoMock, 'non_existing_metric', 'mapped_metric_1', {
        selectedMetric: 'mapped_metric_1',
        mappedMetrics: MAPPED_METRICS_LIST_MOCK
      })
    ).toEqual({ selectedMetric: 'mapped_metric_1', mappedMetrics: new Map(MAPPED_METRICS_LIST_MOCK) })
  })

  test('should validate updating selected metric', async () => {
    const metricInfoMock = MAPPED_METRICS_LIST_MOCK.get('mapped_metric_1')
    if (!metricInfoMock) {
      throw new Error('Cannot find mock metric info.')
    }
    const updatedMetric = 'mapped_metric_1'
    const expectedMetricMap: Map<string, DynatraceMetricInfo> = new Map([
      [
        updatedMetric,
        {
          metricName: updatedMetric,
          identifier: updatedMetric,
          isNew: true,
          sli: false,
          continuousVerification: false,
          healthScore: false,
          groupName: { label: '', value: '' },
          metricSelector: ''
        }
      ]
    ])
    const emptyMetricMap = new Map()
    // it should create new metric and put in metric map
    expect(updateSelectedMetricsMap(updatedMetric, updatedMetric, emptyMetricMap, {})).toEqual({
      selectedMetric: updatedMetric,
      mappedMetrics: expectedMetricMap
    })

    expectedMetricMap.set('mock_metric_name', { metricName: 'mock_metric_name' })
    expect(
      updateSelectedMetricsMap(updatedMetric, updatedMetric, emptyMetricMap, { metricName: 'mock_metric_name' })
    ).toEqual({
      selectedMetric: updatedMetric,
      mappedMetrics: expectedMetricMap
    })
  })

  test('should validate dialog props', async () => {
    const expectedDialogProps = {
      titleText: 'cv.monitoringSources.prometheus.querySettingsNotEditable',
      contentText: 'cv.monitoringSources.prometheus.querySettingsSubtext',
      confirmButtonText: 'cv.proceedToEdit',
      cancelButtonText: 'cancel',
      onCloseDialog: expect.any(Function)
    }

    const setFieldMock = jest.fn()

    const editQueryDialogPropsResult = editQueryConfirmationDialogProps(val => val, setFieldMock)

    expect(editQueryDialogPropsResult).toEqual(expectedDialogProps)

    editQueryDialogPropsResult.onCloseDialog(true)
    expect(setFieldMock).toHaveBeenNthCalledWith(1, DynatraceHealthSourceFieldNames.MANUAL_QUERY, true)
    editQueryDialogPropsResult.onCloseDialog(false)
    expect(setFieldMock).toHaveBeenCalledTimes(1)
  })

  test('should validate getIsQueryExecuted', () => {
    const clearChartData = jest.fn()
    const chartData = { className: 'chart' } as any
    expect(getIsQueryExecuted(false, { metricSelector: 'dynatrace query' }, clearChartData, chartData)).toEqual(false)
    expect(getIsQueryExecuted(false, { metricSelector: 'dynatrace query' }, clearChartData)).toEqual(false)
    expect(getIsQueryExecuted(true, {}, clearChartData)).toEqual(false)
    expect(getIsQueryExecuted(true, { metricSelector: '<+input>' }, clearChartData, chartData)).toEqual(false)
    expect(
      getIsQueryExecuted(true, { metricSelector: 'dynatrace query' }, clearChartData, { className: 'chart' } as any)
    ).toEqual(true)
    expect(clearChartData).toHaveBeenCalledTimes(2)
  })
})
