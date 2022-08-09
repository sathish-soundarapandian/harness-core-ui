/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { groupedCreatedMetrics } from '@cv/pages/health-source/common/MetricThresholds/__tests__/MetricThresholds.utils.mock'
import { getDefaultMetricTypeValue, getMetricItems } from '../AppDThresholdSelectUtils'
import { metricPacksMock } from './AppDThresholdSelectUtils.mock'

describe('AppDIgnoreThresholdTabContent', () => {
  test('getMetricItems should return correct values', () => {
    const result = getMetricItems(metricPacksMock, 'Performance')
    expect(result).toEqual([{ label: 'Performance test name', value: 'Performance test name' }])
  })

  test('getMetricItems should return correct values for custom type', () => {
    const result = getMetricItems(metricPacksMock, 'Custom', 'group 1', groupedCreatedMetrics)
    expect(result).toEqual([{ label: 'test metric', value: 'test metric' }])
  })

  test('getMetricItems should return empty array for custom type whose group is not present', () => {
    const result = getMetricItems(metricPacksMock, 'Custom', 'group 2', groupedCreatedMetrics)
    expect(result).toEqual([])
  })

  test('getDefaultMetricTypeValue should return correct value', () => {
    let result = getDefaultMetricTypeValue({ Performance: false, Errors: true })

    expect(result).toBe(undefined)

    result = getDefaultMetricTypeValue({ Performance: false, Errors: true }, metricPacksMock)
    expect(result).toBe('Errors')

    result = getDefaultMetricTypeValue({ Performance: true, Errors: false }, metricPacksMock)
    expect(result).toBe('Performance')

    result = getDefaultMetricTypeValue({ Performance: false, Errors: false }, metricPacksMock)
    expect(result).toBe(undefined)
  })
})
