/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { StringKeys } from 'framework/strings'
import { createNewRelicData, createNewRelicPayload } from '../NewRelicHealthSourceContainer.util'
import { initializeSelectedMetricsMap, validateMapping } from '../NewRelicHealthSource.utils'
import {
  sourceData,
  expectedNewRelicData,
  validationMissingApplication,
  validationMissingMetricData,
  validationValidPayload,
  mockedNewRelicFormikValues,
  expectedMappedValue,
  mappedValue,
  newRelicPayload,
  newRelicExpectedPayload
} from './NewRelic.mock'

function getString(key: StringKeys): StringKeys {
  return key
}

describe('Test Newrelic Utils', () => {
  test('Verify createNewRelicData', () => {
    expect(createNewRelicData(sourceData)).toEqual(expectedNewRelicData)
  })

  test('Verify validate function', () => {
    expect(validateMapping(validationMissingApplication, [], 0, getString, false)).toEqual({
      newRelicApplication: 'cv.healthSource.connectors.NewRelic.validations.application'
    })
    expect(validateMapping(validationMissingMetricData, [], 0, getString, false)).toEqual({
      metricData: 'cv.monitoringSources.appD.validations.selectMetricPack'
    })
    expect(validateMapping(validationValidPayload, [], 0, getString, false)).toEqual({})
  })

  test('Verify initializeSelectedMetricsMap method', () => {
    const defaultSelectedMetricName = 'New Relic Metric'
    const mappedServicesAndEnvs = new Map()
    mappedServicesAndEnvs.set(defaultSelectedMetricName, mappedValue)

    const expectedMappedMetrics = new Map()
    expectedMappedMetrics.set(defaultSelectedMetricName, expectedMappedValue)

    expect(initializeSelectedMetricsMap(defaultSelectedMetricName, mappedServicesAndEnvs)).toEqual({
      mappedMetrics: expectedMappedMetrics,
      selectedMetric: defaultSelectedMetricName
    })
  })

  test('Verify validateMapping method, that is no errors should be thrown when all the validation passes.', () => {
    const createdMetrics = ['New Relic Metric']
    const selectedMetricIndex = 0
    expect(validateMapping(mockedNewRelicFormikValues, createdMetrics, selectedMetricIndex, getString, false)).toEqual(
      {}
    )
  })

  test('should validate createNewRelicPayload', () => {
    expect(createNewRelicPayload(newRelicPayload, true)).toEqual(newRelicExpectedPayload)
  })
})
