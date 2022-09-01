/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { MetricThresholdType } from '@cv/pages/health-source/connectors/AppDynamics/AppDHealthSource.types'
import type { TimeSeriesMetricPackDTO } from 'services/cv'
import type { GroupedCreatedMetrics } from '../../CustomMetric/CustomMetric.types'

import { MetricCriteriaValues, PercentageCriteriaDropdownValues } from '../MetricThresholds.constants'
import {
  checkDuplicate,
  getActionItems,
  getCriterialItems,
  getCriteriaPercentageDropdownOptions,
  getCustomMetricGroupNames,
  getDefaultMetricTypeValue,
  getDefaultValueForMetricType,
  getFilteredCVDisabledMetricThresholds,
  getFilteredMetricThresholdValues,
  getGroupDropdownOptions,
  getIsMetricPacksSelected,
  getIsMetricThresholdCanBeShown,
  getIsShowGreaterThan,
  getIsShowLessThan,
  getMetricItems,
  getMetricItemsForOnlyCustomMetrics,
  getMetricNameItems,
  getMetricPacksForPayload,
  getMetricsWithCVEnabled,
  isGroupTransationTextField,
  updateThresholdState,
  validateCommonFieldsForMetricThreshold
} from '../MetricThresholds.utils'
import {
  cvEnabledThresholdsExpectedResultMock,
  exceptionalGroupedCreatedMetrics,
  formDataMock,
  groupedCreatedMetrics,
  groupedCreatedMetricsDefault,
  groupedCreatedMetricsForCVEnableTest,
  groupedCreatedMetricsForFailCVEnableTest,
  metricPacksMock,
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
  test('should test getCriteriaPercentageDropdownOptions', () => {
    const items = getCriteriaPercentageDropdownOptions(key => key)

    expect(items).toEqual([
      { label: 'cv.monitoringSources.appD.greaterThan', value: 'greaterThan' },
      { label: 'cv.monitoringSources.appD.lesserThan', value: 'lessThan' }
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
      'ignoreThresholds.0.criteria.type': 'cv.metricThresholds.validations.criteria',
      'ignoreThresholds.0.groupName': 'cv.metricThresholds.validations.groupTransaction',
      'ignoreThresholds.0.metricName': 'cv.metricThresholds.validations.metricName',
      'ignoreThresholds.0.metricType': 'cv.metricThresholds.validations.metricType'
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
      'ignoreThresholds.0.criteria.type': 'cv.metricThresholds.validations.criteria',
      'ignoreThresholds.0.metricName': 'cv.metricThresholds.validations.metricName',
      'ignoreThresholds.0.metricType': 'cv.metricThresholds.validations.metricType'
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
        criteriaPercentageType: PercentageCriteriaDropdownValues.GreaterThan,
        spec: {}
      }
    }
    validateCommonFieldsForMetricThreshold('ignoreThresholds', errors, [testValue], key => key, true)
    expect(errors).toEqual({ 'ignoreThresholds.0.criteria.spec.greaterThan': 'cv.required' })
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
        criteriaPercentageType: PercentageCriteriaDropdownValues.LessThan,
        spec: {}
      }
    }
    validateCommonFieldsForMetricThreshold('ignoreThresholds', errors, [testValue], key => key, true)
    expect(errors).toEqual({ 'ignoreThresholds.0.criteria.spec.lessThan': 'cv.required' })
  })

  test('should check validateCommonFieldsForMetricThreshold for count', () => {
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
        criteriaPercentageType: PercentageCriteriaDropdownValues.LessThan,
        spec: {
          lessThan: 10
        }
      }
    }
    validateCommonFieldsForMetricThreshold('failFastThresholds', errors, [testValue], key => key, true)
    expect(errors).toEqual({ 'failFastThresholds.0.spec.spec.count': 'cv.required' })
  })

  test('should check validateCommonFieldsForMetricThreshold for count', () => {
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
        criteriaPercentageType: PercentageCriteriaDropdownValues.LessThan,
        spec: {
          lessThan: 10
        }
      }
    }
    validateCommonFieldsForMetricThreshold('failFastThresholds', errors, [testValue], key => key, true)
    expect(errors).toEqual({ 'failFastThresholds.0.spec.spec.count': 'cv.metricThresholds.validations.countValue' })
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
        criteriaPercentageType: PercentageCriteriaDropdownValues.LessThan,
        spec: {
          lessThan: 101
        }
      }
    }
    validateCommonFieldsForMetricThreshold('failFastThresholds', errors, [testValue], key => key, true)
    expect(errors).toEqual({
      'failFastThresholds.0.criteria.spec.lessThan': 'cv.metricThresholds.validations.percentageValidation'
    })
  })

  test('getIsShowGreaterThan function returns correct values', () => {
    // Absolute criteria selected
    let result = getIsShowGreaterThan('Absolute')

    expect(result).toBe(true)

    // Percentage criteria is selected and Greater than criteriaPercentageType is selected
    result = getIsShowGreaterThan('Percentage', 'greaterThan')

    expect(result).toBe(true)

    // Percentage criteria is selected and API response has greaterThan value
    result = getIsShowGreaterThan('Percentage', undefined, { greaterThan: 21, lessThan: undefined })

    expect(result).toBe(true)

    // False for less than selection it should be false
    result = getIsShowGreaterThan('Percentage', 'lessThan', { greaterThan: undefined, lessThan: 4 })

    expect(result).toBe(false)
  })

  test('getIsShowLessThan function returns correct values', () => {
    // Absolute criteria selected
    let result = getIsShowLessThan('Absolute')

    expect(result).toBe(true)

    // Percentage criteria is selected and Less than criteriaPercentageType is selected
    result = getIsShowLessThan('Percentage', 'lessThan')

    expect(result).toBe(true)

    // Percentage criteria is selected and API response has lessThan value
    result = getIsShowLessThan('Percentage', undefined, { greaterThan: undefined, lessThan: 21 })

    expect(result).toBe(true)

    // False for greaterThan selection it should be false
    result = getIsShowLessThan('Percentage', 'greaterThan', { greaterThan: 44, lessThan: undefined })

    expect(result).toBe(false)
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
        criteria: { criteriaPercentageType: 'lessThan', spec: { lessThan: 1 }, type: 'Percentage' },
        groupName: 'testP2',
        metricName: 'average_wait_time_ms',
        metricType: 'Performance',
        spec: { action: 'Ignore' },
        type: 'IgnoreThreshold'
      },
      {
        criteria: { criteriaPercentageType: 'greaterThan', spec: { greaterThan: 12 }, type: 'Percentage' },
        groupName: 'testP',
        metricName: 'stall_count',
        metricType: 'Performance',
        spec: { action: 'Ignore' },
        type: 'IgnoreThreshold'
      },
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

  test('getMetricPacksForPayload should ignore custom, if it is present in metric packs', () => {
    const result = getMetricPacksForPayload(formDataMock, true)
    expect(result).toEqual(metricThresholdsPayloadMockData)
  })

  test('getIsMetricPacksSelected returns true if atleast one metric pack is selected', () => {
    const result = getIsMetricPacksSelected({ Performance: true })

    expect(result).toBe(true)
  })

  test('getIsMetricPacksSelected returns true if atleast one metric pack is selected', () => {
    const result = getIsMetricPacksSelected({ Performance: false, Errors: false })

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
})
