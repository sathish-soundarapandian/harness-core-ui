/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { MapSplunkToServiceFieldNames } from '../constants'
import { validateMappings, updateSelectedMetricsMap } from '../utils'

function mockGetString(name: string): string {
  switch (name) {
    case 'cv.monitoringSources.metricNameValidation':
      return MapSplunkToServiceFieldNames.METRIC_NAME
    case 'cv.monitoringSources.gcoLogs.validation.serviceInstance':
      return MapSplunkToServiceFieldNames.SERVICE_INSTANCE
    case 'cv.monitoringSources.gco.manualInputQueryModal.validation.query':
      return MapSplunkToServiceFieldNames.QUERY
    default:
      return ''
  }
}

describe('Unit tests for MapQueriesToHarnessService', () => {
  test('Ensure validation returns correctly', () => {
    // no values
    expect(validateMappings(mockGetString as any, [], 0)).toEqual({
      query: MapSplunkToServiceFieldNames.QUERY,
      serviceInstance: MapSplunkToServiceFieldNames.SERVICE_INSTANCE,
      metricName: ''
    })

    // some values
    expect(
      validateMappings(mockGetString as any, [], 0, {
        query: 'Test',
        metricName: 'adasd'
      })
    ).toEqual({
      serviceInstance: MapSplunkToServiceFieldNames.SERVICE_INSTANCE
    })

    // nonunique metricName
    expect(
      validateMappings(mockGetString as any, ['metric1', 'metric4'], 0, {
        query: 'sdfsdf',
        metricName: 'metric4'
      })
    ).toEqual({
      serviceInstance: MapSplunkToServiceFieldNames.SERVICE_INSTANCE,
      metricName: ''
    })
  })

  test('Ensure switching to a new app is handled correctly', () => {
    // user updates currently selected metric name and adds new metric4
    expect(
      updateSelectedMetricsMap({
        updatedMetric: 'metric4',
        oldMetric: 'metric1',
        mappedMetrics: new Map([
          [
            'metric1',
            {
              metricName: 'metric1',
              query: 'test query',
              serviceInstance: 'service-instance',
              recordCount: 0
            }
          ]
        ]),
        formikProps: { values: { metricName: 'metric', query: '' } } as any
      })
    ).toEqual({
      mappedMetrics: new Map([
        [
          'metric4',
          {
            metricName: 'metric4',
            query: '',
            serviceInstance: '',
            recordCount: 0
          }
        ],
        [
          'metric',
          {
            metricName: 'metric',
            query: ''
          }
        ]
      ]),
      selectedMetric: 'metric4'
    })

    //user updates selected metric to an already existing one
    expect(
      updateSelectedMetricsMap({
        updatedMetric: 'metric4',
        oldMetric: 'metric1',
        mappedMetrics: new Map([
          [
            'metric1',
            {
              metricName: 'metric',
              query: 'test query',
              serviceInstance: 'service-instance',

              recordCount: 0
            }
          ]
        ]),
        formikProps: { values: { metricName: 'metric', query: '' } } as any
      })
    ).toEqual({
      mappedMetrics: new Map([
        [
          'metric4',
          {
            metricName: 'metric4',
            query: '',
            serviceInstance: '',

            recordCount: 0
          }
        ],
        [
          'metric',
          {
            metricName: 'metric',
            query: ''
          }
        ]
      ]),
      selectedMetric: 'metric4'
    })

    // user updates data for current selected one and adds a new one
    expect(
      updateSelectedMetricsMap({
        updatedMetric: 'metric6',
        oldMetric: 'metric',
        mappedMetrics: new Map([
          [
            'metric',
            {
              metricName: 'metric',
              query: 'sd'
            }
          ]
        ]),
        formikProps: {
          values: {
            metricName: 'metric',
            query: 'test query',
            serviceInstance: 'service-instance',

            recordCount: 0
          }
        } as any
      })
    ).toEqual({
      mappedMetrics: new Map([
        [
          'metric',
          {
            metricName: 'metric',
            query: 'test query',
            serviceInstance: 'service-instance',

            recordCount: 0
          }
        ],
        [
          'metric6',
          {
            metricName: 'metric6',
            query: '',
            serviceInstance: '',

            recordCount: 0
          }
        ]
      ]),
      selectedMetric: 'metric6'
    })
  })
})
