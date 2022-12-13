/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { MetricThresholdType } from '@cv/pages/health-source/connectors/AppDynamics/AppDHealthSource.types'
import type { TimeSeriesMetricPackDTO } from 'services/cv'
import type { GroupedCreatedMetrics } from '../../CustomMetric/CustomMetric.types'

import { MetricCriteriaValues } from '../MetricThresholds.constants'
import type { ThresholdsPropertyNames } from '../MetricThresholds.types'
import {
  checkDuplicate,
  getActionItems,
  getCriterialItems,
  getCustomMetricGroupNames,
  getDefaultMetricTypeValue,
  getDefaultValueForMetricType,
  getFilteredCVDisabledMetricThresholds,
  getFilteredMetricThresholdValues,
  getGroupDropdownOptions,
  getIsMetricPacksSelected,
  getIsMetricThresholdCanBeShown,
  getIsRemovedMetricNameContainsMetricThresholds,
  getIsRemovedMetricPackContainsMetricThresholds,
  getMetricItems,
  getMetricItemsForOnlyCustomMetrics,
  getMetricNameItems,
  getMetricPacksForPayload,
  getMetricsWithCVEnabled,
  getMetricThresholdsCustomFiltered,
  isGivenMetricNameContainsThresholds,
  isGivenMetricPackContainsThresholds,
  isGroupTransationTextField,
  updateThresholdState,
  validateCommonFieldsForMetricThreshold
} from '../MetricThresholds.utils'
import {
  cvEnabledThresholdsExpectedResultMock,
  exceptionalGroupedCreatedMetrics,
  expectedCustomOnlyResult,
  formDataMock,
  formDataMockWithNoMetricData,
  groupedCreatedMetrics,
  groupedCreatedMetricsDefault,
  groupedCreatedMetricsForCVEnableTest,
  groupedCreatedMetricsForFailCVEnableTest,
  metricPacksMock,
  metricThresholdExpectedMock,
  metricThresholdsArrayMock,
  metricThresholdsMock,
  metricThresholdsPayloadMockData,
  mockThresholdValue,
  singleIgnoreThreshold,
  thresholdsForCVEnableTest
} from './MetricThresholds.utils.mock'

