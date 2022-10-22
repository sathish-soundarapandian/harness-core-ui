/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import {
  validateMappings,
  transformCustomHealthSourceToSetupSource,
  transformCustomSetupSourceToHealthSource
} from '../CustomHealthSource.utils'
import {
  customHealthSourceData,
  mappedValue,
  mockedHealthSourcePayload,
  noErrorValidatation,
  transformedSetupSource
} from './CustomHealthSource.mock'

const transformHealthSourceMap = new Map()
transformHealthSourceMap.set('CustomHealth Metric 101', mappedValue)

describe('Validate utils', () => {
  test('verify transformPrometheusHealthSourceToSetupSource', () => {
    expect(transformCustomHealthSourceToSetupSource(customHealthSourceData, false)).toEqual(transformedSetupSource)
  })

  test('verify transformCustomSetupSourceToHealthSource', () => {
    expect(
      transformCustomSetupSourceToHealthSource(
        {
          isEdit: true,
          connectorRef: 'customhealth',
          healthSourceIdentifier: 'New_Custom',
          healthSourceName: 'New Custom',
          mappedServicesAndEnvs: transformHealthSourceMap,
          ignoreThresholds: [
            {
              criteria: { spec: { greaterThan: 15, lessThan: 122 }, type: 'Absolute' },
              metricName: 'Prometheus Metric',
              metricType: 'Custom',
              spec: { action: 'Ignore' },
              type: 'IgnoreThreshold'
            }
          ],
          failFastThresholds: [
            {
              criteria: { criteriaPercentageType: 'greaterThan', spec: { greaterThan: 1222 }, type: 'Percentage' },
              metricName: 'Prometheus Metric',
              metricType: 'Custom',
              spec: { action: 'FailAfterOccurrence', spec: { count: 12 } },
              type: 'FailImmediately'
            }
          ]
        },
        true
      )
    ).toEqual(mockedHealthSourcePayload)
  })

  test('should verify validateMappings', () => {
    expect(validateMappings(val => val, ['CustomHealth Metric 101'], 0, noErrorValidatation as any)).toEqual({})
  })

  test('should validate queryType and requestMethodAreThere', () => {
    expect(
      validateMappings(val => val, ['CustomHealth Metric 101'], 0, {
        ...noErrorValidatation,
        pathURL: 'solo-dolo?endTime=2234&startTime=243',
        requestMethod: null,
        queryType: null,
        endTime: {
          placeholder: 'end_time',
          timestampFormat: 'MILLISECONDS'
        },
        startTime: {
          placeholder: 'start_time',
          timestampFormat: 'MILLISECONDS'
        }
      } as any)
    ).toEqual({
      pathURL: 'cv.customHealthSource.Querymapping.validation.pathWithoutPlaceholder',
      queryType: 'cv.customHealthSource.Querymapping.validation.queryType',
      requestMethod: 'connectors.customHealth.requestMethod'
    })
  })

  test('Validate end and start time placeholder', async () => {
    // path url should include placeholders
    expect(
      validateMappings(val => val, ['CustomHealth Metric 101'], 0, {
        ...noErrorValidatation,
        pathURL: 'solo-dolo?endTime=2234&startTime=243',
        endTime: {
          placeholder: 'end_time',
          timestampFormat: 'MILLISECONDS'
        },
        startTime: {
          placeholder: 'start_time',
          timestampFormat: 'MILLISECONDS'
        }
      } as any)
    ).toEqual({ pathURL: 'cv.customHealthSource.Querymapping.validation.pathWithoutPlaceholder' })

    // path url should include placeholders
    expect(
      validateMappings(val => val, ['CustomHealth Metric 101'], 0, {
        ...noErrorValidatation,
        pathURL: 'solo-dolo?endTime=end_time&startTime=243',
        endTime: {
          placeholder: 'end_time',
          timestampFormat: 'MILLISECONDS'
        },
        startTime: {
          placeholder: 'start_time',
          timestampFormat: 'MILLISECONDS'
        }
      } as any)
    ).toEqual({ pathURL: 'cv.customHealthSource.Querymapping.validation.pathWithoutPlaceholder' })

    // placeholders in body not in url
    expect(
      validateMappings(val => val, ['CustomHealth Metric 101'], 0, {
        ...noErrorValidatation,
        pathURL: 'solo-dolo?endTime=end_time&startTime=243',
        query: 'sdffsfdf?end_time=sdf&start_time=23weewr',
        endTime: {
          placeholder: 'end_time',
          timestampFormat: 'MILLISECONDS'
        },
        startTime: {
          placeholder: 'start_time',
          timestampFormat: 'MILLISECONDS'
        }
      } as any)
    ).toEqual({})

    // placeholders are the same
    expect(
      validateMappings(val => val, ['CustomHealth Metric 101'], 0, {
        ...noErrorValidatation,
        pathURL: 'solo-dolo?endTime=now&startTime=now',
        endTime: {
          placeholder: 'now',
          timestampFormat: 'MILLISECONDS'
        },
        startTime: {
          placeholder: 'now',
          timestampFormat: 'MILLISECONDS'
        }
      } as any)
    ).toEqual({ 'startTime.placeholder': 'cv.customHealthSource.Querymapping.validation.startAndEndTime' })

    // placeholders must be included
    expect(
      validateMappings(val => val, ['CustomHealth Metric 101'], 0, {
        ...noErrorValidatation,
        pathURL: 'solo-dolo?endTime=now&startTime=now',
        endTime: null,
        startTime: null
      } as any)
    ).toEqual({
      'endTime.placeholder': 'cv.customHealthSource.Querymapping.validation.endTime.placeholder',
      'endTime.timestampFormat': 'cv.customHealthSource.Querymapping.validation.endTime.timestamp',
      'startTime.placeholder': 'cv.customHealthSource.Querymapping.validation.startTime.placeholder',
      'startTime.timestampFormat': 'cv.customHealthSource.Querymapping.validation.startTime.timestamp'
    })
  })
})
