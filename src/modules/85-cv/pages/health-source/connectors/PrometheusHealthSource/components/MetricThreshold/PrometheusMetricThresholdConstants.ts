/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { createContext } from 'react'
import {
  IgnoreThresholdType,
  MetricCriteriaValues,
  MetricThresholdTypes,
  MetricTypeValues
} from '@cv/pages/health-source/common/MetricThresholds/MetricThresholds.constants'
import type { PrometheusMetricThresholdContextType, SelectItem } from './PrometheusMetricThreshold.types'

export const PrometheusMetricThresholdContext = createContext<PrometheusMetricThresholdContextType>(
  {} as PrometheusMetricThresholdContextType
)

PrometheusMetricThresholdContext.displayName = 'PrometheusMetricThresholdContext'

export const FailFastActionValues = {
  FailImmediately: 'FailImmediately',
  FailAfterOccurrences: 'FailAfterOccurrences',
  FailAfterConsecutiveOccurrences: 'FailAfterConsecutiveOccurrences'
}

export const PercentageCriteriaDropdownValues = {
  GreaterThan: 'greaterThan',
  LessThan: 'lessThan'
}

export const CustomMetricDropdownOption: SelectItem = {
  label: MetricTypeValues.Custom,
  value: MetricTypeValues.Custom
}

export const NewDefaultVauesForIgnoreThreshold = {
  metricType: MetricTypeValues.Custom,
  type: MetricThresholdTypes.IgnoreThreshold,
  spec: {
    action: IgnoreThresholdType
  },
  criteria: {
    type: MetricCriteriaValues.Absolute,
    spec: {}
  }
}

export const NewDefaultVauesForFailFastThreshold = {
  metricType: MetricTypeValues.Custom,
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

export const MetricTypesForTransactionTextField = [MetricTypeValues.Performance, MetricTypeValues.Errors]
