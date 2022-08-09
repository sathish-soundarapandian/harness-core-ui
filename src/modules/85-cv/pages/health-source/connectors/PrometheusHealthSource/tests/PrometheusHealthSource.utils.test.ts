/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { StringKeys } from 'framework/strings'
import type { TimeSeriesMetricPackDTO } from 'services/cv'
import { metricThresholdsPayloadMockData } from '../../AppDynamics/__tests__/AppDMonitoredSource.mock'
import type { PrometheusSetupSource } from '../PrometheusHealthSource.constants'
import {
  getFilteredMetricThresholdValues,
  transformPrometheusSetupSourceToHealthSource,
  validateAssginComponent
} from '../PrometheusHealthSource.utils'
import { expectedResultPrometheusPayload, sourceDataPrometheusPayload } from './PrometheusHealthSource.mock'

function getString(key: StringKeys): StringKeys {
  return key
}

const assignData = {
  sli: false,
  continuousVerification: false,
  healthScore: false,
  riskCategory: '',
  lowerBaselineDeviation: false,
  higherBaselineDeviation: false
}
describe('Validate Prometheus Utils', () => {
  test('should validate assgincomponent when checkbox is selected ', () => {
    const error = validateAssginComponent(assignData as any, {}, getString)
    expect(error).toEqual({
      sli: 'cv.monitoringSources.gco.mapMetricsToServicesPage.validation.baseline'
    })
  })
  test('should validate assgincomponent when only SLI is true', () => {
    const error = validateAssginComponent({ ...assignData, sli: true } as any, {}, getString)
    expect(error).toEqual({})
  })
  test('should validate assgincomponent when only continuousVerification and  healthScore are true but no riskCategory selected', () => {
    const error = validateAssginComponent(
      { ...assignData, continuousVerification: true, healthScore: true } as any,
      {},
      getString
    )
    expect(error).toEqual({
      lowerBaselineDeviation: 'cv.monitoringSources.prometheus.validation.deviation',
      riskCategory: 'cv.monitoringSources.gco.mapMetricsToServicesPage.validation.riskCategory'
    })
  })

  test('should test getFilteredMetricThresholdValues', () => {
    const result = getFilteredMetricThresholdValues(
      'IgnoreThreshold',
      metricThresholdsPayloadMockData as TimeSeriesMetricPackDTO[]
    )

    expect(result).toEqual([
      {
        criteria: { criteriaPercentageType: 'greaterThan', spec: { greaterThan: 12 }, type: 'Percentage' },
        groupName: 'testP',
        metricName: 'stall_count',
        metricType: 'Custom',
        spec: { action: 'Ignore' },
        type: 'IgnoreThreshold'
      }
    ])
  })

  test('prometheus payload with metric thresholds', () => {
    expect(
      transformPrometheusSetupSourceToHealthSource(sourceDataPrometheusPayload as PrometheusSetupSource, true)
    ).toEqual(expectedResultPrometheusPayload)
  })

  test('prometheus payload without metric thresholds', () => {
    expect(
      transformPrometheusSetupSourceToHealthSource(sourceDataPrometheusPayload as PrometheusSetupSource, false)
    ).toEqual({
      identifier: 'test',
      name: 'test',
      spec: { connectorRef: 'testprometheus2', feature: 'apm', metricDefinitions: [], metricPacks: [] },
      type: 'Prometheus'
    })
  })
})
