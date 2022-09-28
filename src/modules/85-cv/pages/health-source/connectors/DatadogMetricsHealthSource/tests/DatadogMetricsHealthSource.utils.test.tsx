/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import {
  getIsAllIDsUnique,
  getCustomCreatedMetrics,
  getSelectedDashboards,
  mapDatadogMetricHealthSourceToDatadogMetricSetupSource,
  mapDatadogMetricSetupSourceToDatadogHealthSource,
  mapSelectedWidgetDataToDatadogMetricInfo,
  validate
} from '@cv/pages/health-source/connectors/DatadogMetricsHealthSource/DatadogMetricsHealthSource.utils'
import {
  DatadogMetricsHealthSourceMock,
  DatadogMetricsMockHealthSourceData,
  DatadogMetricsSetupSource,
  EXPECTED_DATADOG_METRIC_INFO,
  METRIC_VALIDATION_RESULT,
  MOCK_CUSTOM_CREATED_METRICS_LIST,
  MOCK_SELECTED_DASHBOARDS_WIDGETS,
  MOCK_SELECTED_WIDGET_DATA
} from '@cv/pages/health-source/connectors/DatadogMetricsHealthSource/tests/mock'
import type { DatadogMetricInfo } from '@cv/pages/health-source/connectors/DatadogMetricsHealthSource/DatadogMetricsHealthSource.type'

describe('Validate DatadogMetricsHealthSource Utils', () => {
  test('validate health source data to DatadogSetupSource mapping', () => {
    expect(mapDatadogMetricHealthSourceToDatadogMetricSetupSource(DatadogMetricsMockHealthSourceData, false)).toEqual(
      DatadogMetricsSetupSource
    )
  })
  test('validate DatadogSetupSource to HealthSource mapping', () => {
    expect(mapDatadogMetricSetupSourceToDatadogHealthSource(DatadogMetricsSetupSource, false)).toEqual(
      DatadogMetricsHealthSourceMock
    )
  })
  test('it should return expected number of custom created metrics', () => {
    expect(getCustomCreatedMetrics(DatadogMetricsSetupSource.metricDefinition)).toEqual(
      MOCK_CUSTOM_CREATED_METRICS_LIST
    )
  })
  test('it should extract selected dashboards from source data and map them to MetricDashboardItems', () => {
    expect(getSelectedDashboards(DatadogMetricsSetupSource)).toEqual(MOCK_SELECTED_DASHBOARDS_WIDGETS)
  })

  test('it should map SelectedMetricWidgetData to DatadogMetricInfo', () => {
    expect(
      mapSelectedWidgetDataToDatadogMetricInfo(
        MOCK_SELECTED_WIDGET_DATA,
        'avg:datadog.agent.running{*} by {host}.rollup(avg, 60)',
        []
      )
    ).toEqual(EXPECTED_DATADOG_METRIC_INFO)
  })

  test('should detect identifier duplicates', () => {
    const metricWithSameIdentifierToCheck = {
      ...DatadogMetricsSetupSource.metricDefinition.get('mock_metric_path'),
      metricPath: 'mock_metric_path_changed',
      ignoreThresholds: [],
      failFastThresholds: []
    }
    DatadogMetricsSetupSource.metricDefinition.set('mock_metric_path_changed', metricWithSameIdentifierToCheck)
    expect(getIsAllIDsUnique(DatadogMetricsSetupSource.metricDefinition, metricWithSameIdentifierToCheck!)).toEqual(
      false
    )
  })

  test('should validate that all ids are unique', () => {
    const metricWithDiffIdentifierToCheck = {
      ...DatadogMetricsSetupSource.metricDefinition.get('mock_metric_path'),
      identifier: 'unique_identifier',
      metricPath: 'mock_metric_path_changed',
      ignoreThresholds: [],
      failFastThresholds: []
    }
    DatadogMetricsSetupSource.metricDefinition.set('mock_metric_path_changed', metricWithDiffIdentifierToCheck)
    expect(getIsAllIDsUnique(DatadogMetricsSetupSource.metricDefinition, metricWithDiffIdentifierToCheck)).toEqual(true)
  })

  test('should validate all required fields for metrics', () => {
    const getStringMock = jest.fn()
    getStringMock.mockReturnValueOnce('query not valid')
    getStringMock.mockReturnValueOnce('SLI, CV or HealthScore must be selected')
    getStringMock.mockReturnValueOnce('metricName not valid')
    getStringMock.mockReturnValueOnce('metric not valid')
    getStringMock.mockReturnValueOnce('groupName not valid')

    const metricToCheck: DatadogMetricInfo = {
      ...DatadogMetricsSetupSource.metricDefinition.get('mock_metric_path'),
      identifier: 'unique_identifier',
      metricPath: 'mock_metric_path_changed',
      query: '', // pass empty query for validation
      metricName: '',
      metric: '',
      groupName: { label: '', value: '' },
      ignoreThresholds: [],
      failFastThresholds: []
    }
    const allSelectedMetrics = DatadogMetricsSetupSource.metricDefinition
    allSelectedMetrics.set('mock_metric_path_changed', metricToCheck)
    // should give us error for empty query
    expect(validate(metricToCheck, allSelectedMetrics, getStringMock, false)).toEqual({
      ...METRIC_VALIDATION_RESULT,
      query: 'query not valid',
      sli: 'SLI, CV or HealthScore must be selected',
      metricName: 'metricName not valid',
      metric: 'metric not valid',
      groupName: 'groupName not valid'
    })
  })
})
