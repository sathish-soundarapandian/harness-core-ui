/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type {
  AvailableThresholdTypes,
  CriteriaThresholdValues,
  MetricThresholdType,
  ThresholdsPropertyNames
} from './MetricThresholds.types'

interface SelectItem {
  label: string
  value: string
}

export const IgnoreThresholdType = 'Ignore'

export const MetricCriteriaValues: Record<string, 'Absolute' | 'Percentage'> = {
  Absolute: 'Absolute',
  Percentage: 'Percentage'
}

export const MetricTypeValues = {
  Performance: 'Performance',
  Custom: 'Custom',
  Errors: 'Errors'
}

export const MetricTypesForTransactionTextField = [MetricTypeValues.Performance, MetricTypeValues.Errors]

export const CustomMetricDropdownOption: SelectItem = {
  label: MetricTypeValues.Custom,
  value: MetricTypeValues.Custom
}

export const MetricThresholdTypes: Record<string, AvailableThresholdTypes> = {
  IgnoreThreshold: 'IgnoreThreshold',
  FailImmediately: 'FailImmediately'
}

export const MetricThresholdPropertyName: Record<string, ThresholdsPropertyNames> = {
  IgnoreThreshold: 'ignoreThresholds',
  FailFastThresholds: 'failFastThresholds'
}

export const PercentageCriteriaDropdownValues: Record<string, CriteriaThresholdValues> = {
  GreaterThan: 'greaterThan',
  LessThan: 'lessThan'
}

export const FailFastActionValues: Record<
  string,
  'FailImmediately' | 'FailAfterOccurrence' | 'FailAfterConsecutiveOccurrence'
> = {
  FailImmediately: 'FailImmediately',
  FailAfterOccurrences: 'FailAfterOccurrence',
  FailAfterConsecutiveOccurrences: 'FailAfterConsecutiveOccurrence'
}

export const DefaultCustomMetricGroupName = 'Please Select Group Name'
export const ExceptionGroupName = '+ Add New'

export const NewDefaultVauesForIgnoreThreshold: MetricThresholdType = {
  type: MetricThresholdTypes.IgnoreThreshold,
  spec: {
    action: IgnoreThresholdType
  },
  criteria: {
    type: MetricCriteriaValues.Absolute,
    spec: {}
  }
}

export const NewDefaultVauesForFailFastThreshold: MetricThresholdType = {
  type: MetricThresholdTypes.FailImmediately,
  spec: {
    action: FailFastActionValues.FailImmediately,
    spec: {}
  },
  criteria: {
    type: MetricCriteriaValues.Absolute,
    spec: {}
  }
}
