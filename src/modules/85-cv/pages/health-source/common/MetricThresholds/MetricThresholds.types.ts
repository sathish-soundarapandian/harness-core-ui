/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SelectOption, SelectProps } from '@harness/uicore'
import type { GroupedCreatedMetrics } from '@cv/components/MultiItemsSideNav/components/SelectedAppsSideNav/components/GroupedSideNav/GroupedSideNav.types'
import type {
  FailMetricThresholdSpec,
  MetricThreshold,
  MetricThresholdCriteria,
  MetricThresholdSpec,
  TimeSeriesMetricPackDTO
} from 'services/cv'

export type AvailableThresholdTypes = MetricThreshold['type']

export type CriteriaThresholdValues = 'greaterThan' | 'lessThan'

export type ThresholdsPropertyNames = 'ignoreThresholds' | 'failFastThresholds'

export interface SelectItem {
  label: string
  value: string
}

interface CriteriaPercentageType {
  criteriaPercentageType?: CriteriaThresholdValues
}

export type MetricThresholdType = MetricThreshold & {
  criteria: MetricThreshold['criteria'] & CriteriaPercentageType
  metricType?: string
  spec?: MetricThresholdSpec & FailMetricThresholdSpec
}

export interface ThresholdCriteriaPropsType {
  criteriaType?: MetricThresholdCriteria['type']
  index: number
  thresholdTypeName: ThresholdsPropertyNames
  replaceFn: (value: MetricThresholdType) => void
  criteriaPercentageType?: CriteriaThresholdValues
}

export type ThresholdSelectProps = {
  name: string
  items: SelectItem[]
  onChange?: (value: SelectOption) => void
  key?: string
  disabled?: boolean
  className?: string
} & SelectProps

export interface ThresholdGroupType {
  name: string
  metricType?: string
  index: number
  handleTransactionUpdate: (index: number, value: string, replaceFn: (value: MetricThresholdType) => void) => void
  placeholder: string
  replaceFn: (value: MetricThresholdType) => void
  groupedCreatedMetrics: GroupedCreatedMetrics
}

export interface CommonFormTypesForMetricThresholds {
  ignoreThresholds: MetricThresholdType[]
  failFastThresholds: MetricThresholdType[]
}

export interface MetricThresholdsTabProps {
  IgnoreThresholdTabContent: React.ComponentType
  FailFastThresholdTabContent: React.ComponentType
}

export interface BasicFormInterface {
  ignoreThresholds: MetricThresholdType[]
  failFastThresholds: MetricThresholdType[]
  metricData: Record<string, boolean>
}

interface ThresholdsCommonPropTypes<T> {
  formValues: T & BasicFormInterface
  metricPacks: TimeSeriesMetricPackDTO[]
  groupedCreatedMetrics: GroupedCreatedMetrics
}

export type IgnoreThresholdsFieldArrayInterface<T> = ThresholdsCommonPropTypes<T>
export type FailFasthresholdsFieldArrayInterface<T> = ThresholdsCommonPropTypes<T>
