/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { initHealthSourceCustomFormValue } from '@cv/pages/health-source/connectors/CommonHealthSource/components/CustomMetricForm/CustomMetricFormContainer.utils'
import { updateSelectedMetricsMap } from '../CommonCustomMetric.utils'
import { mappedMetricsMap, formikValues, expectedMappedMetrics } from './CommonCustomMetric.mock'

describe('Validate  utils functions', () => {
  const initCustomForm = initHealthSourceCustomFormValue()
  test('should validate with isPrimaryMetric', () => {
    // isPrimaryMetric true
    const withIsPrimaryMetric = updateSelectedMetricsMap({
      updatedMetric: 'appdMetric 101',
      oldMetric: 'appdMetric',
      mappedMetrics: mappedMetricsMap,
      formikValues,
      initCustomForm,
      isPrimaryMetric: true
    })
    const data: any = withIsPrimaryMetric.mappedMetrics.get('appdMetric 101')
    expect(withIsPrimaryMetric.selectedMetric).toEqual('appdMetric 101')
    expect(data?.metricIdentifier).toEqual('appdMetric_101')
    expect(data?.identifier).toEqual('appdMetric_101')
  })
  test('should validate updateSelectedMetricsMap', () => {
    const { selectedMetric, mappedMetrics } = updateSelectedMetricsMap({
      updatedMetric: 'appdMetric new',
      oldMetric: 'appdMetric',
      mappedMetrics: mappedMetricsMap,
      formikValues,
      initCustomForm
    })
    expect(selectedMetric).toEqual('appdMetric new')
    expect(mappedMetrics).toEqual(expectedMappedMetrics)
    // Empty Name
    formikValues.metricName = ''
    const noName = updateSelectedMetricsMap({
      updatedMetric: 'appdMetric new',
      oldMetric: 'appdMetric',
      mappedMetrics: mappedMetricsMap,
      formikValues,
      initCustomForm
    })
    expect(noName.selectedMetric).toEqual('appdMetric new')
    expect(noName.mappedMetrics).toEqual(mappedMetricsMap)

    // Duplicate Name
    formikValues.metricName = 'appdMetric new'
    const duplicateName = updateSelectedMetricsMap({
      updatedMetric: 'appdMetric new',
      oldMetric: 'appdMetric',
      mappedMetrics: mappedMetricsMap,
      formikValues,
      initCustomForm
    })
    expect(duplicateName.selectedMetric).toEqual('appdMetric new')
    expect(duplicateName.mappedMetrics).toEqual(mappedMetricsMap)
  })
})
