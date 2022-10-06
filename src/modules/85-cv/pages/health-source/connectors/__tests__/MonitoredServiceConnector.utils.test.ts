/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import * as cvServices from 'services/cv'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import type { MetricPackDTOArrayRequestBody } from 'services/cv'
import { HealthSoureSupportedConnectorTypes } from '../MonitoredServiceConnector.constants'
import { createMetricDataFormik, validateMetrics, getOptions } from '../MonitoredServiceConnector.utils'
import {
  appdMetricData,
  metricData,
  metricPack,
  mockValidationResult,
  queryParam
} from './MonitoredServiceConnector.mock'

describe('Validate util function', () => {
  test('Validate createMetricDataFormik', () => {
    expect(createMetricDataFormik(metricPack?.resource as MetricPackDTOArrayRequestBody)).toEqual({ Performance: true })
    expect(createMetricDataFormik()).toEqual({})
  })

  test('Validate getOptions', () => {
    const resultNewrelic = [{ label: 'test', value: 12 }]
    const valueNewrelic = [{ applicationName: 'test', applicationId: 12 }]
    const valueOthers = [{ name: 'test', id: 12 }]

    expect(
      getOptions(false, valueNewrelic, HealthSoureSupportedConnectorTypes.NEW_RELIC, (val: string) => val)
    ).toEqual(resultNewrelic)
    expect(getOptions(false, valueOthers, HealthSoureSupportedConnectorTypes.DYNATRACE, (val: string) => val)).toEqual(
      resultNewrelic
    )
    expect(getOptions(true, {}, '', (val: string) => val)).toEqual([{ label: 'loading', value: '' }])
  })

  test('Validate validateMetrics NewRelic', async () => {
    jest
      .spyOn(cvServices, 'getNewRelicMetricDataPromise')
      .mockImplementation(() => ({ error: null, data: { ...metricData.data } } as any))
    const { validationStatus, validationResult } = await validateMetrics(
      metricPack.resource as MetricPackDTOArrayRequestBody,
      queryParam,
      HealthSoureSupportedConnectorTypes.NEW_RELIC
    )
    expect(validationStatus).toEqual('success')
    expect(validationResult).toEqual(mockValidationResult)
  })

  test('Validate validateMetrics DYNATRACE', async () => {
    jest
      .spyOn(cvServices, 'getDynatraceMetricDataPromise')
      .mockImplementation(() => ({ error: null, data: [{ ...metricData.data }] } as any))
    const { validationStatus, validationResult } = await validateMetrics(
      metricPack.resource as MetricPackDTOArrayRequestBody,
      queryParam,
      HealthSoureSupportedConnectorTypes.DYNATRACE
    )
    expect(validationStatus).toEqual('success')
    expect(validationResult).toEqual(mockValidationResult)
  })

  test('Validate validateMetrics AppD', async () => {
    jest
      .spyOn(cvServices, 'getAppDynamicsMetricDataPromise')
      .mockImplementation(() => ({ error: null, data: [{ ...appdMetricData }] } as any))
    const { validationStatus, validationResult } = await validateMetrics(
      metricPack.resource as MetricPackDTOArrayRequestBody,
      queryParam,
      HealthSoureSupportedConnectorTypes.APP_DYNAMICS
    )
    expect(validationStatus).toEqual('success')
    expect(validationResult).toEqual([{ ...appdMetricData }])
  })

  test('Validate validateMetrics AppD with failure', async () => {
    jest
      .spyOn(cvServices, 'getAppDynamicsMetricDataPromise')
      .mockImplementation(() => ({ status: 'ERROR', data: { message: 'has error' } } as any))
    const validationWithError = await validateMetrics(
      metricPack.resource as MetricPackDTOArrayRequestBody,
      queryParam,
      HealthSoureSupportedConnectorTypes.APP_DYNAMICS
    )

    expect(validationWithError.validationStatus).toEqual(undefined)
    expect(validationWithError.error).toEqual(
      getErrorMessage({ data: { status: 'ERROR', data: { message: 'has error' } } })
    )
  })
})
