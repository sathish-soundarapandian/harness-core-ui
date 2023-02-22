/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { StringKeys } from 'framework/strings'
import type { PrometheusSetupSource } from '../PrometheusHealthSource.constants'
import { transformPrometheusSetupSourceToHealthSource, validateAssginComponent } from '../PrometheusHealthSource.utils'
import {
  dataSourceTypePayloadMock,
  expectedAWSPrometheusPayload,
  expectedResultPrometheusPayload,
  sourceDataPrometheusPayload
} from './PrometheusHealthSource.mock'

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

  test('prometheus payload with metric thresholds', () => {
    expect(transformPrometheusSetupSourceToHealthSource(sourceDataPrometheusPayload as PrometheusSetupSource)).toEqual(
      expectedResultPrometheusPayload
    )
  })

  test('prometheus payload with data source type as AWS Prometheus', () => {
    expect(transformPrometheusSetupSourceToHealthSource(dataSourceTypePayloadMock)).toEqual(
      expectedAWSPrometheusPayload
    )
  })
})
