/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { MetricThresholdType } from '@cv/pages/health-source/connectors/AppDynamics/AppDHealthSource.types'
import { MetricCriteriaValues, PercentageCriteriaDropdownValues } from '../MetricThresholds.constants'
import {
  checkDuplicate,
  getActionItems,
  getCriterialItems,
  getCriteriaPercentageDropdownOptions,
  getGroupDropdownOptions,
  getIsShowGreaterThan,
  getIsShowLessThan,
  isGroupTransationTextField,
  validateCommonFieldsForMetricThreshold
} from '../MetricThresholds.utils'
import {
  exceptionalGroupedCreatedMetrics,
  groupedCreatedMetrics,
  groupedCreatedMetricsDefault,
  mockThresholdValue
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

  test('should check validateCommonFieldsForMetricThreshold for greater than should be smaller than less than', () => {
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
          greaterThan: 10,
          lessThan: 5
        }
      }
    }
    validateCommonFieldsForMetricThreshold('ignoreThresholds', errors, [testValue], key => key, true)
    expect(errors).toEqual({
      'ignoreThresholds.0.criteria.spec.greaterThan': 'cv.metricThresholds.validations.greaterThanSmaller',
      'ignoreThresholds.0.criteria.spec.lessThan': 'cv.metricThresholds.validations.lessThanBigger'
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
})