describe('AppDIgnoreThresholdTabContent', () => {
  test('should test getCriterialItems', () => {
    const items = getCriterialItems(key => key)

    expect(items).toEqual([
      { label: 'cv.monitoringSources.appD.absoluteValue', value: 'Absolute' },
      { label: 'cv.monitoringSources.appD.percentageDeviation', value: 'Percentage' }
    ])
  })

  test('should test isGroupTransationTextField', () => {
    expect(isGroupTransationTextField('Performance')).toBe(true)
    expect(isGroupTransationTextField('Errors')).toBe(true)
    expect(isGroupTransationTextField('Custom')).toBe(false)
  })

  test('should validate getActionItems', () => {
    expect(getActionItems(key => key)).toEqual([
      { label: 'cv.monitoringSources.appD.failImmediately', value: 'FailImmediately' },
      { label: 'cv.monitoringSources.appD.failAfterMultipleOccurrences', value: 'FailAfterOccurrence' },
      { label: 'cv.monitoringSources.appD.failAfterConsecutiveOccurrences', value: 'FailAfterConsecutiveOccurrence' }
    ])
  })

  test('should validate getGroupDropdownOptions', () => {
    expect(getGroupDropdownOptions(groupedCreatedMetrics)).toEqual([{ label: 'group 1', value: 'group 1' }])
  })

  test('getGroupDropdownOptions should return empty [], if there is no groupedCreatedMetrics parameter', () => {
    // casted to test the negative scenario
    expect(getGroupDropdownOptions(null as unknown as GroupedCreatedMetrics)).toEqual([])
  })

  test('should validate getGroupDropdownOptions for default group name', () => {
    expect(getGroupDropdownOptions(groupedCreatedMetricsDefault)).toEqual([])
  })

  test('should validate getGroupDropdownOptions for default group name', () => {
    expect(getGroupDropdownOptions(exceptionalGroupedCreatedMetrics)).toEqual([])
  })

  test('should check validateCommonFieldsForMetricThreshold', () => {
    const errors = {}
    const testValue: MetricThresholdType = {
      metricType: undefined,
      groupName: undefined,
      metricName: undefined,
      type: undefined,
      spec: {
        action: 'Ignore',
        spec: {}
      },
      criteria: {
        type: undefined,
        spec: {}
      }
    }
    validateCommonFieldsForMetricThreshold('ignoreThresholds', errors, [testValue], key => key, true)
    expect(errors).toEqual({
      'ignoreThresholds.0.criteria.type': 'cv.required',
      'ignoreThresholds.0.groupName': 'cv.required',
      'ignoreThresholds.0.metricName': 'cv.required',
      'ignoreThresholds.0.metricType': 'cv.required'
    })
  })

  test('should not check group validation if isValidateGroup parameter is sent as false', () => {
    const errors = {}
    const testValue: MetricThresholdType = {
      metricType: undefined,
      groupName: undefined,
      metricName: undefined,
      type: undefined,
      spec: {
        action: 'Ignore',
        spec: {}
      },
      criteria: {
        type: undefined,
        spec: {}
      }
    }
    validateCommonFieldsForMetricThreshold('ignoreThresholds', errors, [testValue], key => key, false)
    expect(errors).toEqual({
      'ignoreThresholds.0.criteria.type': 'cv.required',
      'ignoreThresholds.0.metricName': 'cv.required',
      'ignoreThresholds.0.metricType': 'cv.required'
    })
  })
  test('should check validateCommonFieldsForMetricThreshold for greater than and less than', () => {
    const errors = {}
    const testValue: MetricThresholdType = {
      metricType: 'test',
      groupName: 'test',
      metricName: 'test',
      type: 'IgnoreThreshold',
      spec: {
        action: 'FailImmediately',
        spec: {}
      },
      criteria: {
        type: MetricCriteriaValues.Absolute,
        spec: {}
      }
    }
    validateCommonFieldsForMetricThreshold('ignoreThresholds', errors, [testValue], key => key, true)
    expect(errors).toEqual({
      'ignoreThresholds.0.criteria.spec.greaterThan': 'cv.required',
      'ignoreThresholds.0.criteria.spec.lessThan': 'cv.required'
    })
  })

  test('should check validateCommonFieldsForMetricThreshold for greater than and less than are non mandatory fields - greater than empty', () => {
    const errors = {}
    const testValue: MetricThresholdType = {
      metricType: 'test',
      groupName: 'test',
      metricName: 'test',
      type: 'FailImmediately',
      spec: {
        action: 'FailImmediately',
        spec: {}
      },
      criteria: {
        type: MetricCriteriaValues.Absolute,
        spec: {
          greaterThan: 10
        }
      }
    }
    validateCommonFieldsForMetricThreshold('ignoreThresholds', errors, [testValue], key => key, true)
    expect(errors).toEqual({})
  })

  test('should check validateCommonFieldsForMetricThreshold for greater than and less than are non mandatory fields - less than empty', () => {
    const errors = {}
    const testValue: MetricThresholdType = {
      metricType: 'test',
      groupName: 'test',
      metricName: 'test',
      type: 'FailImmediately',
      spec: {
        action: 'FailImmediately',
        spec: {}
      },
      criteria: {
        type: MetricCriteriaValues.Absolute,
        spec: {
          lessThan: 10
        }
      }
    }
    validateCommonFieldsForMetricThreshold('ignoreThresholds', errors, [testValue], key => key, true)
    expect(errors).toEqual({})
  })

  test('should check validateCommonFieldsForMetricThreshold for percentage criteria', () => {
    const errors = {}
    const testValue: MetricThresholdType = {
      metricType: 'test',
      groupName: 'test',
      metricName: 'test',
      type: 'FailImmediately',
      spec: {
        action: 'FailImmediately',
        spec: {}
      },
      criteria: {
        type: MetricCriteriaValues.Percentage,
        spec: {}
      }
    }
    validateCommonFieldsForMetricThreshold('failFastThresholds', errors, [testValue], key => key, true)
    expect(errors).toEqual({ 'failFastThresholds.0.criteria.spec.greaterThan': 'cv.required' })
  })

  test('should check validateCommonFieldsForMetricThreshold for percentage criteria', () => {
    const errors = {}
    const testValue: MetricThresholdType = {
      metricType: 'test',
      groupName: 'test',
      metricName: 'test',
      type: 'FailImmediately',
      spec: {
        action: 'FailImmediately',
        spec: {}
      },
      criteria: {
        type: MetricCriteriaValues.Percentage,
        spec: {
          greaterThan: 12
        }
      }
    }
    validateCommonFieldsForMetricThreshold('failFastThresholds', errors, [testValue], key => key, true)
    expect(errors).toEqual({})
  })

  test('should check validateCommonFieldsForMetricThreshold for empty count', () => {
    const errors = {}
    const testValue: MetricThresholdType = {
      metricType: 'test',
      groupName: 'test',
      metricName: 'test',
      type: 'FailImmediately',
      spec: {
        action: 'FailAfterOccurrence',
        spec: {}
      },
      criteria: {
        type: MetricCriteriaValues.Percentage,
        spec: {
          greaterThan: 10
        }
      }
    }
    validateCommonFieldsForMetricThreshold('failFastThresholds', errors, [testValue], key => key, true)
    expect(errors).toEqual({ 'failFastThresholds.0.spec.spec.count': 'cv.required' })
  })

  test('should check validateCommonFieldsForMetricThreshold for less count', () => {
    const errors = {}
    const testValue: MetricThresholdType = {
      metricType: 'test',
      groupName: 'test',
      metricName: 'test',
      type: 'FailImmediately',
      spec: {
        action: 'FailAfterOccurrence',
        spec: {
          count: 1
        }
      },
      criteria: {
        type: MetricCriteriaValues.Percentage,
        spec: {
          greaterThan: 10
        }
      }
    }
    validateCommonFieldsForMetricThreshold('failFastThresholds', errors, [testValue], key => key, true)
    expect(errors).toEqual({ 'failFastThresholds.0.spec.spec.count': 'cv.metricThresholds.validations.countValue' })
  })

  test('should check validateCommonFieldsForMetricThreshold for greater than and less than value can have values less than 1 and decimal', () => {
    const errors = {}
    const testValue: MetricThresholdType = {
      metricType: 'test',
      groupName: 'test',
      metricName: 'test',
      type: 'FailImmediately',
      spec: {
        action: 'FailImmediately',
        spec: {}
      },
      criteria: {
        type: MetricCriteriaValues.Absolute,
        spec: {
          greaterThan: 0.32
        }
      }
    }
    validateCommonFieldsForMetricThreshold('failFastThresholds', errors, [testValue], key => key, true)
    expect(errors).toEqual({})
  })

  test('should check validateCommonFieldsForMetricThreshold shows error if any of the criteria spec value is 0', () => {
    const errors = {}
    const testValue: MetricThresholdType = {
      metricType: 'test',
      groupName: 'test',
      metricName: 'test',
      type: 'FailImmediately',
      spec: {
        action: 'FailImmediately',
        spec: {}
      },
      criteria: {
        type: MetricCriteriaValues.Absolute,
        spec: {
          greaterThan: 0,
          lessThan: 1
        }
      }
    }
    validateCommonFieldsForMetricThreshold('failFastThresholds', errors, [testValue], key => key, true)
    expect(errors).toEqual({
      'failFastThresholds.0.criteria.spec.greaterThan': 'cv.required'
    })
  })

  test('should check validateCommonFieldsForMetricThreshold handles null threshold value', () => {
    const errors = {}

    validateCommonFieldsForMetricThreshold('failFastThresholds', errors, null, key => key, true)
    expect(errors).toEqual({})
  })

  test('checkDuplicate function should show error if there are duplicate thresholds', () => {
    const errors = {}

    const testValue: MetricThresholdType[] = [
      { ...(mockThresholdValue as MetricThresholdType) },
      { ...(mockThresholdValue as MetricThresholdType) }
    ]

    checkDuplicate('ignoreThresholds', testValue, errors, true, key => key)

    expect(errors).toEqual({ 'ignoreThresholds.0.metricType': 'cv.metricThresholds.validations.duplicateThreshold' })
  })

  test('checkDuplicate function should not show error if there are no duplicate thresholds', () => {
    const errors = {}

    const updatedValue: MetricThresholdType = { ...mockThresholdValue, groupName: 'G1' } as MetricThresholdType

    const testValue: MetricThresholdType[] = [{ ...(mockThresholdValue as MetricThresholdType) }, { ...updatedValue }]

    checkDuplicate('ignoreThresholds', testValue, errors, true, key => key)

    expect(errors).toEqual({})
  })

  test('checkDuplicate function should show error at first found correct duplicate threshold', () => {
    const errors = {}

    const updatedValue: MetricThresholdType = { ...mockThresholdValue, groupName: 'G1' } as MetricThresholdType

    const testValue: MetricThresholdType[] = [
      { ...(mockThresholdValue as MetricThresholdType) },
      { ...updatedValue },
      { ...updatedValue }
    ]

    checkDuplicate('ignoreThresholds', testValue, errors, true, key => key)

    expect(errors).toEqual({ 'ignoreThresholds.1.metricType': 'cv.metricThresholds.validations.duplicateThreshold' })
  })

  test('checkDuplicate function should show error if any of the value is undefined', () => {
    const errors = {}

    const updatedValue: MetricThresholdType = { ...mockThresholdValue, metricName: undefined } as MetricThresholdType

    const testValue: MetricThresholdType[] = [{ ...updatedValue }, { ...updatedValue }]

    checkDuplicate('ignoreThresholds', testValue, errors, true, key => key)

    expect(errors).toEqual({})
  })

  test('checkDuplicate function should not consider groupName is undefined if isValidateGroup flag is false', () => {
    const errors = {}

    const updatedValue: MetricThresholdType = { ...mockThresholdValue, groupName: undefined } as MetricThresholdType

    const testValue: MetricThresholdType[] = [{ ...(mockThresholdValue as MetricThresholdType) }, { ...updatedValue }]

    checkDuplicate('ignoreThresholds', testValue, errors, false, key => key)

    expect(errors).toEqual({ 'ignoreThresholds.0.metricType': 'cv.metricThresholds.validations.duplicateThreshold' })
  })

  test('checkDuplicate function should not consider different groupName if isValidateGroup flag is false', () => {
    const errors = {}

    const updatedValue: MetricThresholdType = { ...mockThresholdValue, groupName: 'G1' } as MetricThresholdType
    const updatedValue2: MetricThresholdType = { ...mockThresholdValue, groupName: 'G2' } as MetricThresholdType

    const testValue: MetricThresholdType[] = [{ ...updatedValue2 }, { ...updatedValue }]

    checkDuplicate('ignoreThresholds', testValue, errors, false, key => key)

    expect(errors).toEqual({ 'ignoreThresholds.0.metricType': 'cv.metricThresholds.validations.duplicateThreshold' })
  })

  test('checkDuplicate function should not show error if we have only one threshold', () => {
    const errors = {}

    const testValue: MetricThresholdType[] = [{ ...(mockThresholdValue as MetricThresholdType) }]

    checkDuplicate('ignoreThresholds', testValue, errors, true, key => key)

    expect(errors).toEqual({})
  })

  test('should check percentage validation', () => {
    const errors = {}
    const testValue: MetricThresholdType = {
      metricType: 'test',
      groupName: 'test',
      metricName: 'test',
      type: 'FailImmediately',
      spec: {
        action: 'FailAfterOccurrence',
        spec: {
          count: 4
        }
      },
      criteria: {
        type: MetricCriteriaValues.Percentage,
        spec: {
          greaterThan: 101
        }
      }
    }
    validateCommonFieldsForMetricThreshold('failFastThresholds', errors, [testValue], key => key, true)
    expect(errors).toEqual({
      'failFastThresholds.0.criteria.spec.greaterThan': 'cv.metricThresholds.validations.percentageValidation'
    })
  })

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

  test('getMetricItems should return metric names whose CV is enabled', () => {
    const result = getMetricItems([], 'Custom', 'group 1', groupedCreatedMetricsForCVEnableTest)
    expect(result).toEqual([
      { label: 'metric 1', value: 'metric 1' },
      { label: 'metric 3', value: 'metric 3' }
    ])
  })

  test('getDefaultValueForMetricType should return correct value', () => {
    let result = getDefaultValueForMetricType({ Performance: false, Errors: true })

    expect(result).toBe(undefined)

    result = getDefaultValueForMetricType({ Performance: false, Errors: true }, metricPacksMock)
    expect(result).toBe('Errors')

    result = getDefaultValueForMetricType({ Performance: true, Errors: false }, metricPacksMock)
    expect(result).toBe('Performance')

    result = getDefaultValueForMetricType({ Performance: false, Errors: false }, metricPacksMock)
    expect(result).toBe(undefined)

    result = getDefaultValueForMetricType({ Performance: false, Errors: false }, metricPacksMock, true)
    expect(result).toBe('Custom')
  })

  test('updateThresholdState should return correct value', () => {
    const result = updateThresholdState(
      { ignoreThresholds: [], failFastThresholds: [] },
      {
        ignoreThresholds: [singleIgnoreThreshold]
      }
    )

    expect(result).toEqual({
      failFastThresholds: [],
      ignoreThresholds: [singleIgnoreThreshold]
    })
  })

  test('getDefaultMetricTypeValue should return correct value', () => {
    let result = getDefaultMetricTypeValue({ Performance: false, Errors: true })

    expect(result).toBe(undefined)

    result = getDefaultMetricTypeValue({ Performance: false, Errors: true }, metricPacksMock)
    expect(result).toBe('Errors')

    result = getDefaultMetricTypeValue({ Performance: true, Errors: false }, metricPacksMock)
    expect(result).toBe('Performance')

    result = getDefaultMetricTypeValue({ Infrastructure: true, Errors: false }, metricPacksMock)
    expect(result).toBe('Infrastructure')

    result = getDefaultMetricTypeValue({ Performance: false, Errors: false }, metricPacksMock)
    expect(result).toBe(undefined)
  })

  test('should test getFilteredMetricThresholdValues', () => {
    const result = getFilteredMetricThresholdValues(
      'IgnoreThreshold',
      metricThresholdsPayloadMockData as TimeSeriesMetricPackDTO[]
    )

    expect(result).toEqual([
      {
        criteria: { spec: { lessThan: 1 }, type: 'Percentage' },
        groupName: 'testP2',
        metricName: 'average_wait_time_ms',
        metricType: 'Performance',
        spec: { action: 'Ignore' },
        type: 'IgnoreThreshold'
      },
      {
        criteria: { spec: { greaterThan: 12 }, type: 'Percentage' },
        groupName: 'testP',
        metricName: 'stall_count',
        metricType: 'Performance',
        spec: { action: 'Ignore' },
        type: 'IgnoreThreshold'
      },
      {
        criteria: { spec: { greaterThan: 12 }, type: 'Percentage' },
        groupName: 'testP',
        metricName: 'stall_count',
        metricType: 'Custom',
        spec: { action: 'Ignore' },
        type: 'IgnoreThreshold'
      }
    ])
  })

  test('getMetricPacksForPayload should ignore custom, if it is present in metric packs', () => {
    const result = getMetricPacksForPayload(formDataMock, true)
    expect(result).toEqual(metricThresholdsPayloadMockData)
  })

  test('getMetricPacksForPayload should give custom thresholds, though there is no metric pack values selected', () => {
    const result = getMetricPacksForPayload(formDataMockWithNoMetricData, true)
    expect(result).toEqual(expectedCustomOnlyResult)
  })

  test('getIsMetricPacksSelected returns true if atleast one metric pack is selected', () => {
    const result = getIsMetricPacksSelected({ Performance: true })

    expect(result).toBe(true)
  })

  test('getIsMetricPacksSelected returns false if none of the metric pack is selected', () => {
    const result = getIsMetricPacksSelected({ Performance: false, Errors: false })

    expect(result).toBe(false)
  })

  test('getIsMetricPacksSelected returns false if only Custom metric data is enabled', () => {
    const result = getIsMetricPacksSelected({ Performance: false, Errors: false, Custom: true })

    expect(result).toBe(false)
  })

  test('getMetricItemsForOnlyCustomMetrics should return correct output', () => {
    const result = getMetricItemsForOnlyCustomMetrics(groupedCreatedMetrics)

    expect(result).toEqual([{ label: 'test metric', value: 'test metric' }])
  })

  test('getMetricItemsForOnlyCustomMetrics should return empty array if no group is created', () => {
    const result = getMetricItemsForOnlyCustomMetrics({})

    expect(result).toEqual([])
  })

  test('getMetricNameItems should return all the metric names if the isOnlyCustomMetricHealthSource flag is true', () => {
    const result = getMetricNameItems(groupedCreatedMetrics, [], '', '', true)

    expect(result).toEqual([{ label: 'test metric', value: 'test metric' }])
  })
  test('getFilteredCVDisabledMetricThresholds should return only thresholds with metric enabled with CV', () => {
    const result = getFilteredCVDisabledMetricThresholds(
      thresholdsForCVEnableTest.ignoreThresgholds,
      thresholdsForCVEnableTest.failFastThresholds,
      groupedCreatedMetricsForCVEnableTest
    )

    expect(result).toEqual(cvEnabledThresholdsExpectedResultMock)
  })

  test('getFilteredCVDisabledMetricThresholds should return empty array if no threshold values are passed', () => {
    // ℹ️ Casted to test negative scenario
    const result = getFilteredCVDisabledMetricThresholds(
      [],
      null as unknown as MetricThresholdType[],
      groupedCreatedMetricsForCVEnableTest
    )

    expect(result).toEqual({
      ignoreThresholds: [],
      failFastThresholds: []
    })
  })

  test('getMetricsWithCVEnabled should return correct metric names whose CV is enabled', () => {
    const result = getMetricsWithCVEnabled(groupedCreatedMetricsForCVEnableTest)

    expect(result).toEqual(['metric 1', 'metric 3', 'metric 5'])
  })

  test('getIsMetricThresholdCanBeShown should return true if atleast one metric pack is selected', () => {
    const result = getIsMetricThresholdCanBeShown({ performance: true }, {})

    expect(result).toEqual(true)
  })

  test('getIsMetricThresholdCanBeShown should return false if no metric pack is selected and no groups with CV is created', () => {
    const result = getIsMetricThresholdCanBeShown({ performance: false }, groupedCreatedMetricsForFailCVEnableTest)

    expect(result).toEqual(false)
  })

  test('getIsMetricThresholdCanBeShown should return true if no metric pack is selected and atleast groups with CV is created', () => {
    const result = getIsMetricThresholdCanBeShown({ performance: false }, groupedCreatedMetricsForCVEnableTest)

    expect(result).toEqual(true)
  })

  test('getIsMetricThresholdCanBeShown should return false if no valid metric pack or group is sent', () => {
    // ℹ️ Casted to test unexpected scenario, to test robustness
    const result = getIsMetricThresholdCanBeShown(
      null as unknown as Record<string, boolean>,
      null as unknown as GroupedCreatedMetrics
    )

    expect(result).toEqual(false)

    // ℹ️ Casted to test unexpected scenario, to test robustness
    const result2 = getIsMetricThresholdCanBeShown({}, null as unknown as GroupedCreatedMetrics)

    expect(result2).toEqual(false)
  })

  test('getCustomMetricGroupNames should return group names which atleast contains one metric whose CV is enabled', () => {
    const result = getCustomMetricGroupNames(groupedCreatedMetricsForCVEnableTest)

    expect(result).toEqual(['group 1', 'group 2'])

    const result2 = getCustomMetricGroupNames(groupedCreatedMetricsForFailCVEnableTest)

    expect(result2).toEqual([])
  })

  test('isGivenMetricPackContainsThresholds should return false if not valid parameters are passed', () => {
    // ℹ️ Casted to test unexpected scenario, to test function robustness
    const result = isGivenMetricPackContainsThresholds(
      null as unknown as Record<ThresholdsPropertyNames, MetricThresholdType[]>,
      'test'
    )

    expect(result).toBe(false)

    const result2 = isGivenMetricPackContainsThresholds(metricThresholdsMock, null as unknown as string)

    expect(result2).toBe(false)
  })

  test('isGivenMetricPackContainsThresholds should return true if metric pack contains thresholds', () => {
    const result = isGivenMetricPackContainsThresholds(metricThresholdsMock, 'test1')

    expect(result).toBe(true)
  })

  test('isGivenMetricPackContainsThresholds should return false if metric pack contains thresholds', () => {
    const result = isGivenMetricPackContainsThresholds(metricThresholdsMock, 'test2')

    expect(result).toBe(false)
  })

  test('isGivenMetricNameContainsThresholds should return false if not valid parameters are passed', () => {
    // ℹ️ Casted to test unexpected scenario, to test function robustness
    const result = isGivenMetricNameContainsThresholds(
      null as unknown as Record<ThresholdsPropertyNames, MetricThresholdType[]>,
      'test'
    )

    expect(result).toBe(false)

    const result2 = isGivenMetricNameContainsThresholds(metricThresholdsMock, null as unknown as string)

    expect(result2).toBe(false)
  })

  test('isGivenMetricNameContainsThresholds should return true if metric name contains thresholds', () => {
    const result = isGivenMetricNameContainsThresholds(metricThresholdsMock, 'testMetricName')

    expect(result).toBe(true)
  })

  test('isGivenMetricNameContainsThresholds should return false if metric name contains thresholds', () => {
    const result = isGivenMetricNameContainsThresholds(metricThresholdsMock, 'testMetricName2')

    expect(result).toBe(false)
  })

  test('getIsRemovedMetricPackContainsMetricThresholds should return false if a metric pack is added', () => {
    const result = getIsRemovedMetricPackContainsMetricThresholds(true, metricThresholdsMock, 'test1', true)

    expect(result).toBe(false)
  })

  test('getIsRemovedMetricPackContainsMetricThresholds should return false if no valid values are passed', () => {
    // ℹ️ Casted to test unexpected scenario, to test function robustness
    const result = getIsRemovedMetricPackContainsMetricThresholds(
      true,
      null as unknown as Record<ThresholdsPropertyNames, MetricThresholdType[]>,
      'test1',
      false
    )

    expect(result).toBe(false)

    // ℹ️ Casted to test unexpected scenario, to test function robustness
    const result2 = getIsRemovedMetricPackContainsMetricThresholds(
      true,
      metricThresholdsMock,
      null as unknown as string,
      false
    )

    expect(result2).toBe(false)
  })

  test('getIsRemovedMetricPackContainsMetricThresholds should return false metric thresholds is  disabled', () => {
    const result = getIsRemovedMetricPackContainsMetricThresholds(false, metricThresholdsMock, 'test1', false)

    expect(result).toBe(false)
  })

  test('getIsRemovedMetricPackContainsMetricThresholds should return true if a metric pack is being removed and that contains any metric thresholds', () => {
    const result = getIsRemovedMetricPackContainsMetricThresholds(true, metricThresholdsMock, 'test1', false)

    expect(result).toBe(true)
  })

  test('getIsRemovedMetricNameContainsMetricThresholds should return true if given metric name contains thresholds', () => {
    const result = getIsRemovedMetricNameContainsMetricThresholds(true, metricThresholdsMock, 'testMetricName')

    expect(result).toBe(true)
  })

  test('getIsRemovedMetricNameContainsMetricThresholds should return false if no valid values are passed', () => {
    // ℹ️ Casted to test unexpected scenario, to test function robustness
    const result = getIsRemovedMetricNameContainsMetricThresholds(
      true,
      null as unknown as Record<ThresholdsPropertyNames, MetricThresholdType[]>,
      'test1'
    )

    expect(result).toBe(false)

    // ℹ️ Casted to test unexpected scenario, to test function robustness
    const result2 = getIsRemovedMetricNameContainsMetricThresholds(
      true,
      metricThresholdsMock,
      null as unknown as string
    )

    expect(result2).toBe(false)
  })

  test('getIsRemovedMetricNameContainsMetricThresholds should return false metric thresholds is  disabled', () => {
    const result = getIsRemovedMetricNameContainsMetricThresholds(false, metricThresholdsMock, 'test1')

    expect(result).toBe(false)
  })

  test('getMetricThresholdsCustomFiltered should return empty [], if not a valid metricThresholds is passed', () => {
    // ℹ️ Casted to test unexpected scenario, to test function robustness
    const result = getMetricThresholdsCustomFiltered(null as unknown as MetricThresholdType[], () => true)

    expect(result).toEqual([])
  })

  test('getMetricThresholdsCustomFiltered should return empty [], if not a valid metricThresholds is empty []', () => {
    // ℹ️ Casted to test unexpected scenario, to test function robustness
    const result = getMetricThresholdsCustomFiltered([], () => true)

    expect(result).toEqual([])
  })

  test('getMetricThresholdsCustomFiltered should return empty [], if not a valid metricThresholds is empty []', () => {
    const result = getMetricThresholdsCustomFiltered(
      metricThresholdsArrayMock,
      threshold => threshold.metricName === 'average_response_time_ms'
    )

    expect(result).toEqual(metricThresholdExpectedMock)
  })
})
