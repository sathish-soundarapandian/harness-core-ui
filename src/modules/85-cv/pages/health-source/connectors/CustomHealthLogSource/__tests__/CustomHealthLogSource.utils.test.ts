/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { cloneDeep } from 'lodash-es'
import { Utils } from '@harness/uicore'
import { waitFor } from '@testing-library/react'
import {
  validateSetupSource,
  initializeSelectedQueryMap,
  transformSetupSourceToHealthSource,
  submitForm,
  updateSelectedMetricsMap
} from '../CustomHealthLogSource.utils'
import {
  customHealthLogSetupSource,
  sourceData,
  setupSource,
  setupSourceToHealthSourceMock,
  mappedQueries,
  onSubmitMock
} from './CustomHealthLogSource.mocks'

describe('Unit tests for customhealthsourcelogutils', () => {
  test('ensure validateSetupSource works correctly', async () => {
    // unique name
    expect(
      validateSetupSource(
        customHealthLogSetupSource,
        jest.fn().mockImplementation(str => str),
        ['query1', 'query2', 'query3'],
        1
      )
    ).toEqual({
      queryName: 'cv.monitoringSources.gcoLogs.validation.queryNameUnique'
    })

    // non existent queryName
    const clonedData = cloneDeep(customHealthLogSetupSource)
    clonedData.queryName = ''
    expect(
      validateSetupSource(
        clonedData,
        jest.fn().mockImplementation(str => str),
        ['query1', 'query2', 'query3'],
        1
      )
    ).toEqual({
      queryName: 'cv.customHealthSource.Querymapping.validation.queryName'
    })

    const dataWithoutServiceInstance = cloneDeep(customHealthLogSetupSource)
    dataWithoutServiceInstance.timestampJsonPath = ''
    dataWithoutServiceInstance.serviceInstanceJsonPath = undefined
    dataWithoutServiceInstance.queryValueJsonPath = ''
    expect(
      validateSetupSource(
        dataWithoutServiceInstance,
        jest.fn().mockImplementation(str => str),
        ['query1', 'query2', 'query3'],
        1
      )
    ).toEqual({
      queryValueJsonPath: 'cv.customHealthSource.Querymapping.validation.logMessageJsonPath',
      timestampJsonPath: 'cv.customHealthSource.Querymapping.validation.timestampJsonPath',
      serviceInstanceJsonPath: 'cv.monitoringSources.prometheus.validation.serviceInstanceIdentifier',
      queryName: 'cv.monitoringSources.gcoLogs.validation.queryNameUnique'
    })
  })

  test('ensure initializeSelectedQueryMap works correctly', async () => {
    jest.spyOn(Utils, 'randomId').mockReturnValue('123')

    // with no data
    const clonedData = cloneDeep(sourceData)
    clonedData.healthSourceList = []
    expect(initializeSelectedQueryMap(clonedData)).toEqual({
      mappedQueries: new Map([
        [
          'Custom Log Query_123',
          {
            endTime: {
              placeholder: '',
              timestampFormat: 'SECONDS'
            },
            pathURL: '',
            queryName: 'Custom Log Query_123',
            queryValueJsonPath: '',
            requestMethod: 'GET',
            serviceInstanceJsonPath: '',
            startTime: {
              placeholder: '',
              timestampFormat: 'SECONDS'
            },
            timestampJsonPath: ''
          }
        ]
      ]),
      selectedQuery: 'Custom Log Query_123'
    })

    // with existing data
    expect(initializeSelectedQueryMap(sourceData)).toEqual({
      mappedQueries: new Map([
        [
          'customLog',
          {
            endTime: {
              customTimestampFormat: null,
              placeholder: 'endTime',
              timestampFormat: 'MILLISECONDS'
            },
            pathURL:
              'rest/applications/cv-app/metric-data?metric-path=Overall%20Application%20Performance%7Cdocker-tier%7CAverage%20Response%20Time%20%28ms%29&time-range-type=BETWEEN_TIMES&start-time=startTime&end-time=endTime&rollup=false&output=json',
            query: null,
            queryName: 'customLog',
            queryValueJsonPath: '$.[*].metricValues.[*].current',
            requestMethod: 'GET',
            serviceInstanceJsonPath: '$.[*].metricName',
            startTime: {
              customTimestampFormat: null,
              placeholder: 'startTime',
              timestampFormat: 'MILLISECONDS'
            },
            timestampJsonPath: '$.[*].metricValues.[*].startTimeInMillis'
          }
        ],
        [
          'customLog5',
          {
            endTime: {
              customTimestampFormat: null,
              placeholder: 'end___time',
              timestampFormat: 'MILLISECONDS'
            },
            pathURL:
              'rest/applications/cv-app/metric-data?metric-path=Overall%20Application%20Performance%7Cdocker-tier%7CAverage%20Response%20Time%20%28ms%29&time-range-type=BETWEEN_TIMES&start-time=start___time&end-time=end___time&rollup=false&output=json',
            query: null,
            queryName: 'customLog5',
            queryValueJsonPath: '$.[*].metricValues.[*].value',
            requestMethod: 'GET',
            serviceInstanceJsonPath: '$.[*].metricName',
            startTime: {
              customTimestampFormat: null,
              placeholder: 'start___time',
              timestampFormat: 'MILLISECONDS'
            },
            timestampJsonPath: '$.[*].metricValues.[*].startTimeInMillis'
          }
        ],
        [
          'customLog_2',
          {
            endTime: {
              customTimestampFormat: null,
              placeholder: 'end_time',
              timestampFormat: 'MILLISECONDS'
            },
            pathURL:
              'rest/applications/cv-app/metric-data?metric-path=Overall%20Application%20Performance%7Cdocker-tier%7CAverage%20Response%20Time%20%28ms%29&time-range-type=BETWEEN_TIMES&start-time=start_time&end-time=end_time&rollup=false&output=json',
            query: null,
            queryName: 'customLog_2',
            queryValueJsonPath: '$.[*].metricValues.[*].value',
            requestMethod: 'GET',
            serviceInstanceJsonPath: '$.[*].metricName',
            startTime: {
              customTimestampFormat: null,
              placeholder: 'start_time',
              timestampFormat: 'MILLISECONDS'
            },
            timestampJsonPath: '$.[*].metricValues.[*].startTimeInMillis'
          }
        ]
      ]),
      selectedQuery: 'customLog'
    })
  })

  test('ensure transformSetupSourceToHealthSource works correctly', async () => {
    expect(transformSetupSourceToHealthSource(setupSource, 'account.appd', 'customAppd', 'customLog')).toEqual(
      setupSourceToHealthSourceMock
    )
  })

  test('ensure submitForm works correctly', async () => {
    const onSubmitMockFn = jest.fn()
    await waitFor(() =>
      submitForm({
        formikProps: { setTouched: jest.fn(), validateForm: jest.fn(), values: mappedQueries.get('customLog') } as any,
        onSubmit: onSubmitMockFn,
        sourceData: sourceData as any,
        mappedQueries: mappedQueries as any,
        getString: jest.fn(str => str),
        selectedIndex: 0,
        createdQueries: ['customLog', 'customLog5', 'customLog_2']
      })
    )
    expect(onSubmitMockFn).toHaveBeenCalledWith(onSubmitMock[0], onSubmitMock[1])

    // form is invalid expect on submit to not be called
    const clonedMap = cloneDeep(mappedQueries)
    clonedMap.get('customLog')!.startTime = { timestampFormat: '', placeholder: '', customTimestampFormat: null }
    await waitFor(() =>
      submitForm({
        formikProps: { setTouched: jest.fn(), validateForm: jest.fn(), values: clonedMap.get('customLog') } as any,
        onSubmit: onSubmitMockFn,
        sourceData: sourceData as any,
        mappedQueries: mappedQueries as any,
        getString: jest.fn(str => str),
        selectedIndex: 0,
        createdQueries: ['customLog', 'customLog5', 'customLog_2']
      })
    )
    expect(onSubmitMockFn).toBeCalledTimes(1)
  })

  test('Ensure update map works correctly', async () => {
    expect(
      updateSelectedMetricsMap({
        updatedQueryName: 'Custom Log Query_123',
        oldQueryName: 'Custom Log Query_123',
        mappedQuery: new Map([
          [
            'Custom Log Query_123',
            {
              endTime: {
                placeholder: '',
                timestampFormat: 'SECONDS'
              },
              pathURL: 'asdad',
              queryName: 'Custom Log Query_123',
              queryValueJsonPath: '',
              requestMethod: 'POST',
              serviceInstanceJsonPath: '',
              startTime: {
                placeholder: '',
                timestampFormat: 'SECONDS'
              },
              timestampJsonPath: '$[0].sdf'
            }
          ]
        ]),
        formikProps: {
          values: {
            queryName: 'Custom Log Query_123'
          }
        } as any
      })
    ).toEqual({
      mappedQueries: new Map([['Custom Log Query_123', { queryName: 'Custom Log Query_123' }]]),
      selectedQuery: 'Custom Log Query_123'
    })

    expect(
      updateSelectedMetricsMap({
        updatedQueryName: 'solo',
        oldQueryName: 'Custom Log Query_123',
        mappedQuery: new Map([
          [
            'Custom Log Query_123',
            {
              endTime: {
                placeholder: '',
                timestampFormat: 'SECONDS'
              },
              pathURL: '',
              queryName: 'Custom Log Query_123',
              queryValueJsonPath: '',
              requestMethod: 'GET',
              serviceInstanceJsonPath: '',
              startTime: {
                placeholder: '',
                timestampFormat: 'SECONDS'
              },
              timestampJsonPath: ''
            }
          ]
        ]),
        formikProps: jest.fn() as any
      })
    ).toEqual({
      mappedQueries: new Map([
        [
          'solo',
          {
            endTime: { placeholder: '', timestampFormat: 'SECONDS' },
            pathURL: '',
            queryName: 'solo',
            queryValueJsonPath: '',
            requestMethod: 'GET',
            serviceInstanceJsonPath: '',
            startTime: { placeholder: '', timestampFormat: 'SECONDS' },
            timestampJsonPath: ''
          }
        ]
      ]),
      selectedQuery: 'solo'
    })
  })
})
